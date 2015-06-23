"use strict";

var chai = require('chai');

var jsonpath = require('../../lib/jsonpath/parser');

var expect = chai.expect;

describe('jsonpath normalization', function () {
    it('$.store.book[*].author', function () {
        var actual = jsonpath.normalize('$.store.book[*].author');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, 'store', 'book', jsonpath.types.WILDCARD, 'author']);
    });

    it('$..author', function () {
        var actual = jsonpath.normalize('$..author');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'author']);
    });

    it('$.store.*', function () {
        var actual = jsonpath.normalize('$.store.*');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, 'store', jsonpath.types.WILDCARD]);
    });

    it('$.store..price', function () {
        var actual = jsonpath.normalize('$.store..price');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, 'store', jsonpath.types.RECURSIVE_DESCENT, 'price']);
    });

    it('$..book[2]', function () {
        var actual = jsonpath.normalize('$..book[2]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'book', '2']);
    });

    it('$..book[(@.length-1)]', function () {
        var actual = jsonpath.normalize('$..book[(@.length-1)]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'book', '(@.length-1)']);
    });

    it('$..book[-1:]', function () {
        var actual = jsonpath.normalize('$..book[-1:]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'book', '-1:']);
    });

    it('$..book[1,2]', function () {
        var actual = jsonpath.normalize('$..book[1,2]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'book', '1,2']);
    });

    it('$..book[:2]', function () {
        var actual = jsonpath.normalize('$..book[:2]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'book', ':2']);
    });

    it('$..book[*][category,author]', function () {
        var actual = jsonpath.normalize('$..book[*][category,author]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'book', jsonpath.types.WILDCARD, 'category,author']);
    });

    it('$..book[?(@.isbn)]', function () {
        var actual = jsonpath.normalize('$..book[?(@.isbn)]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, 'book', '?(@.isbn)']);
    });

    it('$..[?(@.price>19)]^', function () {
        var actual = jsonpath.normalize('$..[?(@.price>19)]^');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, '?(@.price>19)', jsonpath.types.PARENT]);
    });

    it('$..*', function () {
        var actual = jsonpath.normalize('$..*');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, jsonpath.types.WILDCARD]);
    });

    it('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', function () {
        var actual = jsonpath.normalize('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, 'store', 'book', '?(@path !== "$[\'store\'][\'book\'][0]")']);
    });

    it('$.store..price.round()', function () {
        var actual = jsonpath.normalize('$.store..price.round()');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, 'store', jsonpath.types.RECURSIVE_DESCENT, 'price', 'round()']);
    });

    it('$.link[$.obj.library.books[0].references[*]].title', function () {
        var actual = jsonpath.normalize('$.link[$.obj.library.books[0].references[*]].title');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, 'link', '$.obj.library.books[0].references[*]', 'title']);
    });

    it('$', function () {
        var actual = jsonpath.normalize('$');
        expect(actual).to.deep.equal([jsonpath.types.ROOT]);
    });

    xit('$..book[*].category^', function () {
        var fn = jsonpath.instance.bind(null, '$..book[*].category^');
        expect(fn).to.throw(Error);
    });
});
