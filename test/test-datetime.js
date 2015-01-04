"use strict";

var chai = require('chai');

var bbu = require('../index');

var expect = chai.expect;
var datetime = bbu.datetime;

describe('iso->model->iso compare', function () {
    ['2012', '2012-05', '2012-05-23'].forEach(function (input) {
        it(input, function () {
            var model = datetime.dateToModel(input);
            expect(model).to.exist();
            var reInput = datetime.modelToDate(model);
            expect(reInput).to.equal(input);
        });
    });
});
