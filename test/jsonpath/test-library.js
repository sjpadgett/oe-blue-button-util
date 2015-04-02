"use strict";

var chai = require('chai');

var bbu = require('../../index');

var expect = chai.expect;
var jsonpath = bbu.jsonpath;

var library = require('./examples/library.json');

describe('jsonpath library example', function () {
    var link = library.library.books.reduce(function (r, book) {
        var id = book.id;
        r[id] = book;
        return r;
    }, {});

    var findLinked = function (obj) {
        return link[obj];
    };

    it('predefined functions', function () {
        var jp = jsonpath.instance('$.library.books[0].references[*].findLinked().title', {
            functions: {
                findLinked: findLinked
            }
        });

        var actual = jp(library);
        var expected = ["Sword of Honour", "The Lord of the Rings"];
        expect(actual).to.deep.equal(actual);
    });

    it('undefined predefined functions', function () {
        var jpbinded = jsonpath.instance.bind('$.library.books[0].references[*].findLinked().title');
        expect(jpbinded).to.throw(Error);
    });

    it('postdefined functions', function () {
        var jp = jsonpath.instance('$.library.books[0].references[*].findLinked().title');
        var actual = jp(library, {
            findLinked: findLinked
        });
    });
});
