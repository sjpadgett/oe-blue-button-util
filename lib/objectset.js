"use strict";

var object = require('./object');

exports.compact = function compact(obj) {
    if (typeof obj === 'object') {
        Object.keys(obj).forEach(function (key) {
            if (object.exists(obj[key])) {
                compact(obj[key]);
            } else {
                delete obj[key];
            }
        });
    }
};
