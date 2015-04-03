blue-button-util
================

Common utility methods for Amida-Tech repositories

[![NPM](https://nodei.co/npm/blue-button-util.png)](https://nodei.co/npm/blue-button-util/)

[![Build Status](https://travis-ci.org/amida-tech/blue-button-util.svg)](https://travis-ci.org/amida-tech/blue-button-util)
[![Coverage Status](https://coveralls.io/repos/amida-tech/blue-button-util/badge.png)](https://coveralls.io/r/amida-tech/blue-button-util)

This library provides common Javascript utilities that are used in other Amida-Tech libraries.

##Utilities

You can install using [npm](https://www.npmjs.com) and  `require` to use in [node.js](https://nodejs.org/)
```js
var bbu = require('blue-button-util');

var ob = bbu.object;         // object library
var obs = bbu.object;        // objectset library
var arrs = bbu.arrayset;     // arrayset library
var dtt = bbu.datetime;      // datetime library
var pred = bbu.pred;         // predicate library
var jsonpath = bbu.jsonpath; // jsonpath library
```

The following methods are provided
- [`object.exists`](#object.exists)
- [`object.deepValue`](#object.deepValue)
- [`objectset.compact`](#objectset.compact)
- [`objectset.deepValue`](#objectset.deepValue)
- [`arrayset.append`](#arrayset.append)
- [`datetime.dateToModel`](#datetime.dateToModel)
- [`datetime.dateTimeToModel`](#datetime.dateTimeToModel)
- [`datetime.modelToDate`](#datetime.modelToDate)
- [`datetime.modelToDateTime`](#datetime.modelToDateTime)
- [`predicate.hasProperty`](#predicate.hasProperty)
- [`predicate.hasNoProperty`](#predicate.hasNoProperty)
- [`predicate.hasNoProperties`](#predicate.hasNoProperties)
- [`predicate.inValueSet`](#predicate.inValueSet)
- [`predicate.propertyValue`](#predicate.propertyValue)
- [`predicate.falsyPropertyValue`](#predicate.falsyPropertyValue)
- [`predicate.and`](#predicate.and)
- [`predicate.or`](#predicate.or)
- [`predicate.not`](#predicate.not)
- [`jsonpath.instance`](#jsonpath.instance)

### `object` Library

Provides utility methods for objects.

<a name="object.exists" />
####exists(obj)

Checks if `obj` is not `undefined` or `null`
```js
var r0 = ob.exists(null);
var r1 = ob.exists(undefined);
var r2 = ob.exists('anything else');

console.log(r0); // false
console.log(r1); // false
console.log(r2); // true
```

<a name="object.deepValue" />
####deepValue(obj, deepProperty)

Returns `obj` deep values where `deepProperty` can be '.' delimited keys
```js
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

console.log(r0); // null
console.log(r1); // {c: 1}
console.log(r2); // 1
console.log(r3); // null
console.log(r4); // null
console.log(r5); // null
```

Nothing special is done for arrays so you can specify indices in `deepProperty`
```js
var input = [{
    a: 1
}, {
    b: ['value']
}];

var r0 = ob.deepValue(input, '0.a');
var r1 = ob.deepValue(input, '1.b');
var r2 = ob.deepValue(input, '1.b.0');

console.log(r0); // 1
console.log(r1); // ['value']
console.log(r2); // 'value'
```

### `objectset` Library

Provides utility methods that modify an object.

<a name="objectset.compact" />
####objectset.compact(obj)

Recursively removes all `null` and `undefined` values from `obj`.  No special handling is done for resulting empty objects or arrays
```js
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
console.log(obj); // {a: 1, c:{e:4}, f:{}}
```

<a name="objectset.deepValue" />
####objectset.deepValue(obj, deepProperty, value)

Assigns `value` to `deepProperty` of `obj` possibly creating multiple objects
```js
var obj = {};

obs.deepValue(obj, 'a.b', 'value');
console.log(obj); // {a: {b: 'value'}}
```

Existing keys are kept for destination `obj` but their values might ve overridden
```js
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
console.log(obj); // {a: 1, b: {c: {e: 4}, d: 3}}

```

### `arrayset` Library

Provides utility methods that modify an array.

<a name="arrayset.append" />
#### append(arr, arrToAppend)

Appends `arrToAppend` elements to `arr`
```js
var arr = ['a', 'b'];

arrs.append(arr, ['c', 'd']);
console.log(arr); // ['a', 'b', 'c', 'd'];
```

### `datetime` Library

Provides conversion methods to/from [blue-button-model](https://github.com/amida-tech/blue-button-model) datetimes from/to ISO datetimes.

<a name="datetime.dateToModel" />
#### datetime.dateToModel(d)

Converts ISO date `d` to [blue-button-model](https://github.com/amida-tech/blue-button-model) datetime
```js
var r0 = dtt.dateToModel('2014');
var r1 = dtt.dateToModel('2014-02');
var r2 = dtt.dateToModel('2014-02-07');
var r3 = dtt.dateToModel('2014-02-07T12:45:04.000Z');

console.log(r0); // {date: '2014-01-01T00:00:00.000Z', precision: 'year'}
console.log(r1); // {date: '2014-02-01T00:00:00.000Z', precision: 'month'}
console.log(r2); // {date: '2014-02-07T00:00:00.000Z', precision: 'day'}
console.log(r3); // {date: '2014-02-07T00:00:00.000Z', precision: 'day'}
```

<a name="datetime.dateTimeToModel" />
#### datetime.dateTimeToModel(dt)

Converts ISO datetime `d` to [blue-button-model](https://github.com/amida-tech/blue-button-model) datetime
```js
var r0 = dtt.dateTimeToModel('2014');
var r1 = dtt.dateTimeToModel('2014-02');
var r2 = dtt.dateTimeToModel('2014-02-07');
var r3 = dtt.dateTimeToModel('2014-02-07T12:45:04.000Z');

console.log(r0); // {date: '2014-01-01T00:00:00.000Z', precision: 'year'}
console.log(r1); // {date: '2014-02-01T00:00:00.000Z', precision: 'month'}
console.log(r2); // {date: '2014-02-07T00:00:00.000Z', precision: 'day'}
console.log(r3); // {date: '2014-02-07T12:45:04.000Z', precision: 'second'}
```
Millisecond piece is ignored even when it is not zero.

<a name="datetime.modelToDate" />
#### datetime.modelToDate(dt)

Converts [blue-button-model](https://github.com/amida-tech/blue-button-model) datetime `dt` to ISO date
```js
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

console.log(r0); // '2014'
console.log(r1); // '2014-02'
console.log(r2); // '2014-02-07'
console.log(r3); // '2014-02-07'
```

<a name="datetime.modelToDateTime" />
#### datetime.modelToDateTime(dt)

Converts [blue-button-model](https://github.com/amida-tech/blue-button-model) datetime `dt` to ISO datetime
```js
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
    precision: 'second'
});


console.log(r0); // '2014'
console.log(r1); // '2014-02'
console.log(r2); // '2014-02-07'
console.log(r3); // '2014-02-07T12:45:04.000Z'
console.log(r4); // '2014-02-07T12:45:04.010Z'
```

<a name="predicate" />
### `predicate` Library

Provides methods that that return predicate functions on one argument.

<a name="predicate.hasProperty" />
#### hasProperty(deepProperty)

Returns a predicate that checks if `input` has the listed deep property
```js
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

console.log(r0); // false
console.log(r1); // false
console.log(r2); // true
```

<a name="predicate.hasNoProperty" />
#### hasNoProperty(deepProperty)

Returns a predicate that checks if `input` has not the listed deep property
```js
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

console.log(r0); // true
console.log(r1); // true
console.log(r2); // false
```

<a name="predicate.hasNoProperties" />
#### hasNoProperties(deepProperties)

Returns a predicate that checks if `input` has none of the listed deep properties
```js
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

console.log(r0); // true
console.log(r1); // true
console.log(r2); // false
console.log(r3); // false
```

<a name="predicate.inValueSet" />
#### inValueSet(valueSet)

Returns a predicate that checks if `input` is one of the values
```js
var f = pred.inValueSet(['Resolved', 'Active']);

var r0 = f('Any');
var r1 = f('Resolved');
var r2 = f('Active');

console.log(r0); // false
console.log(r1); // true
console.log(r2); // true
```

<a name="predicate.propertyValue" />
#### propertyValue(deepProperty)

Returns a predicate that checks `input`'s deep property 
```js
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

console.log(r0); // falsy
console.log(r1); // falsy
console.log(r2); // truthy
console.log(r3); // truthy
console.log(r4); // falsy
console.log(r5); // falsy
```

<a name="predicate.falsyPropertyValue" />
#### falsyPropertyValue(deepProperty)

Returns a predicate that checks if `input`'s deep property is falsy
```js
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

console.log(r0); // truthy
console.log(r1); // truthy
console.log(r2); // falsy
console.log(r3); // falsy
console.log(r4); // truthy
console.log(r5); // truthy
```

<a name="predicate.and" />
#### and(fns)

Returns a predicate that and's other predicates
```js
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

console.log(r0); // false
console.log(r1); // false
console.log(r2); // false
console.log(r3); // false
console.log(r4); // true
```

<a name="predicate.or" />
#### or(fns)

Returns a predicate that or's other predicates
```js
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

console.log(r0); // false
console.log(r1); // false
console.log(r2); // true
console.log(r3); // true
console.log(r4); // true
```

<a name="predicate.not" />
#### not(fn)

Returns a predicate that negates another predicate
```js
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

console.log(r0); // true
console.log(r1); // false
console.log(r2); // flase
console.log(r3); // true
console.log(r4); // true
```

### `jsonpath` Library

This library provides an implementation of [JSONPath](http://goessner.net/articles/JsonPath) with extended syntax for functions.  The code is originally based on and keeps all functionality of [this implementation](https://github.com/s3u/JSONPath).  API and code is structured so that no performance penalties are paid when parent (`^`) and path functionalities are not used.

In addition to functionality described [here](https://github.com/s3u/JSONPath), this library implements ability to add functions as part of JSONPath.  The example below illustrates the additional functionality.  Some options functionality are also modified as follows
- ***wrap*** - Whether or not to wrap the results in an array. If `wrap` is set to true, the result will always be an array which can be empty.  If `wrap` is set to false, and no results are found, `null` will be returned (as opposed to an empty array). If `wrap` is set to false and a single result is found, that result will be the only item returned. If `wrap` is not specified, it is set to `true` if branching elements (`..`, `*`, `:` (range), `,` (multiple properties)) are used and it will be set to `false` otherwise. An array will still be returned if multiple results are found, however.
- ***emptyValue*** - This specifies what to return if no results are found.  If `wrap` is specified this defaults to `[]` and if it is not specified it defaults to `null`.

<a name="jsonpath.instance" />
#### instance(inputExpr, opts)

Returns a JSONPath evaluator.  You can define functions for JSONPath expressions in `opts.functions`
```js
var example = {
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

var options = {
    functions: {
        round: function (obj) {
            return Math.round(obj);
        }
    }
};

var jp = jsonpath.instance('$.store..price.round()', options);
var result = jp(example);
console.log(result); // [ 9, 13, 9, 23, 20 ]
```

It is also possible to define functions during the evaluation call
```js

var round = function (obj) {
    return Math.round(obj);
};

var jp = jsonpath.instance('$.store..price.round()');
var result = jp(example, {
    round: round
});
console.log(result); // [ 9, 13, 9, 23, 20 ]
```

## License

Licensed under [Apache 2.0](./LICENSE).
