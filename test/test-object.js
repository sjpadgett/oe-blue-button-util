"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var object = bbu.object;

describe('object.exists', function () {
    var exists = object.exists;

    it('null', function () {
        var r = null;
        expect(exists(null)).to.be.false;
    });

    it('undefined', function () {
        var r;
        expect(exists(null)).to.be.false;
    });

    it('"a"', function () {
        var r = "a";
        expect(exists(r)).to.be.true;
    });

    it('""', function () {
        var r = "";
        expect(exists(r)).to.be.true;
    });

    it('{}', function () {
        var r = {};
        expect(exists(r)).to.be.true;
    });
});
