'use strict';

var util = require('util');

var re4Integer = '-?(?:0|[1-9][0-9]*)';

var re = exports.re = {
    identifier: new RegExp('[a-zA-Z_\$]+[a-zA-Z0-9_]*'),
    range: new RegExp(util.format('^(%s)(?:\\:(%s))?(?:\\:(%s))?', re4Integer, re4Integer, re4Integer)),
    q_string: new RegExp('\'(?:\\\\[\'bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\'\\\\])*\''),
    qq_string: new RegExp('\"(?:\\\\[\"bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\"\\\\])*\"')
};
