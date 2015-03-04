"use strict";

var object = require('./object');

var exists = object.exists;

var hasProperty = exports.hasProperty = function (deepProperty) {
    var propertyPieces = deepProperty.split('.');
    if (propertyPieces.length > 1) {
        return function (input) {
            if (!exists(input)) {
                return false;
            } else {
                return propertyPieces.every(function (piece) {
                    if (typeof input !== 'object') {
                        return false;
                    }
                    if (!input.hasOwnProperty(piece)) {
                        return false;
                    }
                    input = input[piece];
                    if (!exists(input)) {
                        return false;
                    } else {
                        return true;
                    }
                });
            }
        };
    } else {
        return function (input) {
            if (exists(input) && (typeof input === 'object')) {
                return input.hasOwnProperty(deepProperty);
            } else {
                return false;
            }
        };
    }
};

exports.hasNoProperty = function (deepProperty) {
    var f = hasProperty(deepProperty);
    return function (input) {
        return !f(input);
    };
};
