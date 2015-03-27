"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var jsonpath = bbu.jsonpath;

describe('original example', function () {
    it('$.store.book[*].author', function () {
        var actual = jsonpath.normalize('$.store.book[*].author');
        expect(actual).to.deep.equal(['$', 'store', 'book', '*', 'author']);
    });

    it('$..author', function () {
        var actual = jsonpath.normalize('$..author');
        expect(actual).to.deep.equal(['$', '..', 'author']);
    });

    it('$.store.*', function () {
        var actual = jsonpath.normalize('$.store.*');
        expect(actual).to.deep.equal(['$', 'store', '*']);
    });

    it('$.store..price', function () {
        var actual = jsonpath.normalize('$.store..price');
        expect(actual).to.deep.equal(['$', 'store', '..', 'price']);
    });

    it('$..book[2]', function () {
        var actual = jsonpath.normalize('$..book[2]');
        expect(actual).to.deep.equal(['$', '..', 'book', '2']);
    });

    it('$..book[(@.length-1)]', function () {
        var actual = jsonpath.normalize('$..book[(@.length-1)]');
        expect(actual).to.deep.equal(['$', '..', 'book', '(@.length-1)']);
    });

    it('$..book[-1:]', function () {
        var actual = jsonpath.normalize('$..book[-1:]');
        expect(actual).to.deep.equal(['$', '..', 'book', '-1:']);
    });

    it('$..book[1,2]', function () {
        var actual = jsonpath.normalize('$..book[1,2]');
        expect(actual).to.deep.equal(['$', '..', 'book', '1,2']);
    });

    it('$..book[:2]', function () {
        var actual = jsonpath.normalize('$..book[:2]');
        expect(actual).to.deep.equal(['$', '..', 'book', ':2']);
    });

    it('$..book[*][category,author]', function () {
        var actual = jsonpath.normalize('$..book[*][category,author]');
        expect(actual).to.deep.equal(['$', '..', 'book', '*', 'category,author']);
    });

    it('$..book[?(@.isbn)]', function () {
        var actual = jsonpath.normalize('$..book[?(@.isbn)]');
        expect(actual).to.deep.equal(['$', '..', 'book', '?(@.isbn)']);
    });

    it('$..[?(@.price>19)]^', function () {
        var actual = jsonpath.normalize('$..[?(@.price>19)]^');
        expect(actual).to.deep.equal(['$', '..', '?(@.price>19)', '^']);
    });

    it('$..*', function () {
        var actual = jsonpath.normalize('$..*');
        expect(actual).to.deep.equal(['$', '..', '*']);
    });

    it('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', function () {
        var actual = jsonpath.normalize('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]');
        expect(actual).to.deep.equal(['$', 'store', 'book', '?(@path !== "$[\'store\'][\'book\'][0]")']);
    });
});
