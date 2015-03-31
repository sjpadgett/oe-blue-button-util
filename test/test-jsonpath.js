"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var jsonpath = bbu.jsonpath;

var example_0 = require('./examples/example_0.json');

describe('example-0, default options', function () {
    it('$.store.book[*].author', function () {
        var jp = jsonpath.instance('$.store.book[*].author');
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..author', function () {
        var jp = jsonpath.instance('$..author');
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.*', function () {
        var jp = jsonpath.instance('$.store.*');
        var actual = jp(example_0);
        var expected = [example_0.store.book, example_0.store.bicycle];
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price', function () {
        var jp = jsonpath.instance('$.store..price');
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.price;
        });
        expected.push(example_0.store.bicycle.price);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[2]', function () {
        var jp = jsonpath.instance('$..book[2]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[2]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[(@.length-1)]', function () {
        var jp = jsonpath.instance('$..book[(@.length-1)]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[3]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[-1:]', function () {
        var jp = jsonpath.instance('$..book[-1:]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[3]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[1,2]', function () {
        var jp = jsonpath.instance('$..book[1,2]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[1], example_0.store.book[2]];
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[1].price', function () {
        var jp = jsonpath.instance('$store.book[1].price');
        var actual = jp(example_0);
        var expected = example_0.store.book[1].price;
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[:2]', function () {
        var jp = jsonpath.instance('$..book[:2]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[0], example_0.store.book[1]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[1:]', function () {
        var jp = jsonpath.instance('$..book[1:].price');
        var actual = jp(example_0);
        var expected = [example_0.store.book[1].price, example_0.store.book[2].price, example_0.store.book[3].price];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[*][category,author]', function () {
        var jp = jsonpath.instance('$..book[*][category,author]');
        var actual = jp(example_0);
        var expected = example_0.store.book.reduce(function (r, book) {
            r.push(book.category);
            r.push(book.author);
            return r;
        }, []);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[?(@.isbn)]', function () {
        var jp = jsonpath.instance('$..book[?(@.isbn)]');
        var actual = jp(example_0);
        var expected = example_0.store.book.filter(function (book) {
            return book.isbn;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..[?(@.price>19)]^', function () {
        var jp = jsonpath.instance('$..[?(@.price>19)]^');
        var actual = jp(example_0);
        var expected = [example_0.store, example_0.store.book];
        expect(actual).to.deep.equal(expected);
    });

    it('$..*', function () {
        var jp = jsonpath.instance('$..*');
        var actual = jp(example_0);
        var expected = [example_0.store, example_0.store.book, example_0.store.bicycle];
        example_0.store.book.forEach(function (book) {
            expected.push(book);
        });
        example_0.store.book.forEach(function (book) {
            Object.keys(book).forEach(function (key) {
                expected.push(book[key]);
            });
        });
        expected.push(example_0.store.bicycle.color);
        expected.push(example_0.store.bicycle.price);
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', function () {
        var jp = jsonpath.instance('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]');
        var actual = jp(example_0);
        var expected = example_0.store.book.slice(1);
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price.round()', function () {
        var opts = {
            functions: {
                round: function (obj) {
                    return Math.round(obj);
                }
            }
        };
        var jp = jsonpath.instance('$.store..price.round()', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return Math.round(book.price);
        });
        expected.push(Math.round(example_0.store.bicycle.price));
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[1].pricex', function () {
        var jp = jsonpath.instance('$store.book[1].pricex');
        var actual = jp(example_0);
        var expected = null;
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[1].pricex', function () {
        var jp = jsonpath.instance('$store.book[*].pricex');
        var actual = jp(example_0);
        var expected = null;
        expect(actual).to.deep.equal(expected);
    });
});

describe('example-0, wrap=true', function () {
    var opts = {
        wrap: true
    };

    it('$.store.book[*].author', function () {
        var jp = jsonpath.instance('$.store.book[*].author');
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..author', function () {
        var jp = jsonpath.instance('$..author');
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.*', function () {
        var jp = jsonpath.instance('$.store.*');
        var actual = jp(example_0);
        var expected = [example_0.store.book, example_0.store.bicycle];
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price', function () {
        var jp = jsonpath.instance('$.store..price');
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.price;
        });
        expected.push(example_0.store.bicycle.price);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[2]', function () {
        var jp = jsonpath.instance('$..book[2]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[2]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[(@.length-1)]', function () {
        var jp = jsonpath.instance('$..book[(@.length-1)]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[3]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[-1:]', function () {
        var jp = jsonpath.instance('$..book[-1:]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[3]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[1,2]', function () {
        var jp = jsonpath.instance('$..book[1,2]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[1], example_0.store.book[2]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[:2]', function () {
        var jp = jsonpath.instance('$..book[:2]');
        var actual = jp(example_0);
        var expected = [example_0.store.book[0], example_0.store.book[1]];
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[1].price', function () {
        var jp = jsonpath.instance('$store.book[1].price', opts);
        var actual = jp(example_0);
        var expected = [example_0.store.book[1].price];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[*][category,author]', function () {
        var jp = jsonpath.instance('$..book[*][category,author]');
        var actual = jp(example_0);
        var expected = example_0.store.book.reduce(function (r, book) {
            r.push(book.category);
            r.push(book.author);
            return r;
        }, []);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[?(@.isbn)]', function () {
        var jp = jsonpath.instance('$..book[?(@.isbn)]');
        var actual = jp(example_0);
        var expected = example_0.store.book.filter(function (book) {
            return book.isbn;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..[?(@.price>19)]^', function () {
        var jp = jsonpath.instance('$..[?(@.price>19)]^');
        var actual = jp(example_0);
        var expected = [example_0.store, example_0.store.book];
        expect(actual).to.deep.equal(expected);
    });

    it('$..*', function () {
        var jp = jsonpath.instance('$..*');
        var actual = jp(example_0);
        var expected = [example_0.store, example_0.store.book, example_0.store.bicycle];
        example_0.store.book.forEach(function (book) {
            expected.push(book);
        });
        example_0.store.book.forEach(function (book) {
            Object.keys(book).forEach(function (key) {
                expected.push(book[key]);
            });
        });
        expected.push(example_0.store.bicycle.color);
        expected.push(example_0.store.bicycle.price);
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', function () {
        var jp = jsonpath.instance('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]');
        var actual = jp(example_0);
        var expected = example_0.store.book.slice(1);
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price.round()', function () {
        var opts = {
            functions: {
                round: function (obj) {
                    return Math.round(obj);
                }
            }
        };
        var jp = jsonpath.instance('$.store..price.round()', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return Math.round(book.price);
        });
        expected.push(Math.round(example_0.store.bicycle.price));
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[1].pricex', function () {
        var jp = jsonpath.instance('$store.book[1].pricex', opts);
        var actual = jp(example_0);
        var expected = [];
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[*].pricex', function () {
        var jp = jsonpath.instance('$store.book[*].pricex', opts);
        var actual = jp(example_0);
        var expected = [];
        expect(actual).to.deep.equal(expected);
    });
});

describe('example-0, wrap=false', function () {
    var opts = {
        wrap: false
    };

    it('$.store.book[*].author', function () {
        var jp = jsonpath.instance('$.store.book[*].author', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..author', function () {
        var jp = jsonpath.instance('$..author', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.*', function () {
        var jp = jsonpath.instance('$.store.*', opts);
        var actual = jp(example_0);
        var expected = [example_0.store.book, example_0.store.bicycle];
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price', function () {
        var jp = jsonpath.instance('$.store..price', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return book.price;
        });
        expected.push(example_0.store.bicycle.price);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[2]', function () {
        var jp = jsonpath.instance('$..book[2]', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book[2];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[(@.length-1)]', function () {
        var jp = jsonpath.instance('$..book[(@.length-1)]', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book[3];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[-1:]', function () {
        var jp = jsonpath.instance('$..book[-1:]', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book[3];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[1,2]', function () {
        var jp = jsonpath.instance('$..book[1,2]', opts);
        var actual = jp(example_0);
        var expected = [example_0.store.book[1], example_0.store.book[2]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[:2]', function () {
        var jp = jsonpath.instance('$..book[:2]', opts);
        var actual = jp(example_0);
        var expected = [example_0.store.book[0], example_0.store.book[1]];
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[1].price', function () {
        var jp = jsonpath.instance('$store.book[1].price', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book[1].price;
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[*][category,author]', function () {
        var jp = jsonpath.instance('$..book[*][category,author]', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.reduce(function (r, book) {
            r.push(book.category);
            r.push(book.author);
            return r;
        }, []);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[?(@.isbn)]', function () {
        var jp = jsonpath.instance('$..book[?(@.isbn)]', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.filter(function (book) {
            return book.isbn;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..[?(@.price>19)]^', function () {
        var jp = jsonpath.instance('$..[?(@.price>19)]^', opts);
        var actual = jp(example_0);
        var expected = [example_0.store, example_0.store.book];
        expect(actual).to.deep.equal(expected);
    });

    it('$..*', function () {
        var jp = jsonpath.instance('$..*', opts);
        var actual = jp(example_0);
        var expected = [example_0.store, example_0.store.book, example_0.store.bicycle];
        example_0.store.book.forEach(function (book) {
            expected.push(book);
        });
        example_0.store.book.forEach(function (book) {
            Object.keys(book).forEach(function (key) {
                expected.push(book[key]);
            });
        });
        expected.push(example_0.store.bicycle.color);
        expected.push(example_0.store.bicycle.price);
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', function () {
        var jp = jsonpath.instance('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.slice(1);
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price.round()', function () {
        var opts = {
            wrap: false,
            functions: {
                round: function (obj) {
                    return Math.round(obj);
                }
            }
        };
        var jp = jsonpath.instance('$.store..price.round()', opts, opts);
        var actual = jp(example_0);
        var expected = example_0.store.book.map(function (book) {
            return Math.round(book.price);
        });
        expected.push(Math.round(example_0.store.bicycle.price));
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[1].pricex', function () {
        var jp = jsonpath.instance('$store.book[1].pricex', opts);
        var actual = jp(example_0);
        var expected = null;
        expect(actual).to.deep.equal(expected);
    });

    it('$store.book[*].pricex', function () {
        var jp = jsonpath.instance('$store.book[*].pricex', opts);
        var actual = jp(example_0);
        var expected = null;
        expect(actual).to.deep.equal(expected);
    });
});
