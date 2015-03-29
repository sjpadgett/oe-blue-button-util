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
    var n = path.length;
    var r = '$';
    for (var i = 1; i < n; ++i) {
        var p = path[i];
        if (p[p.length - 1] === ')') {
            r = p.substring(0, p.length - 2) + '(' + r + ')';
        } else {
            r += /^[0-9*]+$/.test(p) ? ('[' + p + ']') : ("['" + p + "']");
        }
    }
    return r;
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
        sandbox: (opts && opts.sandbox) || {},
        functions: (opts && opts.functions) || {}
    };
};

var JPPathResult = {
    init: function (obj, path) {
        this.objHistory = [obj];
        this.pathHistory = [path];
        this.result = [];
    },
    clone: function () {
        var r = Object.create(JPPathResult);
        r.result = this.result;
        r.objHistory = this.objHistory.slice();
        r.pathHistory = this.pathHistory.slice();
        return r;
    },
    add: function (obj, path) {
        this.objHistory.push(obj);
        this.pathHistory.push(path);
    },
    back: function () {
        if (this.objHistory.length > 1) {
            this.objHistory.splice(-1, 1);
            this.pathHistory.splice(-1, 1);
        }
    },
    currentObject: function () {
        return this.objHistory[this.objHistory.length - 1];
    },
    currentPath: function () {
        return this.pathHistory[this.pathHistory.length - 1];
    },
    addToResult: function () {
        this.result.push({
            path: this.pathHistory,
            value: this.currentObject()
        });
    }
};

