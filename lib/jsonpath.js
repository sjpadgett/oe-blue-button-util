/*global module, exports, require*/
/*jslint vars:true, evil:true*/
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

'use strict';

var vm = require('vm');
var _ = require("lodash");

var arrayset = require('./arrayset');

var append = arrayset.append;

function push(arr, elem) {
    arr = arr.slice();
    arr.push(elem);
    return arr;
}

var properties = function (obj) {
    if (Array.isArray(obj)) {
        return _.range(obj.length);
    } else if (typeof obj === 'object') {
        return Object.keys(obj);
    } else {
        return null;
    }
};

var sliceToProperties = function (expr, obj) {
    var len = obj.length;
    var parts = expr.split(':');
    var start = (parts[0] && parseInt(parts[0], 10)) || 0;
    var end = (parts[1] && parseInt(parts[1], 10)) || len;
    var step = (parts[2] && parseInt(parts[2], 10)) || 1;
    start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
    end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
    return _.range(start, end, step);
};

var asPath = function (path) {
    var i, n, x = path,
        p = '$';
    for (i = 1, n = x.length; i < n; i++) {
        p += /^[0-9*]+$/.test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']");
    }
    return p;
};

var normalize = exports.normalize = function (expr) {
    var subx = [];
    var normalized = expr.replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) {
            return '[#' + (subx.push($1) - 1) + ']';
        })
        .replace(/'?\.'?|\['?/g, ';')
        .replace(/(?:;)?(\^+)(?:;)?/g, function ($0, ups) {
            return ';' + ups.split('').join(';') + ';';
        })
        .replace(/;;;|;;/g, ';..;')
        .replace(/;$|'?\]|'$/g, '');
    var exprList = normalized.split(';').map(function (expr) {
        var match = expr.match(/#([0-9]+)/);
        return !match || !match[1] ? expr : subx[match[1]];
    });
    return exprList;
};

var processOptions = function (opts) {
    return {
        resultType: (opts && opts.resultType && opts.resultType.toLowerCase()) || 'value',
        flatten: (opts && opts.flatten) || false,
        wrap: (opts && opts.hasOwnProperty('wrap')) ? opts.wrap : true,
        sandbox: (opts && opts.sandbox) || {}
    };
};

var jsonPathMethods = {
    evaluate: function (obj, exprList) {
        this._obj = obj;
        if (exprList && obj) {
            if (exprList[0] === '$' && exprList.length > 1) {
                exprList.shift();
            }
            var result = this.trace(exprList, obj, ['$']);
            return result;
        }
    },
    allProperties: function (actions, obj, path) {
        var ps = properties(obj);
        return this.traceProperties(ps, actions, obj, path);
    },
    traceProperties: function (properties, actions, obj, path) {
        var result = [];
        if (properties) {
            properties.forEach(function (p) {
                var v = this.traceProperty(p, actions, obj, path);
                append(result, v);
            }, this);
        }
        return this.transferResult(obj, result);
    },
    traceProperty: function (property, actions, obj, path) {
        var result = [];
        if (obj && obj.hasOwnProperty(property)) {
            var v = this.trace(actions, obj[property], push(path, property));
            append(result, v);
        }
        return this.transferResult(obj, result);
    },
    allDeepProperties: function (actions, obj, path) {
        var result = [];
        var rootResult = this.trace(actions, obj, path);
        append(result, rootResult);
        var ps = properties(obj);
        if (ps) {
            ps = ps.filter(function (p) {
                return typeof obj[p] === 'object';
            });
        }
        if (ps) {
            ps.forEach(function (p) {
                var v = this.allDeepProperties(actions, obj[p], push(path, p));
                append(result, v);
            }, this);
        }
        return this.transferResult(obj, result);
    },
    expressionProperties: function (expression) {
        return function (actions, obj, path) {
            var result = [];
            var property = this.eval(expression, obj, path[path.length], path);
            return this.traceProperty(property, actions, obj, path);
        };
    },
    filteredProperties: function (expression) {
        return function (actions, obj, path) {
            var ps = properties(obj);
            if (ps) {
                var locHere = expression.replace(/^\?\((.*?)\)$/, '$1');
                ps = ps.filter(function (p) {
                    return this.eval(locHere, obj[p], p, path);
                }, this);
            }
            return this.traceProperties(ps, actions, obj, path);
        };
    },
    listProperties: function (listExpression) {
        var properties = listExpression.split(',');
        return function (actions, obj, path) {
            return this.traceProperties(properties, actions, obj, path);
        };
    },
    indexProperties: function (indicesExpression) {
        return function (actions, obj, path) {
            var psPy = sliceToProperties(indicesExpression, obj);
            return this.traceProperties(psPy, actions, obj, path);
        };
    },
    tracePropertyFn: function (property) {
        return function (actions, obj, path) {
            return this.traceProperty(property, actions, obj, path);
        };
    },
    toParent: function (actions, obj, path) {
        return path.length ? [{
            path: path.slice(0, -1),
            expr: actions,
            isParentSelector: true
        }] : [];
    },
    trace: function (actions, val, path) {
        if (!actions.length) {
            return [{
                path: path,
                value: val
            }];
        }
        var action = actions[0];
        var remainingActions = actions.slice(1);

        return action.call(this, remainingActions, val, path);
    },
    // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object
    transferResult: function (obj, result) {
        var self = this;
        return result.reduce(function (all, ea) {
            if (ea.isParentSelector) {
                var v = self.trace(ea.expr, obj, ea.path);
                return all.concat(v);
            } else {
                all.push(ea);
                return all;
            }
        }, []);
    },
    eval: function (code, _v, _vname, path) {
        if (!this._obj || !_v) {
            return false;
        }
        if (code.indexOf('@path') > -1) {
            this.sandbox._$_path = asPath(path.concat([_vname]));
            code = code.replace(/@path/g, '_$_path');
        }
        if (code.indexOf('@') > -1) {
            this.sandbox._$_v = _v;
            code = code.replace(/@/g, '_$_v');
        }
        try {
            return vm.runInNewContext(code, this.sandbox);
        } catch (e) {
            console.log(e);
            throw new Error('jsonPath: ' + e.message + ': ' + code);
        }
    }
};

var processResult = function (result, options) {
    result = result.filter(function (ea) {
        return ea && !ea.isParentSelector;
    });
    if (!result.length) {
        return options.wrap ? [] : false;
    }
    if (result.length === 1 && !options.wrap && !Array.isArray(result[0].value)) {
        return result[0][options.resultType] || false;
    }
    return result.reduce(function (result, ea) {
        var valOrPath = ea[options.resultType];
        if (options.resultType === 'path') {
            valOrPath = asPath(valOrPath);
        }
        if (options.flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
        } else {
            result.push(valOrPath);
        }
        return result;
    }, []);
};

exports.instance = function (expr, opts) {
    opts = processOptions(opts);
    if ((opts.resultType !== 'value') && (opts.resultType !== 'path')) {
        throw new Error('Invalid option resultType: ' + opts.resultType);
    }

    var exprList = normalize(expr);
    for (var i = 0; i < exprList.length; ++i) {
        if (exprList[i] === '*') {
            exprList[i] = jsonPathMethods.allProperties;
        } else if (exprList[i] === '..') {
            exprList[i] = jsonPathMethods.allDeepProperties;
        } else if (exprList[i][0] === '(') {
            exprList[i] = jsonPathMethods.expressionProperties(exprList[i]);
        } else if (exprList[i].indexOf('?(') === 0) { // [?(expr)]
            exprList[i] = jsonPathMethods.filteredProperties(exprList[i]);
        } else if (exprList[i].indexOf(',') > -1) { // [name1,name2,...]
            exprList[i] = jsonPathMethods.listProperties(exprList[i]);
        } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(exprList[i])) { // [start:end:step]  Python slice syntax
            exprList[i] = jsonPathMethods.indexProperties(exprList[i]);
        } else if (exprList[i] === '^') {
            exprList[i] = jsonPathMethods.toParent;
        } else if (exprList[i] !== '$') {
            exprList[i] = jsonPathMethods.tracePropertyFn(exprList[i]);
        }
    }

    return function (obj) {
        var exprListCopy = exprList.slice();
        var jsonPath = Object.create(jsonPathMethods);
        jsonPath.sandbox = opts.sandbox;

        var ret = jsonPath.evaluate(obj, exprListCopy);
        ret = processResult(ret, opts);
        return ret;
    };
};
