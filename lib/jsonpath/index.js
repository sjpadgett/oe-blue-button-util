/*jslint vars:true, evil:true*/
'use strict';

var vm = require('vm');
var _ = require("lodash");

var parser = require('./parser');

module.exports = exports = function (opts, obj, expr) {
    opts = opts || {};

    if (opts.json && opts.path) {
        obj = opts.json;
        expr = opts.path;
    }

    if (obj === null || obj === undefined) {
        return obj;
    }

    opts.wrap = opts.hasOwnProperty('wrap') ? opts.wrap : true;
    opts.emptyValue = undefined;

    var inst = exports.instance(expr, opts);
    return inst(obj);
};

exports.normalize = parser.normalize;

var properties = function (obj) {
    if (!obj) {
        return null;
    } else if (Array.isArray(obj)) {
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
        if (this.objHistory.length > 0) {
            this.obj = this.objHistory.splice(-1, 1)[0];
        }

        if (this.path && this.path.length > 0) {
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
            return options.wrap ? options.emptyValue : null;
        }
        if (result.length === 1 && !options.wrap && !Array.isArray(result[0].value)) {
            return result[0][options.resultType];
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
    init: function (obj, traceSteps, sandbox, context) {
        this._obj = obj;
        this.traceSteps = traceSteps;
        this.sandbox = sandbox;
        this.context = context || {};
    },
    traceStart: function (accumulator) {
        accumulator.add(this._obj, '$');
        this.traceNext(accumulator);
    },
    traceAllProperties: function (accumulator) {
        var obj = accumulator.currentObject();
        var ps = properties(obj);
        this.traceProperties(ps, accumulator);
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
    run: function (opts) {
        var accumulator = Object.create(Accumulator);
        accumulator.init(opts.lookbackNeeded, opts.pathNeeded);
        var action = this.traceSteps[0];
        action.call(this, accumulator);
        return accumulator.toResult(opts);
    },
    eval: function (code, obj, addlLocation, path) {
        if (code.indexOf(PATH_VAR) > -1) {
            path = path.slice();
            path.push(addlLocation);
            this.sandbox[PATH_VAR] = asPath(path);
        }
        if (code.indexOf(VALUE_VAR) > -1) {
            this.sandbox[VALUE_VAR] = obj;
        }
        try {
            return vm.runInNewContext(code, this.sandbox);
        } catch (e) {
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
    traceArrayRangeGen: function (expr) {
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
    tracePredefinedFunctionGen: function (fn, expr) {
        return function (accumulator) {
            var obj = accumulator.currentObject();
            accumulator.add(fn(obj), expr);
            this.traceNext(accumulator);
        };
    },
    tracePostdefinedFunctionGen: function (expr) {
        return function (accumulator) {
            var obj = accumulator.currentObject();
            var fnName = expr.substring(0, expr.length - 2);
            var fn = this.context[fnName];
            if (!fn) {
                throw new Error('No function named ' + fnName + '.');
            }
            accumulator.add(fn(obj), expr);
            this.traceNext(accumulator);
        };
    },
    traceRootPathPropertyGen: function (propertySteps, opts) {
        return function (accumulator) {
            var tracer = Object.create(Tracer);
            tracer.init(this._obj, propertySteps, this.sandbox, this.context);

            var property = tracer.run(opts);
            if (property !== null) {
                if (Array.isArray(property)) {
                    this.traceProperties(property, accumulator);
                } else {
                    this.traceProperty(property, accumulator);
                }
            }
        };
    }
};

var tracerAdapter = (function () {
    var adapter = {};

    adapter.converter = {
        root: function () {
            return {
                method: Tracer.traceStart
            };
        },
        wildcard: function () {
            return {
                method: Tracer.traceAllProperties,
                branches: true
            };
        },
        recursive_descent: function () {
            return {
                method: Tracer.traceAll,
                branches: true
            };
        },
        parent: function () {
            return {
                method: Tracer.traceBack,
                lookbackNeeded: true
            };
        }
    };

    adapter.handleJSExpression = function (expr) {
        expr = expr.replace(/@path/g, PATH_VAR);
        expr = expr.replace(/@/g, VALUE_VAR);
        return expr;
    };

    adapter.reMap = [{
        re: /^\(.+\)$/,
        obj: function (expr) {
            var modifiedExpr = adapter.handleJSExpression(expr);
            return {
                method: Tracer.traceJsExprPropertyGen(modifiedExpr),
                pathNeeded: expr.indexOf('@path') > -1
            };
        }
    }, {
        re: /^\?\(.+\)$/,
        obj: function (expr) {
            var modifiedExpr = adapter.handleJSExpression(expr);
            return {
                method: Tracer.traceFilteredPropertiesGen(modifiedExpr),
                pathNeeded: expr.indexOf('@path') > -1,
                branches: true
            };
        }
    }, {
        re: /,/,
        obj: function (expr) {
            return {
                method: Tracer.traceCommaDelimitedPropertiesGen(expr),
                branches: true
            };
        }
    }, {
        re: /^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/,
        obj: function (expr) {
            return {
                method: Tracer.traceArrayRangeGen(expr),
                branches: true
            };
        }
    }, {
        re: /\(\)$/,
        obj: function (expr, opts) {
            var fnName = expr.substring(0, expr.length - 2);
            var fn = opts.functions[fnName];
            if (fn) {
                return {
                    method: Tracer.tracePredefinedFunctionGen(fn, expr)
                };
            } else {
                return {
                    method: Tracer.tracePostdefinedFunctionGen(expr)
                };
            }
        }
    }, {
        re: /^\$\./,
        obj: function (expr, opts) {
            var internalOpts = processOptions({});
            var propertySteps = adapter.run(expr, internalOpts);
            return {
                method: Tracer.traceRootPathPropertyGen(propertySteps, internalOpts)
            };
        }
    }];

    adapter.exprToMethod = function (expr, opts) {
        if (typeof expr === 'object') {
            var type = expr.type;
            var argument = expr.argument;
            return this.converter[type](argument);
        }
        for (var i = 0; i < this.reMap.length; ++i) {
            var reItem = this.reMap[i];
            if (reItem.re.test(expr)) {
                return reItem.obj(expr, opts);
            }
        }
        return {
            method: Tracer.tracePropertyGen(expr)
        };
    };

    adapter.exprToMethodUpdateOptions = function (expr, opts) {
        var r = this.exprToMethod(expr, opts);
        if (r.branches && (opts.wrap === null)) {
            opts.wrap = true;
        }
        if (r.lookbackNeeded) {
            opts.lookbackNeeded = true;
        }
        if (r.pathNeeded) {
            opts.pathNeeded = true;
        }
        return r.method;
    };

    adapter.run = function (inputExpr, opts) {
        var normalizedExprList = parser.normalize(inputExpr);
        var steps = normalizedExprList.map(function (expr) {
            return adapter.exprToMethodUpdateOptions(expr, opts);
        });
        steps.push(Tracer.traceEnd);
        return steps;
    };

    return adapter.run;
})();

exports.instance = function (inputExpr, opts) {

    opts = processOptions(opts);
    if ((opts.resultType !== 'value') && (opts.resultType !== 'path')) {
        throw new Error('Invalid option resultType: ' + opts.resultType);
    }
    opts.pathNeeded = (opts.resultType === 'path');
    opts.lookbackNeeded = false;
    opts.emptyValue = (opts.wrap === null) ? null : [];

    if (!inputExpr) {
        throw new Error('An input expression is required.');
    }

    var traceSteps = tracerAdapter(inputExpr, opts);
    if (traceSteps[0] !== Tracer.traceStart) {
        traceSteps.unshift(Tracer.traceStart);
    }

    return function (obj, context) {
        var tracer = Object.create(Tracer);
        tracer.init(obj, traceSteps, opts.sandbox, context);

        return tracer.run(opts);
    };
};
