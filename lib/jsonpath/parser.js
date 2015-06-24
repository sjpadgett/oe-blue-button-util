'use strict';

var util = require('util');

var re4Integer = '-?(?:0|[1-9][0-9]*)';

var re = exports.re = {
    identifier: new RegExp('^[a-zA-Z_\$]+[a-zA-Z0-9_]*'),
    integer: new RegExp(re4Integer),
    range: new RegExp(util.format('^(%s)(?:\\:(%s))?(?:\\:(%s))?', re4Integer, re4Integer, re4Integer)),
    q_string: new RegExp('^\'(?:\\\\[\'bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\'\\\\])*\''),
    qq_string: new RegExp('^\"(?:\\\\[\"bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\"\\\\])*\"')
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

var propertyUpdate = {
    identifier: function (properties, reExecResult) {
        properties.push(reExecResult[0]);
    },
    integer: function (properties, reExecResult) {
        properties.push(reExecResult[0]);
    },
    q_string: function (properties, reExecResult) {
        properties.push(reExecResult[1]);
    },
    qq_string: function (properties, reExecResult) {
        properties.push(reExecResult[1]);
    },
    range: function (properties, reExecResult) {
        var start = (reExecResult[1] && parseInt(reExecResult[1], 10)) || 0;
        var end = (reExecResult[2] && parseInt(reExecResult[2], 10)) || null;
        var step = (reExecResult[3] && parseInt(reExecResult[3], 10)) || 1;
        properties.push({
            start: start,
            end: end,
            step: step
        });
    }
};

var subscriptToProperties = function subscriptToProperties(subscript, properties) {
    var reKeys = Object.keys(re);
    var n = reKeys.length;
    for (var i = 0; i < n; ++i) {
        var key = reKeys[i];
        var r = re[key];
        var result = r.exec(subscript);
        if (result) {
            propertyUpdate[key](properties, result);
            var nResult = result[0].length;
            if (nResult === subscript.length) {
                return true;
            }
            if (subscript[nResult] !== ',') {
                throw new Error('Invalid character');
            }
            subscript = subscript.substring(nResult + 1);
            return subscriptToProperties(subscript, properties);
        }
    }
    return false;
};

var subscriptToNode = function (subscript) {
    var n = subscript.length;
    if (n === 0) {
        throw new Error('Empty subscript in path.');
    }

    if (subscript === '*') {
        return types.WILDCARD;
    }

    var c = subscript.charAt(0);
    var ce = subscript.charAt(n - 1);

    if (c === '(') {
        if (ce !== ')') {
            throw new Error('Subscript starts with "(" but does not end with ")".');
        }
        return {
            type: 'script',
            parameter: subscript.substring(1, n - 1)
        };
    }

    if (c === '?') {
        if ((n < 2) || (subscript.charAt(1) !== '(')) {
            throw new Error('Subscript start with "?" but the second character is not "("');
        }
        if (ce !== ')') {
            throw new Error('Subscript starts with "?(" but does not end with ")".');
        }
        return {
            type: 'filter_script',
            parameter: subscript.substring(2, n - 1)
        };
    }

    return subscript;
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
                        var scriptResult = subscriptToNode(subExprInside);
                        exprList.push(scriptResult);
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
