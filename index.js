'use strict';

var debug = require('debug')('smoop');
var assign = require('object-assign');
var Promise = require('bluebird');

module.exports = operate;

var count = 0;

function operate( source, opts ){
	var operator = new SmoothOperator(source, opts);

	return getter;

	function getter( cb ){
		return operator.get(cb);
	}
}

operate.SmoothOperator = SmoothOperator;

function SmoothOperator( source, opts ){
	this.maxAge = null;
	this.refresh = null;
	this.name = '#' + (++count);

	if (opts)
		assign(this, opts);

	this.source = source;

	if (this.refresh)
		this.get()
			.catch(function( e ){
				debug('%s: failed to resolve initial value %o', this.name, e);
			});
}

assign(SmoothOperator.prototype, {
	get: function( cb ){
		if (!this.value || this.isExpired())
			this.value = fetch(this);

		return this.value.nodeify(cb);
	},

	isExpired: function(){
		return typeof this.maxAge === 'number' && (Date.now() - this.age) >= this.maxAge;
	},
});

function fetch( operator ){
	debug('%s: fetching', operator.name);

	operator.age = Date.now();

	if (operator.refresh) {
		clearTimeout(operator.timer);

		operator.timer = setTimeout(function(){
			fetch(operator)
				.catch(function( e ){
					debug('%s: failed to resolve a value %o', operator.name, e);
				});
		}, operator.refresh);

		if (operator.timer.unref)
			operator.timer.unref();
	}

	var asPromise;

	var asNode = Promise.fromNode(function( cb ){
		asPromise = operator.source(cb);
	});

	var fetched = asPromise && asPromise.then ? Promise.resolve(asPromise) : asNode;

	return fetched
		.tap(function( v ){
			debug('%s: got new value of %o', operator.name, v);

			operator.value = Promise.resolve(v);
		});
}
