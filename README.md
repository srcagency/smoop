# The Smooth Operator

Cache the return value of an asynchronous function (callback-taking or
promise-returning).

Optional: have it periodically refresh data in the background, and keep
returning the latest until a new value replaces it. Especially useful with
unreliable or slow sources.

```
smoop(fn, opts) -> fn'
```

## Options

- `refresh`

	Milliseconds before proactively trying to fetch a new value. The current value
	is kept and handed out until replaced.

	Without `refresh` you will get a **lazy behavior** where a new
	value is fetched only when needed.

	With `refresh` a value will initially be polled.

- `maxAge`

	Milliseconds until a value is discarded.

	If you do not set `maxAge` you are guaranteed to always get a value if any
	source has ever resolved.

	A `maxAge` of zero is the same as disabling the caching altogether.

- `name`

	Smooth operator uses [debug](https://github.com/visionmedia/debug) and
	assigns each operator a sequential number for referencing. `name` allows
	you to use your own reference.

## Using node-style callbacks

```js
var smoop = require('smoop');
var dns = require('dns');

var googleIp = smoop(function( cb ){
	dns.lookup('google.com', cb);
}, {
	refresh: 60000,	// fetch each minute
});

googleIp(function( err, result ){
	console.log('google.com address:', result[0]);
});
```

## Using promises

```js
var Promise = require('bluebird');
var smoop = require('smoop');
var dns = Promise.promisifyAll(require('dns'));

var googleIp = smoop(function(){
	return dns.lookupAsync('google.com');
}, {
	refresh: 60000,	// fetch each minute
});

googleIp().spread(function( ip ){
	console.log('google.com address:', ip);
});
```
