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
            r += '.' + p;
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
        wrap: (opts && opts.hasOwnProperty('wrap')) ? opts.wrap : null,
        sandbox: (opts && opts.sandbox) || {},
        functions: (opts && opts.functions) || {}
    };
};

var Accumulator = {
    init: function (lookbackNeeded, pathNeeded) {
        this.result = [];
        this.step = 0;
        if (lookbackNeeded) {
            this.objHistory = [];
        }
        if (pathNeeded) {
            this.path = [];
        }
    },
    clone: function () {
        var r = Object.create(Accumulator);
        r.result = this.result;
        r.obj = this.obj;
        r.location = this.location;
        r.step = this.step;
        if (this.objHistory) {
            r.objHistory = this.objHistory.slice();
        }
        if (this.path) {
            r.path = this.path.slice();
        }
        return r;
    },
    add: function (obj, location) {
        if (this.objHistory && (this.obj !== undefined)) {
            this.objHistory.push(this.obj);
        }
        if (this.path && (this.location !== undefined)) {
            this.path.push(this.location);
        }
        this.obj = obj;
        this.location = location;
    },
    back: function () {
        if (this.objHistory && this.objHistory.length > 0) {
            this.obj = this.objHistory.splice(-1, 1)[0];
        }
        if (this.path && this.objHistory.length > 0) {
            this.location = this.path.splice(-1, 1)[0];
        }
    },
    currentObject: function () {
        return this.obj;
    },
    currentPath: function () {
        if (this.path) {
            var r = this.path.slice();
            r.push(this.location);
            return r;
        } else {
            return null;
        }
    },
    currentStep: function () {
        return this.step;
    },
    addToResult: function () {
        this.result.push({
            path: this.currentPath(),
            value: this.currentObject()
        });
    },
    incrementStep: function () {
        ++this.step;
        return this.step;
    },
    toResult: function (options) {
        var result = this.result.slice();
        if (!result.length) {
            return options.wrap ? [] : null;
        }
        if (result.length === 1 && !options.wrap && !Array.isArray(result[0].value)) {
            return result[0][options.resultType] || null;
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
    }
};

var PATH_VAR = '_$_path';
var VALUE_VAR = '_$_v';

var Tracer = {
    init: function (obj, traceSteps, sandbox) {
        this._obj = obj;
        this.traceSteps = traceSteps;
        this.sandbox = sandbox;
    },
    traceStart: function (accumulator) {
        accumulator.add(this._obj, '$');
        this.traceNext(accumulator);
    },
    traceAllProperties: function (accumulator) {
        var obj = accumulator.currentObject();
        var ps = properties(obj);
        return this.traceProperties(ps, accumulator);
    },
    traceProperties: function (properties, accumulator) {
        if (properties) {
            properties.forEach(function (p) {
                var newAccumulator = accumulator.clone();
                this.traceProperty(p, newAccumulator);
            }, this);
        }
    },
    traceProperty: function (property, accumulator) {
        var obj = accumulator.currentObject();
        if (obj && obj.hasOwnProperty(property)) {
            accumulator.add(obj[property], property);
            this.traceNext(accumulator);
        }
    },
    traceAll: function (accumulator) {
        var rootJspResult = accumulator.clone();
        this.traceNext(rootJspResult);
        var obj = accumulator.currentObject();
        var ps = properties(obj);
        if (ps) {
            ps = ps.filter(function (p) {
                return typeof obj[p] === 'object';
            });
        }
        if (ps) {
            ps.forEach(function (p) {
                var newAccumulator = accumulator.clone();
                newAccumulator.add(obj[p], p);
                this.traceAll(newAccumulator);
            }, this);
        }
    },
    traceBack: function (accumulator) {
        accumulator.back();
        this.traceNext(accumulator);
    },
    traceEnd: function (accumulator) {
        accumulator.addToResult();
    },
    traceNext: function (accumulator) {
        var step = accumulator.incrementStep();
        var action = this.traceSteps[step];
        action.call(this, accumulator);
    },
    run: function (accumulator) {
        var action = this.traceSteps[0];
        action.call(this, accumulator);
    },
    eval: function (code, obj, addlLocation, path) {
        if (!this._obj || !obj) {
            return false;
        }
        if (code.indexOf(PATH_VAR) > -1) {
            if (addlLocation !== null) {
                path = path.slice();
                path.push(addlLocation);
            }
            this.sandbox[PATH_VAR] = asPath(path);
        }
        if (code.indexOf(VALUE_VAR) > -1) {
            this.sandbox[VALUE_VAR] = obj;
        }
        try {
            return vm.runInNewContext(code, this.sandbox);
        } catch (e) {
            console.log(e);
            throw new Error('jsonPath: ' + e.message + ': ' + code);
        }
    },
    traceJsExprPropertyGen: function (expr) {
        return function (accumulator) {
            var path = accumulator.currentPath();
            var obj = accumulator.currentObject();
            var property = this.eval(expr, obj, null, path);
            this.traceProperty(property, accumulator);
        };
    },
    traceFilteredPropertiesGen: function (expr) {
        var jsExpr = expr.replace(/^\?\((.*?)\)$/, '$1');
        return function (accumulator) {
            var obj = accumulator.currentObject();
            var ps = properties(obj);
            if (ps) {
                var path = accumulator.currentPath();
                ps = ps.filter(function (p) {
                    return this.eval(jsExpr, obj[p], p, path);
                }, this);
            }
            this.traceProperties(ps, accumulator);
        };
    },
    traceCommaDelimitedPropertiesGen: function (expr) {
        var properties = expr.split(',');
        return function (accumulator) {
            this.traceProperties(properties, accumulator);
        };
    },
    traceArrayRange: function (expr) {
        var indices = expr.split(':');
        var start = (indices[0] && parseInt(indices[0], 10)) || 0;
        var end = (indices[1] && parseInt(indices[1], 10)) || null;
        var step = (indices[2] && parseInt(indices[2], 10)) || 1;

        return function (accumulator) {
            var obj = accumulator.currentObject();
            var length = obj.length;
            var localStart = (start < 0) ? Math.max(0, start + length) : Math.min(length, start);
            var localEnd = (end === null) ? length : end;
            localEnd = (localEnd < 0) ? Math.max(0, localEnd + length) : Math.min(length, localEnd);
            var range = _.range(localStart, localEnd, step);
            this.traceProperties(range, accumulator);
        };
    },
    tracePropertyGen: function (property) {
        return function (accumulator) {
            this.traceProperty(property, accumulator);
        };
    },
    traceObjFunctionGen: function (fn, expr) {
        return function (accumulator) {
            var obj = accumulator.currentObject();
            accumulator.add(fn(obj), expr);
            this.traceNext(accumulator);
        };
    }
};

exports.instance = function (inputExpr, opts) {
    var handleJSExpression = function (expr, opts) {
        if (!opts.pathNeeded) {
            opts.pathNeeded = expr.indexOf('@path') > -1;
        }
        expr = expr.replace(/@path/g, PATH_VAR);
        expr = expr.replace(/@/g, VALUE_VAR);
        return expr;
    };

    var exprToAction = function (expr, opts) {
        if (expr === '*') {
            if (opts.wrap === null) {
                opts.wrap = true;
            }
            return Tracer.traceAllProperties;
        } else if (expr === '..') {
            if (opts.wrap === null) {
                opts.wrap = true;
            }
            return Tracer.traceAll;
        } else if (expr[0] === '(') {
            expr = handleJSExpression(expr, opts);
            return Tracer.traceJsExprPropertyGen(expr);
        } else if (expr.indexOf('?(') === 0) { // [?(expr)]
            if (opts.wrap === null) {
                opts.wrap = true;
            }
            expr = handleJSExpression(expr, opts);
            return Tracer.traceFilteredPropertiesGen(expr);
        } else if (expr.indexOf(',') > -1) { // [name1,name2,...]
            if (opts.wrap === null) {
                opts.wrap = true;
            }
            return Tracer.traceCommaDelimitedPropertiesGen(expr);
        } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(expr)) { // [start:end:step]  Python slice syntax
            if (opts.wrap === null) {
                opts.wrap = true;
            }
            return Tracer.traceArrayRange(expr);
        } else if (expr === '^') {
            opts.lookbackNeeded = true;
            return Tracer.traceBack;
        } else if (expr === '$') {
            return Tracer.traceStart;
        } else if (expr[expr.length - 1] === ')') {
            var fnName = expr.substring(0, expr.length - 2);
            var fn = opts.functions[fnName];
            if (!fn) {
                throw new Error('No function named ' + fnName + '.');
            }
            return Tracer.traceObjFunctionGen(fn, expr);
        } else {
            return Tracer.tracePropertyGen(expr);
        }
    };

    opts = processOptions(opts);
    if ((opts.resultType !== 'value') && (opts.resultType !== 'path')) {
        throw new Error('Invalid option resultType: ' + opts.resultType);
    }
    opts.pathNeeded = (opts.resultType === 'path');
    opts.lookbackNeeded = false;

    if (!inputExpr) {
        throw new Error('An input expression is required.');
    }

    var traceSteps = normalize(inputExpr).map(function (expr) {
        return exprToAction(expr, opts);
    });
    traceSteps.push(Tracer.traceEnd);
    if (traceSteps[0] !== Tracer.traceStart) {
        traceSteps.unshift(Tracer.traceStart);
    }

    return function (obj) {
        var tracer = Object.create(Tracer);
        tracer.init(obj, traceSteps, opts.sandbox);

        var accumulator = Object.create(Accumulator);
        accumulator.init(opts.lookbackNeeded, opts.pathNeeded);

        tracer.run(accumulator);
        return accumulator.toResult(opts);
    };
};
