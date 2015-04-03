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

describe('predicate.inValueSet', function () {
    var inValueSet = predicate.inValueSet;

    it('string value set', function () {
        var valueSet = ['one', 'two'];
        var f = inValueSet(valueSet);
        expect(f('one')).to.equal(true);
        expect(f('two')).to.equal(true);
        expect(f('three')).to.equal(false);
        expect(f(null)).to.equal(false);
    });
});

describe('predicate.hasNoProperties', function () {
    var hasNoProperties = predicate.hasNoProperties;

    it('basic', function () {
        var fn = hasNoProperties(['a', 'b.c']);

        var input = {
            a: 'a',
            b: 'b',
            c: {
                d: 'd',
                e: 'e'
            }
        };

        expect(fn(null)).to.equal(true);
        expect(fn(input)).to.equal(false);

        delete input.a;
        expect(fn(input)).to.equal(true);

        input.b = {
            c: 'c'
        };
        expect(fn(input)).to.equal(false);

        input.a = 5;
        expect(fn(input)).to.equal(false);
    });
});

describe('predicate.propertyValue', function () {
    var propertyValue = predicate.propertyValue;

    it('single property', function () {
        var fn = propertyValue('a');

        expect(fn(null)).not.to.be.ok;
        expect(fn(undefined)).not.to.be.ok;

        var input = {
            a: '5',
            b: {
                c: 'a',
                d: 'g'
            }
        };
        expect(fn(input)).to.be.ok;

        delete input.a;
        expect(fn(input)).not.to.be.ok;

        input.a = input.b;
        expect(fn(input)).to.be.ok;
    });

    it('deep property', function () {
        var fn = propertyValue('b.c');

        expect(fn(null)).not.to.be.ok;
        expect(fn(undefined)).not.to.be.ok;

        var input = {
            a: '5',
            b: {
                c: 'a',
                d: 'g'
            }
        };
        expect(fn(input)).to.be.ok;

        delete input.b.c;
        expect(fn(input)).not.to.be.ok;

        input.b.c = {
            a: 1
        };
        expect(fn(input)).to.be.ok;
    });
});

describe('predicate.falsyPropertyValue', function () {
    var falsyPropertyValue = predicate.falsyPropertyValue;

    it('single property', function () {
        var fn = falsyPropertyValue('a');

        expect(fn(null)).to.be.ok;
        expect(fn(undefined)).to.be.ok;

        var input = {
            a: '5',
            b: {
                c: 'a',
                d: 'g'
            }
        };
        expect(fn(input)).not.to.be.ok;

        delete input.a;
        expect(fn(input)).to.be.ok;

        input.a = input.b;
        expect(fn(input)).not.to.be.ok;
    });

    it('deep property', function () {
        var fn = falsyPropertyValue('b.c');

        expect(fn(null)).to.be.ok;
        expect(fn(undefined)).to.be.ok;

        var input = {
            a: '5',
            b: {
                c: 'a',
                d: 'g'
            }
        };
        expect(fn(input)).not.to.be.ok;

        delete input.b.c;
        expect(fn(input)).to.be.ok;

        input.b.c = {
            a: 1
        };
        expect(fn(input)).not.to.be.ok;
    });
});

describe('predicate.or', function () {
    var or = predicate.or;

    it('basic', function () {
        var fns = [predicate.hasProperty('a'), predicate.hasProperty('b.c'), predicate.hasNoProperty('d')];
        var fn = or(fns);

        expect(fn(null)).to.be.ok;
        expect(fn(undefined)).to.be.ok;

        var input = {};
        expect(fn(input)).to.be.ok;

        input.d = '5';
        expect(fn(input)).not.to.be.ok;

        input.a = 4;
        expect(fn(input)).to.be.ok;

        delete input.a;
        expect(fn(input)).not.to.be.ok;

        input.b = 6;
        expect(fn(input)).not.to.be.ok;

        input.b = {
            c: 'a'
        };
        expect(fn(input)).to.be.ok;

        input.a = 9;
        expect(fn(input)).to.be.ok;

        delete input.d;
        expect(fn(input)).to.be.ok;
    });
});

describe('predicate.and', function () {
    var and = predicate.and;

    it('basic', function () {
        var fns = [predicate.hasProperty('a'), predicate.hasProperty('b.c'), predicate.hasNoProperty('d')];
        var fn = and(fns);

        expect(fn(null)).not.to.be.ok;

        var input = {};
        expect(fn(input)).not.to.be.ok;

        input.a = 4;
        expect(fn(input)).not.to.be.ok;

        input.b = 6;
        expect(fn(input)).not.to.be.ok;

        input.b = {
            c: 'a'
        };
        expect(fn(input)).to.be.ok;

        input.d = '5';
        expect(fn(input)).not.to.be.ok;

        delete input.a;
        expect(fn(input)).not.to.be.ok;
    });
});

describe('predicate.not', function () {
    var not = predicate.not;

    it('basic', function () {
        var fnsource = predicate.hasProperty('a');
        var fn = not(fnsource);

        expect(fn(null)).to.be.ok;

        var input = {};
        expect(fn(input)).to.be.ok;

        input.a = 4;
        expect(fn(input)).not.to.be.ok;

        input.b = 6;
        expect(fn(input)).not.to.be.ok;

        delete input.a;
        expect(fn(input)).to.be.ok;
    });
});
