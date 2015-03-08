"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var datetime = bbu.datetime;

describe('datetime: dateToModel->modelToDate->dateToModel', function () {
    ['2012', '2012-05', '2012-05-23'].forEach(function (input) {
        it(input, function () {
            var model = datetime.dateToModel(input);
            expect(model).to.exist();
            var reInput = datetime.modelToDate(model);
            expect(reInput).to.equal(input);
        });
    });
});

describe('datetime: dateTimeToModel->modelToDateTime->dateTimeToModel', function () {
    ['2012-05-23', '2015-03-07T16:44:28.730Z'].forEach(function (input) {
        it(input, function () {
            var model = datetime.dateTimeToModel(input);
            expect(model).to.exist();
            var reInput = datetime.modelToDateTime(model);
            expect(reInput).to.equal(input);
        });
    });
});

describe('dateTime.modelToDate', function () {
    it('higher precision', function () {
        var input = {
            date: '2015-03-07T16:44:28.000Z',
            precision: 'second'
        };
        var actual = datetime.modelToDate(input);
        expect(actual).to.equal('2015-03-07');
    });
});

describe('dateTime.dateToModel', function () {
    it('error', function () {
        var input = '2015-15-07T16:44:28.000Z';
        var actual = datetime.dateToModel(input);
        expect(actual).to.equal(null);
    });
});
