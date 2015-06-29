'use strict';

var Promise = require('bluebird');
var test = require('tape');
var smoop = require('./');

test('basic operation', function( t ){
	t.plan(3);

	var count = 0;

	function source( cb ){
		t.pass('source called once');

		process.nextTick(function() {
			cb(null, ++count);
		});
	}

	var smooped = smoop(source);

	smooped(function( err, value ){
		t.equal(value, 1, 'Value returned');
	});

	smooped(function( err, value ){
		t.equal(value, 1, 'Value returned still');
	});
});

test('Promises', function( t ){
	t.plan(3);

	var count = 0;

	function source(){
		t.pass('source called once');

		return Promise.resolve(++count);
	}

	var smooped = smoop(source);

	smooped().then(function( value ){
		t.equal(value, 1, 'Value returned');
	});

	smooped().then(function( value ){
		t.equal(value, 1, 'Value returned still');
	});
});

test('maxAge', function( t ){
	t.plan(8);

	var count = 0;

	function source(){
		t.pass('source called once');

		return Promise.resolve(++count);
	}

	var smooped = smoop(source, { maxAge: 100 });

	t.equal(count, 0, 'Count initially');

	smooped().then(function( value ){
		t.equal(value, 1, 'Value returned first time');
	});

	smooped().then(function( value ){
		t.equal(value, 1, 'Value returned second time');
	});

	setTimeout(function(){
		t.equal(count, 1, 'Count after delay');

		smooped().then(function( value ){
			t.equal(value, 2, 'Value returned after delay');
		});

		smooped().then(function( value ){
			t.equal(value, 2, 'Value returned after delay second time');
		});
	}, 110);
});

test('maxAge of zero', function( t ){
	t.plan(4);

	var count = 0;

	function source(){
		t.pass('source called once');

		return Promise.resolve(++count);
	}

	var smooped = smoop(source, { maxAge: 0 });

	smooped().then(function( value ){
		t.equal(value, 1, 'Value returned');
	});

	smooped().then(function( value ){
		t.equal(value, 2, 'Value returned still');
	});
});

test('refresh', function( t ){
	t.plan(6);

	var count = 0;

	function source(){
		return Promise.resolve(++count);
	}

	var smooped = smoop(source, { refresh: 100 });

	t.equal(count, 1, 'Count initially');

	smooped().then(function( value ){
		t.equal(value, 1, 'Value returned first time');
	});

	smooped().then(function( value ){
		t.equal(value, 1, 'Value returned second time');
	});

	setTimeout(function(){
		t.equal(count, 2, 'Count after delay');

		smooped().then(function( value ){
			t.equal(value, 2, 'Value returned after delay');
		});

		smooped().then(function( value ){
			t.equal(value, 2, 'Value returned after delay second time');
		});
	}, 110);
});

test('name option', function( t ){
	function source( cb ){
		cb(null, true);
	}

	var smooped = smoop(source, { name: 'test' });

	smooped(function(){});

	t.end();
});
