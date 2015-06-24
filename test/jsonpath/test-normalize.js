"use strict";

var chai = require('chai');

var jsonpath = require('../../lib/jsonpath/parser');

var expect = chai.expect;

describe('jsonpath normalization', function () {
    var toNode = function (property) {
        return {
            type: 'property',
            parameter: property
        };
    };

    it('$.store.book[*].author', function () {
        var actual = jsonpath.normalize('$.store.book[*].author');
        var expected = [
            jsonpath.types.ROOT,
            toNode('store'),
            toNode('book'),
            jsonpath.types.WILDCARD,
            toNode('author')
        ];
        expect(actual).to.deep.equal(expected);
    });

    it('$..author', function () {
        var actual = jsonpath.normalize('$..author');
        var expected = [
            jsonpath.types.ROOT,
            jsonpath.types.RECURSIVE_DESCENT,
            toNode('author')
        ];
        expect(actual).to.deep.equal(expected);
    });

    it('$.store.*', function () {
        var actual = jsonpath.normalize('$.store.*');
        var expected = [jsonpath.types.ROOT, toNode('store'), jsonpath.types.WILDCARD];
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price', function () {
        var actual = jsonpath.normalize('$.store..price');
        var expected = [jsonpath.types.ROOT, toNode('store'), jsonpath.types.RECURSIVE_DESCENT, toNode('price')];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[2]', function () {
        var actual = jsonpath.normalize('$..book[2]');
        var expected = [
            jsonpath.types.ROOT,
            jsonpath.types.RECURSIVE_DESCENT,
            toNode('book'), {
                type: 'properties',
                parameter: [2]
            }
        ];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[(@.length-1)]', function () {
        var actual = jsonpath.normalize('$..book[(@.length-1)]');
        var expected = [jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, toNode('book'), {
            type: 'script',
            parameter: '@.length-1'
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[-1:]', function () {
        var actual = jsonpath.normalize('$..book[-1:]');
        var expected = [jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, toNode('book'), {
            type: 'properties',
            parameter: [{
                start: -1,
                end: null,
                step: 1
            }]
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[1,2]', function () {
        var actual = jsonpath.normalize('$..book[1,2]');
        var expected = [jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, toNode('book'), {
            type: 'properties',
            parameter: [1, 2]
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[:2]', function () {
        var actual = jsonpath.normalize('$..book[:2]');
        var expected = [jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, toNode('book'), {
            type: 'properties',
            parameter: [{
                start: 0,
                end: 2,
                step: 1
            }]
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[*][category,author]', function () {
        var actual = jsonpath.normalize('$..book[*][category,author]');
        var expected = [jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, toNode('book'), jsonpath.types.WILDCARD, {
            type: 'properties',
            parameter: ['category', 'author']
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$..book[?(@.isbn)]', function () {
        var actual = jsonpath.normalize('$..book[?(@.isbn)]');
        var expected = [jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, toNode('book'), {
            type: 'filter_script',
            parameter: '@.isbn'
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$..[?(@.price>19)]^', function () {
        var actual = jsonpath.normalize('$..[?(@.price>19)]^');
        var filterScriptNode = {
            type: 'filter_script',
            parameter: '@.price>19'
        };
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, filterScriptNode, jsonpath.types.PARENT]);
    });

    it('$..*', function () {
        var actual = jsonpath.normalize('$..*');
        expect(actual).to.deep.equal([jsonpath.types.ROOT, jsonpath.types.RECURSIVE_DESCENT, jsonpath.types.WILDCARD]);
    });

    it('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]', function () {
        var actual = jsonpath.normalize('$.store.book[?(@path !== "$[\'store\'][\'book\'][0]")]');
        var expected = [jsonpath.types.ROOT, toNode('store'), toNode('book'), {
            type: 'filter_script',
            parameter: '@path !== "$[\'store\'][\'book\'][0]"'
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$.store..price.round()', function () {
        var actual = jsonpath.normalize('$.store..price.round()');
        var expected = [jsonpath.types.ROOT, toNode('store'), jsonpath.types.RECURSIVE_DESCENT, toNode('price'), {
            type: 'fn',
            parameter: 'round'
        }];
        expect(actual).to.deep.equal(expected);
    });

    it('$.link[$.obj.library.books[0].references[*]].title', function () {
        var actual = jsonpath.normalize('$.link[$.obj.library.books[0].references[*]].title');
        var expected = [jsonpath.types.ROOT, toNode('link'), {
            type: 'subpath',
            parameter: '$.obj.library.books[0].references[*]'
        }, toNode('title')];
        expect(actual).to.deep.equal(expected);
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
