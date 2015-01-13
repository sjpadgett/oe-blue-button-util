"use strict";

var lodash = require('lodash');

exports.isObject = lodash.isObject;

exports.exists = function (obj) {
    return (obj !== undefined) && (obj !== null);
};