var jsonPathMethods = {
    traceAllProperties: function (index, obj, jspResult) {
        var ps = properties(obj);
        return this.traceProperties(ps, index, obj, jspResult);
    },
    traceProperties: function (properties, index, obj, jspResult) {
        var result = [];
        if (properties) {
            properties.forEach(function (p) {
                var newJspResult = jspResult.clone();
                var v = this.traceProperty(p, index, obj, newJspResult);
                append(result, v);
            }, this);
        }
        return this.transferResult(obj, result);
    },
    traceProperty: function (property, index, obj, jspResult) {
        var result = [];
        if (obj && obj.hasOwnProperty(property)) {
            jspResult.add(obj[property], property);
            var v = this.traceNext(index, obj[property], jspResult);
            append(result, v);
        }
        return this.transferResult(obj, result);
    },
    traceAll: function (index, obj, jspResult) {
        var result = [];
        var rootJspResult = jspResult.clone();
        var rootResult = this.traceNext(index, obj, rootJspResult);
        append(result, rootResult);
        var ps = properties(obj);
        if (ps) {
            ps = ps.filter(function (p) {
                return typeof obj[p] === 'object';
            });
        }
        if (ps) {
            ps.forEach(function (p) {
                var newJspResult = jspResult.clone();
                newJspResult.add(obj[p], p);
                var v = this.traceAll(index, obj[p], newJspResult);
                append(result, v);
            }, this);
        }
        return this.transferResult(obj, result);
    },
    traceBack: function (index, obj, jspResult) {
        jspResult.back();
        var path = jspResult.pathHistory;
        return path.length ? [{
            path: jspResult,
            index: index,
            isParentSelector: true
        }] : [];
    },
    traceEnd: function (index, obj, jspResult) {
        jspResult.addToResult();
        return [{
            path: jspResult.pathHistory,
            value: jspResult.currentObject()
        }];
    },
    traceNext: function (index, obj, jspResult) {
        ++index;
        var action = this.actions[index];
        return action.call(this, index, obj, jspResult);
    },
    // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object
    transferResult: function (obj, result) {
        var self = this;
        return result.reduce(function (all, ea) {
            if (ea.isParentSelector) {
                var v = self.traceNext(ea.index, obj, ea.path);
                return all.concat(v);
            } else {
                all.push(ea);
                return all;
            }
        }, []);
    },
    eval: function (code, _v, _vname, jspResult) {
        var path = jspResult.pathHistory;
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
        return function (index, obj, jspResult) {
            var result = [];
            var path = jspResult.currentPath();
            var property = this.eval(expr, obj, path[path.length], jspResult);
            return this.traceProperty(property, index, obj, jspResult);
        };
    },
    filteredProperties: function (expr) {
        var jsExpr = expr.replace(/^\?\((.*?)\)$/, '$1');
        return function (index, obj, jspResult) {
            var ps = properties(obj);
            if (ps) {
                ps = ps.filter(function (p) {
                    return this.eval(jsExpr, obj[p], p, jspResult);
                }, this);
            }
            return this.traceProperties(ps, index, obj, jspResult);
        };
    },
    commaDelimitedProperties: function (expr) {
        var properties = expr.split(',');
        return function (index, obj, jspResult) {
            return this.traceProperties(properties, index, obj, jspResult);
        };
    },
    arrayRange: function (expr) {
        var indices = expr.split(':');
        var start = (indices[0] && parseInt(indices[0], 10)) || 0;
        var end = (indices[1] && parseInt(indices[1], 10)) || null;
        var step = (indices[2] && parseInt(indices[2], 10)) || 1;

        return function (index, obj, jspResult) {
            var length = obj.length;
            var localStart = (start < 0) ? Math.max(0, start + length) : Math.min(length, start);
            var localEnd = (end === null) ? length : end;
            localEnd = (localEnd < 0) ? Math.max(0, localEnd + length) : Math.min(length, localEnd);
            var range = _.range(localStart, localEnd, step);
            return this.traceProperties(range, index, obj, jspResult);
        };
    },
    property: function (property) {
        return function (index, obj, jspResult) {
            return this.traceProperty(property, index, obj, jspResult);
        };
    },
    objFunction: function (fn, expr) {
        return function (index, obj, jspResult) {
            var result = [];
            jspResult.add(fn(obj), expr);
            var v = this.traceNext(index, fn(obj), jspResult);
            append(result, v);
            return this.transferResult(obj, result);
        };
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

exports.instance = function (inputExpr, opts) {
    var exprToFn = function (expr) {
        if (expr === '*') {
            return jsonPathMethods.traceAllProperties;
        } else if (expr === '..') {
            return jsonPathMethods.traceAll;
        } else if (expr[0] === '(') {
            return exprToJsonPathMethod.jsExprProperty(expr);
        } else if (expr.indexOf('?(') === 0) { // [?(expr)]
            return exprToJsonPathMethod.filteredProperties(expr);
        } else if (expr.indexOf(',') > -1) { // [name1,name2,...]
            return exprToJsonPathMethod.commaDelimitedProperties(expr);
        } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(expr)) { // [start:end:step]  Python slice syntax
            return exprToJsonPathMethod.arrayRange(expr);
        } else if (expr === '^') {
            return jsonPathMethods.traceBack;
        } else if (expr === '$') {
            return expr;
        } else if (expr[expr.length - 1] === ')') {
            var fnName = expr.substring(0, expr.length - 2);
            var fn = opts.functions[fnName];
            if (!fn) {
                throw new Error('No function named ' + fnName + '.');
            }
            return exprToJsonPathMethod.objFunction(fn, expr);
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
    exprList.push(jsonPathMethods.traceEnd);
    if (exprList[0] === '$') {
        exprList.shift();
    }

    return function (obj) {
        var jsonPath = Object.create(jsonPathMethods);
        jsonPath.sandbox = opts.sandbox;
        jsonPath._obj = obj;
        jsonPath.actions = exprList;

        var jspResult = Object.create(JPPathResult);
        jspResult.init(obj, '$');
        var ret = jsonPath.traceNext(-1, obj, jspResult);
        ret = jspResult.result;
        //console.log(JSON.stringify(jspResult.result, undefined, 4));
        ret = processResult(ret, opts);
        return ret;
    };
};
