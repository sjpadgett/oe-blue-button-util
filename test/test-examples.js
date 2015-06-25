 "use strict";

 var chai = require('chai');

 var bbu = require('../index');

 var expect = chai.expect;

 describe('examples', function () {
     var ob = bbu.object;
     var obs = bbu.objectset;
     var arrs = bbu.arrayset;
     var dtt = bbu.datetime;

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
 });
