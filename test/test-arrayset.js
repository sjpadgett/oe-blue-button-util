"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var arrayset = bbu.arrayset;

describe('arrayset.append', function () {
    var append = arrayset.append;

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

describe('arrayset.remove', function () {
    var remove = arrayset.remove;

    it('based on property', function () {
        var r = [{
            id: "1",
            v: "1"
        }, {
            id: "2",
            v: "2"
        }, {
            id: "3",
            v: "3"
        }];
        remove(r, function (e) {
            return e.id === "2";
        });
        expect(r).to.deep.equal([{
            id: "1",
            v: "1"
        }, {
            id: "3",
            v: "3"
        }]);
    });
});
