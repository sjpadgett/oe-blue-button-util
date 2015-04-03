 "use strict";

 var chai = require('chai');

 var bbu = require('../index');

 var expect = chai.expect;

 describe('examples', function () {
     var ob = bbu.object;
     var obs = bbu.objectset;
     var arrs = bbu.arrayset;
     var dtt = bbu.datetime;
     var pred = bbu.predicate;
     var jsonpath = bbu.jsonpath;

     it('object.exists', function () {
         var r0 = ob.exists(null);
         var r1 = ob.exists(undefined);
         var r2 = ob.exists('anything else');

         //console.log(r0); // false
         //console.log(r1); // false
         //console.log(r2); // true
         expect(r0).to.equal(false);
         expect(r1).to.equal(false);
         expect(r2).to.equal(true);
     });

     it('object.deepValue - 0', function () {
         var input = {
             a: {
                 b: {
                     c: 1
                 },
                 d: 2
             },
             e: 3
         };

         var r0 = ob.deepValue(null, 'any');
         var r1 = ob.deepValue(input, 'a.b');
         var r2 = ob.deepValue(input, 'a.b.c');
         var r3 = ob.deepValue(input, 'a.e.f');
         var r4 = ob.deepValue(input, 'a.f');
         var r5 = ob.deepValue('primary data types', 'any');

         //console.log(r0); // null
         //console.log(r1); // {c: 1}
         //console.log(r2); // 1
         //console.log(r3); // null
         //console.log(r4); // null
         //console.log(r5); // null
         expect(r0).to.equal(null);
         expect(r1).to.deep.equal({
             c: 1
         });
         expect(r2).to.equal(1);
         expect(r3).to.equal(null);
         expect(r4).to.equal(null);
         expect(r5).to.equal(null);
     });

     it('object.deepValue - 0', function () {
         var input = [{
             a: 1
         }, {
             b: ['value']
         }];

         var r0 = ob.deepValue(input, '0.a');
         var r1 = ob.deepValue(input, '1.b');
         var r2 = ob.deepValue(input, '1.b.0');

         //console.log(r0); // 1
         //console.log(r1); // ['value']
         //console.log(r2); // 'value'
         expect(r0).to.equal(1);
         expect(r1).to.deep.equal(['value']);
         expect(r2).to.equal('value');
     });

     it('objectset.compact - 1', function () {
         var obj = {
             a: 1,
             b: null,
             c: {
                 d: undefined,
                 e: 4
             },
             f: {
                 g: null
             }
         };

         obs.compact(obj);
         //console.log(obj); // {a: 1, c:{e:4}, f:{}}
         expect(obj).to.deep.equal({
             a: 1,
             c: {
                 e: 4
             },
             f: {}
         });
     });

     it('objectset.deepValue - 0', function () {
         var obj = {};

         obs.deepValue(obj, 'a.b', 'value');
         //console.log(obj); // {a: {b: 'value'}}
         expect(obj).to.deep.equal({
             a: {
                 b: 'value'
             }
         });
     });

     it('objectset.deepValue - 1', function () {
         var obj = {
             a: 1,
             b: {
                 c: 2,
                 d: 3
             }
         };

         obs.deepValue(obj, 'b.c', {
             e: 4
         });
         //console.log(obj); // {a: 1, b: {c: {e: 4}, d: 3}}
         expect(obj).to.deep.equal({
             a: 1,
             b: {
                 c: {
                     e: 4
                 },
                 d: 3
             }
         });
     });

     it('arrayset.append', function () {
         var arr = ['a', 'b'];

         arrs.append(arr, ['c', 'd']);
         //console.log(arr); // ['a', 'b', 'c', 'd'];
         expect(arr).to.deep.equal(['a', 'b', 'c', 'd']);
     });

     it('datetime.dateToModel', function () {
         var r0 = dtt.dateToModel('2014');
         var r1 = dtt.dateToModel('2014-02');
         var r2 = dtt.dateToModel('2014-02-07');
         var r3 = dtt.dateToModel('2014-02-07T12:45:04.000Z');

         //console.log(r0); // {date: '2014-01-01T00:00:00.000Z', precision: 'year'}
         //console.log(r1); // {date: '2014-02-01T00:00:00.000Z', precision: 'month'}
         //console.log(r2); // {date: '2014-02-07T00:00:00.000Z', precision: 'day'}
         //console.log(r3); // {date: '2014-02-07T00:00:00.000Z', precision: 'day'}
         expect(r0).to.deep.equal({
             date: '2014-01-01T00:00:00.000Z',
             precision: 'year'
         });
         expect(r1).to.deep.equal({
             date: '2014-02-01T00:00:00.000Z',
             precision: 'month'
         });
         expect(r2).to.deep.equal({
             date: '2014-02-07T00:00:00.000Z',
             precision: 'day'
         });
         expect(r3).to.deep.equal({
             date: '2014-02-07T00:00:00.000Z',
             precision: 'day'
         });
     });

     it('datetime.dateTimeToModel', function () {
         var r0 = dtt.dateTimeToModel('2014');
         var r1 = dtt.dateTimeToModel('2014-02');
         var r2 = dtt.dateTimeToModel('2014-02-07');
         var r3 = dtt.dateTimeToModel('2014-02-07T12:45:04.000Z');

         //console.log(r0); // {date: '2014-01-01T00:00:00.000Z', precision: 'year'}
         //console.log(r1); // {date: '2014-02-01T00:00:00.000Z', precision: 'month'}
         //console.log(r2); // {date: '2014-02-07T00:00:00.000Z', precision: 'day'}
         //console.log(r3); // {date: '2014-02-07T12:45:04.000Z', precision: 'second'}
         expect(r0).to.deep.equal({
             date: '2014-01-01T00:00:00.000Z',
             precision: 'year'
         });
         expect(r1).to.deep.equal({
             date: '2014-02-01T00:00:00.000Z',
             precision: 'month'
         });
         expect(r2).to.deep.equal({
             date: '2014-02-07T00:00:00.000Z',
             precision: 'day'
         });
         expect(r3).to.deep.equal({
             date: '2014-02-07T12:45:04.000Z',
             precision: 'second'
         });
     });

     it('datetime.modelToDate', function () {
         var r0 = dtt.modelToDate({
             date: '2014-01-01T00:00:00.000Z',
             precision: 'year'
         });
         var r1 = dtt.modelToDate({
             date: '2014-02-01T00:00:00.000Z',
             precision: 'month'
         });
         var r2 = dtt.modelToDate({
             date: '2014-02-07T00:00:00.000Z',
             precision: 'day'
         });
         var r3 = dtt.modelToDate({
             date: '2014-02-07T12:45:04.000Z',
             precision: 'second'
         });

         //console.log(r0); // '2014'
         //console.log(r1); // '2014-02'
         //console.log(r2); // '2014-02-07'
         //console.log(r3); // '2014-02-07'
         expect(r0).to.equal('2014');
         expect(r1).to.equal('2014-02');
         expect(r2).to.equal('2014-02-07');
         expect(r3).to.equal('2014-02-07');
     });

     it('datetime.modelToDateTime', function () {
         var r0 = dtt.modelToDateTime({
             date: '2014-01-01T00:00:00.000Z',
             precision: 'year'
         });
         var r1 = dtt.modelToDateTime({
             date: '2014-02-01T00:00:00.000Z',
             precision: 'month'
         });
         var r2 = dtt.modelToDateTime({
             date: '2014-02-07T00:00:00.000Z',
             precision: 'day'
         });
         var r3 = dtt.modelToDateTime({
             date: '2014-02-07T12:45:04.000Z',
             precision: 'second'
         });
         var r4 = dtt.modelToDateTime({
             date: '2014-02-07T12:45:04.010Z',
             precision: 'subsecond'
         });

         //console.log(r0); // '2014'
         //console.log(r1); // '2014-02'
         //console.log(r2); // '2014-02-07'
         //console.log(r3); // '2014-02-07T12:45:04.000Z'
         //console.log(r4); // '2014-02-07T12:45:04.010Z'
         expect(r0).to.equal('2014');
         expect(r1).to.equal('2014-02');
         expect(r2).to.equal('2014-02-07');
         expect(r3).to.equal('2014-02-07T12:45:04.000Z');
         expect(r4).to.equal('2014-02-07T12:45:04.010Z');
     });

     it('predicate.hasProperty', function () {
         var f = pred.hasProperty('a.b');

         var r0 = f(null);
         var r1 = f({
             a: {
                 c: 1
             }
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });

         //console.log(r0); // false
         //console.log(r1); // false
         //console.log(r2); // true
         expect(r0).to.equal(false);
         expect(r1).to.equal(false);
         expect(r2).to.equal(true);
     });

     it('predicate.hasNoProperty', function () {
         var f = pred.hasNoProperty('a.b');

         var r0 = f(null);
         var r1 = f({
             a: {
                 c: 1
             }
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });

         //console.log(r0); // true
         //console.log(r1); // true
         //console.log(r2); // false
         expect(r0).to.equal(true);
         expect(r1).to.equal(true);
         expect(r2).to.equal(false);
     });

     it('predicate.hasNoProperties', function () {
         var f = pred.hasNoProperties(['a.b', 'c']);

         var r0 = f(null);
         var r1 = f({
             a: {
                 c: 1
             }
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });
         var r3 = f({
             a: {
                 c: 1
             },
             c: 5
         });

         //console.log(r0); // true
         //console.log(r1); // true
         //console.log(r2); // false
         //console.log(r3); // false
         expect(r0).to.equal(true);
         expect(r1).to.equal(true);
         expect(r2).to.equal(false);
         expect(r3).to.equal(false);
     });

     it('predicate.valueSet', function () {
         var f = pred.inValueSet(['Resolved', 'Active']);

         var r0 = f('Any');
         var r1 = f('Resolved');
         var r2 = f('Active');

         //console.log(r0); // false
         //console.log(r1); // true
         //console.log(r2); // true
         expect(r0).to.equal(false);
         expect(r1).to.equal(true);
         expect(r2).to.equal(true);
     });

     it('predicate.propertyValue', function () {
         var f = pred.propertyValue('a.b');

         var r0 = f(null);
         var r1 = f({
             a: 1
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });
         var r3 = f({
             a: {
                 b: {
                     c: 2
                 }
             }
         });
         var r4 = f({
             a: {
                 b: null
             }
         });
         var r5 = f({
             a: {
                 b: false
             }
         });

         //console.log(r0); // falsy
         //console.log(r1); // falsy
         //console.log(r2); // truthy
         //console.log(r3); // truthy
         //console.log(r4); // falsy
         //console.log(r5); // falsy
         expect(r0).not.to.be.ok;
         expect(r1).not.to.be.ok;
         expect(r2).to.be.ok;
         expect(r3).to.be.ok;
         expect(r4).not.to.be.ok;
         expect(r5).not.to.be.ok;
     });

     it('predicate.falsyPropertyValue', function () {
         var f = pred.falsyPropertyValue('a.b');

         var r0 = f(null);
         var r1 = f({
             a: 1
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });
         var r3 = f({
             a: {
                 b: {
                     c: 2
                 }
             }
         });
         var r4 = f({
             a: {
                 b: null
             }
         });
         var r5 = f({
             a: {
                 b: false
             }
         });

         //console.log(r0); // truthy
         //console.log(r1); // truthy
         //console.log(r2); // falsy
         //console.log(r3); // falsy
         //console.log(r4); // truthy
         //console.log(r5); // truthy
         expect(r0).to.be.ok;
         expect(r1).to.be.ok;
         expect(r2).not.to.be.ok;
         expect(r3).not.to.be.ok;
         expect(r4).to.be.ok;
         expect(r5).to.be.ok;
     });

     it('predicate.and', function () {
         var f0 = pred.hasProperty('a.b');
         var f1 = pred.hasProperty('a.c');

         var f = pred.and([f0, f1]);

         var r0 = f(null);
         var r1 = f({
             a: 1
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });
         var r3 = f({
             a: {
                 c: 1
             }
         });
         var r4 = f({
             a: {
                 b: 1,
                 c: 2
             }
         });

         //console.log(r0); // false
         //console.log(r1); // false
         //console.log(r2); // false
         //console.log(r3); // false
         //console.log(r4); // true
         expect(r0).to.equal(false);
         expect(r1).to.equal(false);
         expect(r2).to.equal(false);
         expect(r3).to.equal(false);
         expect(r4).to.equal(true);
     });

     it('predicate.or', function () {
         var f0 = pred.hasProperty('a.b');
         var f1 = pred.hasProperty('a.c');

         var f = pred.or([f0, f1]);

         var r0 = f(null);
         var r1 = f({
             a: 1
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });
         var r3 = f({
             a: {
                 c: 1
             }
         });
         var r4 = f({
             a: {
                 b: 1,
                 c: 2
             }
         });

         //console.log(r0); // false
         //console.log(r1); // false
         //console.log(r2); // true
         //console.log(r3); // true
         //console.log(r4); // true
         expect(r0).to.equal(false);
         expect(r1).to.equal(false);
         expect(r2).to.equal(true);
         expect(r3).to.equal(true);
         expect(r4).to.equal(true);
     });

     it('predicate.not', function () {
         var fn = pred.hasProperty('a');

         var f = pred.not(fn);

         var r0 = f(null);
         var r1 = f({
             a: 1
         });
         var r2 = f({
             a: {
                 b: 1
             }
         });
         var r3 = f({
             b: {
                 c: 1
             }
         });
         var r4 = f({
             b: 1
         });

         //console.log(r0); // true
         //console.log(r1); // false
         //console.log(r2); // flase
         //console.log(r3); // true
         //console.log(r4); // true
         expect(r0).to.equal(true);
         expect(r1).to.equal(false);
         expect(r2).to.equal(false);
         expect(r3).to.equal(true);
         expect(r4).to.equal(true);
     });

     it('jsonpath.instance - 0', function () {
         var example = require('./jsonpath/examples/store.json');

         var options = {
             functions: {
                 round: function (obj) {
                     return Math.round(obj);
                 }
             }
         };
         var jp = jsonpath.instance('$.store..price.round()', options);
         var result = jp(example);
         //console.log(result); // [ 9, 13, 9, 23, 20 ]
         expect(result).to.deep.equal([9, 13, 9, 23, 20]);
     });

     it('jsonpath.instance - 1', function () {
         var example = require('./jsonpath/examples/store.json');

         var round = function (obj) {
             return Math.round(obj);
         };

         var jp = jsonpath.instance('$.store..price.round()');
         var result = jp(example, {
             round: round
         });
         //console.log(result); // [ 9, 13, 9, 23, 20 ]
         expect(result).to.deep.equal([9, 13, 9, 23, 20]);
     });

 });
