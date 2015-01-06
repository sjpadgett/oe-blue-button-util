"use strict";

var lodash = require('lodash');

exports.append = function (arr, arrToAppend) {
    Array.prototype.push.apply(arr, arrToAppend);
};

exports.remove = lodash.remove;
