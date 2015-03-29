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

var asPath = function (path) {
    var i, n, x = path,
        p = '$';
    for (i = 1, n = x.length; i < n; i++) {
        p += /^[0-9*]+$/.test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']");
    }
    return p;
};

var normalize = exports.normalize = function (expr) {
    var exprList = [];
    var index = 0;
    var length = expr.length;
    var lastIndex = 0;
    while (index < length) {
        var c = expr.charAt(index);
        if (c === '.') {
            var cp1 = expr.charAt(index + 1);
            if (lastIndex !== index) {
                var subExpr = expr.substring(lastIndex, index);
                exprList.push(subExpr);
            }
            if (cp1 === '.') {
                exprList.push('..');
                ++index;
            }
            ++index;
            lastIndex = index;
            continue;
        }
        if (c === '[') {
            if (lastIndex !== index) {
                var subExprLB = expr.substring(lastIndex, index);
                exprList.push(subExprLB);
            }
            var openBrackets = 1;
            ++index;
            lastIndex = index;
            while (index < length) {
                var cinside = expr.charAt(index);
                if (cinside === '[') {
                    ++openBrackets;
                    ++index;
                    continue;
                }
                if (cinside === ']') {
                    --openBrackets;
                    if (openBrackets === 0) {
                        var subExprInside = expr.substring(lastIndex, index);
                        exprList.push(subExprInside);
                        ++index;
                        lastIndex = index;
                        break;
                    }
                }
                ++index;
            }
            continue;
        }
        if ((c === '^') || (c === '$')) {
            if (lastIndex !== index) {
                var subExprUC = expr.substring(lastIndex, index);
                exprList.push(subExprUC);
            }
            exprList.push(c);
            ++index;
            lastIndex = index;
            continue;
        }
        ++index;
    }
    if (lastIndex < index) {
        var subExprFinal = expr.substring(lastIndex, index);
        exprList.push(subExprFinal);
    }
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

var exprToJsonPathMethod = {
    jsExprProperty: function (expr) {
        return function (actions, obj, path) {
            var result = [];
            var property = this.eval(expr, obj, path[path.length], path);
            return this.traceProperty(property, actions, obj, path);
        };
    },
    filteredProperties: function (expr) {
        var jsExpr = expr.replace(/^\?\((.*?)\)$/, '$1');
        return function (actions, obj, path) {
            var ps = properties(obj);
            if (ps) {
                ps = ps.filter(function (p) {
                    return this.eval(jsExpr, obj[p], p, path);
                }, this);
            }
            return this.traceProperties(ps, actions, obj, path);
        };
    },
    commaDelimitedProperties: function (expr) {
        var properties = expr.split(',');
        return function (actions, obj, path) {
            return this.traceProperties(properties, actions, obj, path);
        };
    },
    arrayRange: function (expr) {
        var indices = expr.split(':');
        var start = (indices[0] && parseInt(indices[0], 10)) || 0;
        var end = (indices[1] && parseInt(indices[1], 10)) || null;
        var step = (indices[2] && parseInt(indices[2], 10)) || 1;

        return function (actions, obj, path) {
            var length = obj.length;
            var localStart = (start < 0) ? Math.max(0, start + length) : Math.min(length, start);
            var localEnd = (end === null) ? length : end;
            localEnd = (localEnd < 0) ? Math.max(0, localEnd + length) : Math.min(length, localEnd);
            var range = _.range(localStart, localEnd, step);
            return this.traceProperties(range, actions, obj, path);
        };
    },
    property: function (property) {
        return function (actions, obj, path) {
            return this.traceProperty(property, actions, obj, path);
        };
    },
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

exports.instance = function (inputExpr, opts) {
    var exprToFn = function (expr) {
        if (expr === '*') {
            return jsonPathMethods.allProperties;
        } else if (expr === '..') {
            return jsonPathMethods.allDeepProperties;
        } else if (expr[0] === '(') {
            return exprToJsonPathMethod.jsExprProperty(expr);
        } else if (expr.indexOf('?(') === 0) { // [?(expr)]
            return exprToJsonPathMethod.filteredProperties(expr);
        } else if (expr.indexOf(',') > -1) { // [name1,name2,...]
            return exprToJsonPathMethod.commaDelimitedProperties(expr);
        } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(expr)) { // [start:end:step]  Python slice syntax
            return exprToJsonPathMethod.arrayRange(expr);
        } else if (expr === '^') {
            return jsonPathMethods.toParent;
        } else if (expr === '$') {
            return expr;
        } else {
            return exprToJsonPathMethod.property(expr);
        }
    };

    opts = processOptions(opts);
    if ((opts.resultType !== 'value') && (opts.resultType !== 'path')) {
        throw new Error('Invalid option resultType: ' + opts.resultType);
    }
    if (!inputExpr) {
        throw new Error('An input expression is required.');
    }

    var exprList = normalize(inputExpr).map(exprToFn);

    return function (obj) {
        var exprListCopy = exprList.slice();
        var jsonPath = Object.create(jsonPathMethods);
        jsonPath.sandbox = opts.sandbox;

        var ret = jsonPath.evaluate(obj, exprListCopy);
        ret = processResult(ret, opts);
        return ret;
    };
};
