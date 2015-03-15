"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var jsonpath = bbu.jsonpath;

var example_0 = {
    "store": {
        "book": [{
            "category": "reference",
            "author": "Nigel Rees",
            "title": "Sayings of the Century",
            "price": 8.95
        }, {
            "category": "fiction",
            "author": "Evelyn Waugh",
            "title": "Sword of Honour",
            "price": 12.99
        }, {
            "category": "fiction",
            "author": "Herman Melville",
            "title": "Moby Dick",
            "isbn": "0-553-21311-3",
            "price": 8.99
        }, {
            "category": "fiction",
            "author": "J. R. R. Tolkien",
            "title": "The Lord of the Rings",
            "isbn": "0-395-19395-8",
            "price": 22.99
        }],
        "bicycle": {
            "color": "red",
            "price": 19.95
        }
    }
};

describe('original example', function () {
    it('$.store.book[*].author', function () {
        var actual = jsonpath({}, example_0, '$.store.book[*].author');
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..author', function () {
        var actual = jsonpath({}, example_0, '$..author');
        var expected = example_0.store.book.map(function (book) {
            return book.author;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.*', function () {
        var actual = jsonpath({}, example_0, '$.store.*');
        var expected = [example_0.store.book, example_0.store.bicycle];
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price', function () {
        var actual = jsonpath({}, example_0, '$.store..price');
        var expected = example_0.store.book.map(function (book) {
            return book.price;
        });
        expected.push(example_0.store.bicycle.price);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[2]', function () {
        var actual = jsonpath({}, example_0, '$..book[2]');
        var expected = [example_0.store.book[2]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[(@.length-1)]', function () {
        var actual = jsonpath({}, example_0, '$..book[(@.length-1)]');
        var expected = [example_0.store.book[3]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[-1:]', function () {
        var actual = jsonpath({}, example_0, '$..book[-1:]');
        var expected = [example_0.store.book[3]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[1,2]', function () {
        var actual = jsonpath({}, example_0, '$..book[1,2]');
        var expected = [example_0.store.book[1], example_0.store.book[2]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[:2]', function () {
        var actual = jsonpath({}, example_0, '$..book[:2]');
        var expected = [example_0.store.book[0], example_0.store.book[1]];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[*][category,author]', function () {
        var actual = jsonpath({}, example_0, '$..book[*][category,author]');
        var expected = example_0.store.book.reduce(function (r, book) {
            r.push(book.category);
            r.push(book.author);
            return r;
        }, []);
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[?(@.isbn)]', function () {
        var actual = jsonpath({}, example_0, '$..book[?(@.isbn)]');
        var expected = example_0.store.book.filter(function (book) {
            return book.isbn;
        });
        expect(actual).to.deep.equal(expected);
    });

    it('$..[?(@.price>19)]^', function () {
        var actual = jsonpath({}, example_0, '$..[?(@.price>19)]^');
        var expected = [example_0.store, example_0.store.book];
        expect(actual).to.deep.equal(expected);
    });

    it('$..*', function () {
        var actual = jsonpath({}, example_0, '$..*');
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
        var actual = jsonpath({}, example_0, '$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]');
        var expected = example_0.store.book.slice(1);
        expect(actual).to.deep.equal(expected);
    });

});
