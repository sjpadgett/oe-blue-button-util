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
        expect(r.inh).to.not.exist();
    });
});

describe('objsectset.deepValue', function () {
    it('null input', function () {
        var r = objectset.deepValue(null, 'primary.secondory', 5);
        expect(r).to.equal(null);
    });

    it('not object input', function () {
        var r = objectset.deepValue(null, 'primary.secondary', "value");
        expect(r).to.equal(null);
    });

    it('undefined input', function () {
        var r = objectset.deepValue(null, 'primary.secondary', undefined);
        expect(r).to.equal(null);
    });

    it('basic', function () {
        var obj = {};
        var r = objectset.deepValue(obj, 'a.b', 1);
        expect(r).to.equal(obj);
        expect(obj).to.deep.equal({
            a: {
                b: 1
            }
        });
        r = objectset.deepValue(obj, 'a.c.d', {
            d: 1
        });
        expect(r).to.equal(obj);
        expect(obj).to.deep.equal({
            a: {
                b: 1,
                c: {
                    d: {
                        d: 1
                    }
                }
            }
        });
        r = objectset.deepValue(obj, 'e', "");
        expect(r).to.equal(obj);
        expect(obj).to.deep.equal({
            a: {
                b: 1,
                c: {
                    d: {
                        d: 1
                    }
                }
            },
            e: ""
        });
        r = objectset.deepValue(obj, 'a.b.e', "string");
        expect(r).to.equal(obj);
        expect(obj).to.deep.equal({
            a: {
                b: {
                    e: "string"
                },
                c: {
                    d: {
                        d: 1
                    }
                }
            },
            e: ""
        });
        r = objectset.deepValue(obj, 'a.b.f', 88);
        expect(r).to.equal(obj);
        expect(obj).to.deep.equal({
            a: {
                b: {
                    e: "string",
                    f: 88
                },
                c: {
                    d: {
                        d: 1
                    }
                }
            },
            e: ""
        });
        r = objectset.deepValue(obj, 'a.b.e', {
            e: 1
        });
        expect(r).to.equal(obj);
        expect(obj).to.deep.equal({
            a: {
                b: {
                    e: {
                        e: 1
                    },
                    f: 88
                },
                c: {
                    d: {
                        d: 1
                    }
                }
            },
            e: ""
        });
    });
});
