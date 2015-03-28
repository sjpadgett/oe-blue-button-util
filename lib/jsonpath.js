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

function unshift(elem, arr) {
    arr = arr.slice();
    arr.unshift(elem);
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
        var self = this;
        this._obj = obj;
        if (exprList && obj) {
            if (exprList[0] === '$' && exprList.length > 1) {
                exprList.shift();
            }
            var result = this.trace(exprList, obj, ['$']);
            return result;
        }
    },
    trace: function (expr, val, path) {
        // No expr to follow? return path and value as the result of this trace branch
        var self = this;
        if (!expr.length) {
            return [{
                path: path,
                value: val
            }];
        }
        var loc = expr[0];
        var x = expr.slice(1);
        // The parent sel computation is handled in the frame above using the
        // ancestor object of val
        var ret = [];

        // We need to gather the return value of recursive trace calls in order to
        // do the parent sel computation.
        if (val && val.hasOwnProperty(loc)) { // simple case, directly follow property
            append(ret, this.trace(x, val[loc], push(path, loc)));
        } else if (loc === '*') { // any property
            var psStar = properties(val);
            if (psStar) {
                psStar.forEach(function (p) {
                    var v = self.trace(unshift(p, x), val, path);
                    append(ret, v);
                });
            }
        } else if (loc === '..') { // all child properties
            append(ret, this.trace(x, val, path));
            var psDD = properties(val);
            if (psDD) {
                psDD = psDD.filter(function (p) {
                    return typeof val[p] === 'object';
                });
            }
            if (psDD) {
                psDD.forEach(function (p) {
                    var v = self.trace(unshift('..', x), val[p], push(path, p));
                    append(ret, v);
                });
            }
        } else if (loc[0] === '(') { // [(expr)]
            var pf = this.eval(loc, val, path[path.length], path);
            append(ret, this.trace(unshift(pf, x), val, path));
        } else if (loc.indexOf('?(') === 0) { // [?(expr)]
            var psQ = properties(val);
            if (psQ) {
                var locHere = loc.replace(/^\?\((.*?)\)$/, '$1');
                psQ = psQ.filter(function (p) {
                    return self.eval(locHere, val[p], p, path);
                });
            }
            if (psQ) {
                psQ.forEach(function (p) {
                    var v = self.trace(unshift(p, x), val, path);
                    append(ret, v);
                });
            }
        } else if (loc.indexOf(',') > -1) { // [name1,name2,...]
            var parts = loc.split(',');
            parts.forEach(function (p) {
                var v = self.trace(unshift(p, x), val, path);
                append(ret, v);
            });
        } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  Python slice syntax
            var psPy = sliceToProperties(loc, val);
            if (psPy) {
                psPy.forEach(function (p) {
                    var v = self.trace(unshift(p, x), val, path);
                    append(ret, v);
                });
            }
        } else if (loc === '^') {
            return path.length ? [{
                path: path.slice(0, -1),
                expr: x,
                isParentSelector: true
            }] : [];
        }
        // We check the resulting values for parent selections. For parent
        // selections we discard the value object and continue the trace with the
        // current val object
        return ret.reduce(function (all, ea) {
            if (ea.isParentSelector) {
                var v = self.trace(ea.expr, val, ea.path);
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

    return function (obj) {
        var exprListCopy = exprList.slice();
        var jsonPath = Object.create(jsonPathMethods);
        jsonPath.sandbox = opts.sandbox;

        var ret = jsonPath.evaluate(obj, exprListCopy);
        ret = processResult(ret, opts);
        return ret;
    };
};
