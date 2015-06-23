'use strict';

var util = require('util');

var re4Integer = '-?(?:0|[1-9][0-9]*)';

var re = exports.re = {
    identifier: new RegExp('[a-zA-Z_\$]+[a-zA-Z0-9_]*'),
    range: new RegExp(util.format('^(%s)(?:\\:(%s))?(?:\\:(%s))?', re4Integer, re4Integer, re4Integer)),
    q_string: new RegExp('\'(?:\\\\[\'bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\'\\\\])*\''),
    qq_string: new RegExp('\"(?:\\\\[\"bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\"\\\\])*\"')
};

var types = exports.types = {
    ROOT: {
        type: 'root'
    },
    WILDCARD: {
        type: 'wildcard'
    },
    RECURSIVE_DESCENT: {
        type: 'recursive_descent'
    },
    PARENT: {
        type: 'parent'
    }
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
                exprList.push(types.RECURSIVE_DESCENT);
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
                        if (subExprInside === '*') {
                            exprList.push(types.WILDCARD);
                        } else {
                            exprList.push(subExprInside);
                        }
                        ++index;
                        lastIndex = index;
                        break;
                    }
                }
                ++index;
            }
            continue;
        }
        if (c === '*') {
            if (lastIndex === index) {
                exprList.push(types.WILDCARD);
                ++index;
                lastIndex = index;
                continue;
            }
        }
        if (c === '$') {
            if (lastIndex === index) {
                exprList.push(types.ROOT);
                ++index;
                lastIndex = index;
                continue;
            }
        }
        if (c === '^') {
            if (lastIndex === index) {
                exprList.push(types.PARENT);
                ++index;
                lastIndex = index;
                continue;
            }
        }
        ++index;
    }
    if (lastIndex < index) {
        var subExprFinal = expr.substring(lastIndex, index);
        exprList.push(subExprFinal);
    }
    return exprList;
};
