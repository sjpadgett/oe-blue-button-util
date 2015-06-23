"use strict";

var chai = require('chai');

var parser = require('../../lib/jsonpath/parser.js');

var expect = chai.expect;
var re = parser.re;

describe('reqular expression', function () {
    var expectSingleMatch = function (expression, result, count) {
        count = count || 1;
        expect(result).not.to.equal(null);
        expect(result.length).to.equal(count);
        expect(result[0]).to.equal(expression);
    };

    describe('identifier', function () {
        var expressions = [
            '$',
            '$aA',
            '$29Ab',
            'a2etA',
            'buyet',
            'A',
            'C2345'
        ];

        expressions.forEach(function (expression) {
            it(expression, function () {
                var result = re.identifier.exec(expression);
                expectSingleMatch(expression, result);
            });

            var withComma = expression + ',';
            it(withComma, function () {
                var result = re.identifier.exec(withComma);
                expectSingleMatch(expression, result);
            });

            var withCommaRepeat = expression + ',' + expression;
            it(withCommaRepeat, function () {
                var result = re.identifier.exec(withCommaRepeat);
                expectSingleMatch(expression, result);
            });
        });
    });

    describe('range - index only', function () {
        var expressions = [
            '-1',
            '0',
            '20',
            '9'
        ];

        expressions.forEach(function (expression) {
            it(expression, function () {
                var result = re.range.exec(expression);
                expectSingleMatch(expression, result, 4);
                expect(result[1]).to.equal(expression);
                expect(result[2]).to.equal(undefined);
                expect(result[3]).to.equal(undefined);
            });

            var withComma = expression + ',';
            it(withComma, function () {
                var result = re.range.exec(withComma);
                expectSingleMatch(expression, result, 4);
                expect(result[1]).to.equal(expression);
                expect(result[2]).to.equal(undefined);
                expect(result[3]).to.equal(undefined);
            });

            var withCommaRepeat = expression + ',' + expression;
            it(withCommaRepeat, function () {
                var result = re.range.exec(withCommaRepeat);
                expectSingleMatch(expression, result, 4);
                expect(result[1]).to.equal(expression);
                expect(result[2]).to.equal(undefined);
                expect(result[3]).to.equal(undefined);
            });
        });
    });

    describe('range - start:end', function () {
        var expressions = [
            '1:10',
            '0:-4',
            '2:5',
            '9:11'
        ];

        expressions.forEach(function (expression) {
            it(expression, function () {
                var result = re.range.exec(expression);
                expectSingleMatch(expression, result, 4);
                var actuals = expression.split(':');
                expect(result[1]).to.equal(actuals[0]);
                expect(result[2]).to.equal(actuals[1]);
                expect(result[3]).to.equal(undefined);
            });

            var withComma = expression + ',';
            it(withComma, function () {
                var result = re.range.exec(withComma);
                expectSingleMatch(expression, result, 4);
                var actuals = expression.split(':');
                expect(result[1]).to.equal(actuals[0]);
                expect(result[2]).to.equal(actuals[1]);
                expect(result[3]).to.equal(undefined);
            });

            var withCommaRepeat = expression + ',' + expression;
            it(withCommaRepeat, function () {
                var result = re.range.exec(withCommaRepeat);
                expectSingleMatch(expression, result, 4);
                var actuals = expression.split(':');
                expect(result[1]).to.equal(actuals[0]);
                expect(result[2]).to.equal(actuals[1]);
                expect(result[3]).to.equal(undefined);
            });
        });
    });

    describe('range - start:step:end', function () {
        var expressions = [
            '1:1:10',
            '0:2:-4',
            '2:2:5',
            '11:-2:0'
        ];

        expressions.forEach(function (expression) {
            it(expression, function () {
                var result = re.range.exec(expression);
                expectSingleMatch(expression, result, 4);
                var actuals = expression.split(':');
                expect(result[1]).to.equal(actuals[0]);
                expect(result[2]).to.equal(actuals[1]);
                expect(result[3]).to.equal(actuals[2]);
            });

            var withComma = expression + ',';
            it(withComma, function () {
                var result = re.range.exec(withComma);
                expectSingleMatch(expression, result, 4);
                var actuals = expression.split(':');
                expect(result[1]).to.equal(actuals[0]);
                expect(result[2]).to.equal(actuals[1]);
                expect(result[3]).to.equal(actuals[2]);
            });

            var withCommaRepeat = expression + ',' + expression;
            it(withCommaRepeat, function () {
                var result = re.range.exec(withCommaRepeat);
                expectSingleMatch(expression, result, 4);
                var actuals = expression.split(':');
                expect(result[1]).to.equal(actuals[0]);
                expect(result[2]).to.equal(actuals[1]);
                expect(result[3]).to.equal(actuals[2]);
            });
        });
    });

    describe('quoted string', function () {
        var expressions = [
            '\'a&b\\\'"x\'',
            '\'abse22\''
        ];

        expressions.forEach(function (expression) {
            it(expression, function () {
                var result = re.q_string.exec(expression);
                expectSingleMatch(expression, result);
            });

            var withComma = expression + ',';
            it(withComma, function () {
                var result = re.q_string.exec(withComma);
                expectSingleMatch(expression, result);
            });

            var withCommaRepeat = expression + ',' + expression;
            it(withCommaRepeat, function () {
                var result = re.q_string.exec(withCommaRepeat);
                expectSingleMatch(expression, result);
            });
        });
    });

    describe('double quoted string', function () {
        var expressions = [
            '"a\'&b\\"x"',
            '"abse22"'
        ];

        expressions.forEach(function (expression) {
            it(expression, function () {
                var result = re.qq_string.exec(expression);
                expectSingleMatch(expression, result);
            });

            var withComma = expression + ',';
            it(withComma, function () {
                var result = re.qq_string.exec(withComma);
                expectSingleMatch(expression, result);
            });

            var withCommaRepeat = expression + ',' + expression;
            it(withCommaRepeat, function () {
                var result = re.qq_string.exec(withCommaRepeat);
                expectSingleMatch(expression, result);
            });
        });
    });
});
