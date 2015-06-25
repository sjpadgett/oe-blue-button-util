"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var objectset = bbu.objectset;

describe('objectset.compact', function () {
    var compact = objectset.compact;

    it('basic', function () {
        var r = {
            a: 'a',
            b: {
                b0: 'b0',
                b1: 'b1',
                b2: null
            },
            c: undefined
        };

        compact(r);
        expect(r).to.deep.equal({
            a: 'a',
            b: {
                b0: 'b0',
                b1: 'b1'
            }
        });
        expect(r).to.not.have.property('c');
        expect(r.b).to.not.have.property('b2');
    });

    it('inherited not impacted', function () {
        var b = {
            inh: null
        };

        var r = Object.create(b);
        r.a = 'a';
        r.b = undefined;

        compact(r);
        expect(r).to.have.property('a');
        expect(r).to.not.have.property('b');
        expect(r).to.have.property('inh');
        expect(r.inh).to.not.exist;
    });
});
