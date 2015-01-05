"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var array = bbu.array;

describe('array.append', function () {
    var append = array.append;

    it('[] <- ["a", "b"]', function () {
        var r = [];
        append(r, ["a", "b"]);
        expect(r).to.deep.equal(["a", "b"]);
    });

    it('["a", "b"] <- ["c", "d"]', function () {
        var r = ["a", "b"];
        append(r, ["c", "d"]);
        expect(r).to.deep.equal(["a", "b", "c", "d"]);
    });

    it('["a", "b"] <- []', function () {
        var r = ["a", "b"];
        append(r, []);
        expect(r).to.deep.equal(["a", "b"]);
    });
});
