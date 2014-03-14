var _ = require('underscore');
var assert = require('assert');
var restjsdoc = require('../lib/restjsdoc');
var fs = require('fs');

var doc = fs.readFileSync('./test/sample.js');

describe('Type conversion', function() {

    it('should handle strings', function() {
        var result = restjsdoc.parse(doc.toString());
        assert.ok(result);
    });

    it('should handle buffers', function() {
        var result = restjsdoc.parse(doc);
        assert.ok(result);
    });
});

describe('Endpoint parsing', function() {

    var endpoints = restjsdoc.parse(doc).endpoints;

    it('should see all endpoint blocks', function() {
        assert.equal(_.size(endpoints), 2);
    });

    it('should properly parse server tags', function() {
        assert.ok(! endpoints.getTest.server);
        assert.equal(endpoints.fullyPopulated.server, 'localhost');
    });

    it('should properly parse method tags', function() {
        assert.equal(endpoints.getTest.method, 'GET');
        assert.equal(endpoints.fullyPopulated.method, 'POST');
    });

});

describe('Model parsing', function() {

    var models = restjsdoc.parse(doc).models;

    it('should see all model blocks', function() {
        assert.equal(_.size(models), 1);
    });
});
