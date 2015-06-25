"use strict";

exports.append = function (arr, arrToAppend) {
    Array.prototype.push.apply(arr, arrToAppend);
};
