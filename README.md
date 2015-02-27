blue-button-util
================

Common methods for Amida-Tech repositories

[![NPM](https://nodei.co/npm/blue-button-util.png)](https://nodei.co/npm/blue-button-util/)

[![Build Status](https://travis-ci.org/amida-tech/blue-button-util.svg)](https://travis-ci.org/amida-tech/blue-button-util)
[![Coverage Status](https://coveralls.io/repos/amida-tech/blue-button-util/badge.png)](https://coveralls.io/r/amida-tech/blue-button-util)

##Functions

####object.exists()

Checks if `obj` is not `undefined` or `null`.

####datetime.dateToModel(dt)

Converts ISO date to blue-button-model date.

####datetime.modelToDate(dt)

Converts blue-button-model date to ISO date.

####datetime.modelToDateTime(dt)

Converts blue-button-model datetime to ISO datetime.

####arrayset.append(arr, arrToAppend)

Appends array `arrToAppend` elements to array `arr`.

####objectset.compact(obj)

Recursively removes all the `null` and `undefined` values from `obj`.

###objectset.merge(obj, src)

See [lodash](https://lodash.com/docs#merge).
