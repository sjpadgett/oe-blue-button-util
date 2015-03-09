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

describe('object.deepValue', function () {
    var deepValue = object.deepValue;

    it('null', function () {
        var r = null;
        var v = deepValue(r, 'a.b');
        expect(v).to.equal(null);
    });

    it('undefined', function () {
        var r;
        var v = deepValue(r, 'a.b');
        expect(v).to.equal(null);
    });

    it('5', function () {
        var r = 5;
        var v = deepValue(r, 'a.b');
        expect(v).to.equal(null);
    });

    it('{}', function () {
        var r = {};
        var v = deepValue(r, 'a.b');
        expect(v).to.equal(null);
    });
    it('one level property', function () {
        var r = {
            a: "value"
        };
        var v = deepValue(r, 'a');
        expect(v).to.equal(r.a);
        v = deepValue(r, 'a.b');
        expect(v).to.equal(null);
    });
    it('two level property', function () {
        var r = {
            a: {
                b: "value"
            },
            c: 1
        };
        var v = deepValue(r, 'a.b');
        expect(v).to.equal(r.a.b);
        v = deepValue(r, 'a');
        expect(v).to.deep.equal(r.a);
        v = deepValue(r, 'a.b.c');
        expect(v).to.equal(null);
        v = deepValue(r, 'a.c.d');
        expect(v).to.equal(null);
    });
    it('three level property', function () {
        var r = {
            a: {
                b: {
                    c: "value"
                }
            }
        };
        var v = deepValue(r, 'a.b.c');
        expect(v).to.equal(r.a.b.c);
        v = deepValue(r, 'a.b');
        expect(v).to.deep.equal(r.a.b);
        v = deepValue(r, 'a.b.c.d');
        expect(v).to.equal(null);
    });
});
