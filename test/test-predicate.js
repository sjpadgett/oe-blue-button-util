"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var predicate = bbu.predicate;

describe('predicate.hasProperty', function () {
    it('single property', function () {
        var f = predicate.hasProperty('a');
        expect(f(null)).to.equal(false);
        expect(f(undefined)).to.equal(false);
        expect(f(5)).to.equal(false);
        expect(f("value")).to.equal(false);
        expect(f({})).to.equal(false);
        var r0 = {
            b: 3
        };
        expect(f(r0)).to.equal(false);
        var r1 = {
            a: 3
        };
        expect(f(r1)).to.equal(true);
        var r2 = {
            a: {
                b: 2
            }
        };
        expect(f(r2)).to.equal(true);
    });

    it('deep (2) property', function () {
        var f = predicate.hasProperty('a.b');
        expect(f(null)).to.equal(false);
        expect(f(undefined)).to.equal(false);
        expect(f(5)).to.equal(false);
        expect(f("value")).to.equal(false);
        expect(f({})).to.equal(false);
        var r0 = {
            b: 3
        };
        expect(f(r0)).to.equal(false);
        var r1 = {
            a: 3
        };
        expect(f(r1)).to.equal(false);
        var r2 = {
            a: {
                b: 2
            }
        };
        expect(f(r2)).to.equal(true);
        var r3 = {
            a: {
                b: null
            }
        };
        expect(f(r3)).to.equal(false);
        var r4 = {
            a: {
                b: {
                    c: 5
                }
            }
        };
        expect(f(r4)).to.equal(true);
    });

    it('deep (3) property', function () {
        var f = predicate.hasProperty('a.b.c');
        expect(f(null)).to.equal(false);
        expect(f(undefined)).to.equal(false);
        expect(f(5)).to.equal(false);
        expect(f("value")).to.equal(false);
        expect(f({})).to.equal(false);
        var r0 = {
            b: 3
        };
        expect(f(r0)).to.equal(false);
        var r1 = {
            a: 3
        };
        expect(f(r1)).to.equal(false);
        var r2 = {
            a: {
                b: 2
            }
        };
        expect(f(r2)).to.equal(false);
        var r3 = {
            a: {
                b: {
                    c: 5
                }
            }
        };
        expect(f(r3)).to.equal(true);
        var r4 = {
            a: {
                b: {
                    c: {
                        d: 5
                    }
                }
            }
        };
        expect(f(r4)).to.equal(true);
    });
});

describe('predicate.hasNoProperty', function () {
    it('single property', function () {
        var f = predicate.hasNoProperty('a');
        expect(f(null)).to.equal(true);
        expect(f(undefined)).to.equal(true);
        expect(f(5)).to.equal(true);
        expect(f("value")).to.equal(true);
        expect(f({})).to.equal(true);
        var r0 = {
            b: 3
        };
        expect(f(r0)).to.equal(true);
        var r1 = {
            a: 3
        };
        expect(f(r1)).to.equal(false);
        var r2 = {
            a: {
                b: 2
            }
        };
        expect(f(r2)).to.equal(false);
    });

    it('deep (2) property', function () {
        var f = predicate.hasNoProperty('a.b');
        expect(f(null)).to.equal(true);
        expect(f(undefined)).to.equal(true);
        expect(f(5)).to.equal(true);
        expect(f("value")).to.equal(true);
        expect(f({})).to.equal(true);
        var r0 = {
            b: 3
        };
        expect(f(r0)).to.equal(true);
        var r1 = {
            a: 3
        };
        expect(f(r1)).to.equal(true);
        var r2 = {
            a: {
                b: 2
            }
        };
        expect(f(r2)).to.equal(false);
        var r3 = {
            a: {
                b: {
                    c: 5
                }
            }
        };
        expect(f(r3)).to.equal(false);
    });

    it('deep (3) property', function () {
        var f = predicate.hasNoProperty('a.b.c');
        expect(f(null)).to.equal(true);
        expect(f(undefined)).to.equal(true);
        expect(f(5)).to.equal(true);
        expect(f("value")).to.equal(true);
        expect(f({})).to.equal(true);
        var r0 = {
            b: 3
        };
        expect(f(r0)).to.equal(true);
        var r1 = {
            a: 3
        };
        expect(f(r1)).to.equal(true);
        var r2 = {
            a: {
                b: 2
            }
        };
        expect(f(r2)).to.equal(true);
        var r3 = {
            a: {
                b: {
                    c: 5
                }
            }
        };
        expect(f(r3)).to.equal(false);
        var r4 = {
            a: {
                b: {
                    c: {
                        d: 5
                    }
                }
            }
        };
        expect(f(r4)).to.equal(false);
    });
});
