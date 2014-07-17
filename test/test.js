var _ = require('underscore');
var assert = require('assert');
var restjsdoc = require('../lib/restjsdoc');
var fs = require('fs');

var doc = fs.readFileSync('./test/sample.js');

describe('Type conversion', function() {

    it('should handle strings', function() {
        var result = restjsdoc.parse(doc.toString());
        assert.ok(result);
        // and the empty string
        result = restjsdoc.parse('');
        assert.ok(result);
    });

    it('should handle buffers', function() {
        var result = restjsdoc.parse(doc);
        assert.ok(result);
    });
});

describe('Endpoint parsing', function() {

    var endpoints = _.indexBy(restjsdoc.parse(doc).endpoints, 'nickname');

    it('should see all endpoint blocks', function() {
        assert.equal(_.size(endpoints), 2);
    });

    it('should properly parse server tags', function() {
        assert.ok(! endpoints.getTest.server);
        assert.equal(endpoints.fullyPopulated.server, 'localhost');
    });

    it('should properly parse endpoint descriptions', function() {
        assert.equal(endpoints.getTest.description, 'Some test documentation\nThis description can be multi-line');
        assert.equal(endpoints.fullyPopulated.description, 'An endpoint that uses every possible tag type (some more than once!)');
    });

    it('should properly parse method tags', function() {
        assert.equal(endpoints.getTest.method, 'GET');
        assert.equal(endpoints.fullyPopulated.method, 'POST');
    });

    it('should properly parse path tags', function() {
        assert.equal(endpoints.getTest.path, '/api/test/{var}');
        assert.equal(endpoints.fullyPopulated.path, '/api/test/{var}');
    });

    it('should properly parse pathParameter tags ', function() {
        assert.equal(endpoints.getTest.pathParams['var'].type, 'string');
        assert.equal(endpoints.fullyPopulated.pathParams['var'].type, 'string');
        assert.equal(endpoints.getTest.pathParams['var'].description, 'A variable');
        assert.equal(endpoints.fullyPopulated.pathParams['var'].description, 'A path parameter');
        assert.ok(_.isEmpty(endpoints.getTest.pathParams['var'].validValues));
        assert.equal(endpoints.fullyPopulated.pathParams['var'].validValues[0], 'choice1');
        assert.equal(endpoints.fullyPopulated.pathParams['var'].validValues[1], 'choice2');
    });

    it('should properly parse bodyParameter tags ', function() {
        assert.equal(endpoints.fullyPopulated.bodyParams['var2'].type, 'string');
        assert.equal(endpoints.fullyPopulated.bodyParams['var2'].description, 'A body parameter');
    });

    it('should properly parse queryParameter tags ', function() {
        assert.equal(endpoints.fullyPopulated.queryParams['var3'].type, 'number');
        assert.equal(endpoints.fullyPopulated.queryParams['var3'].description, 'A query parameter');
        assert.ok(!endpoints.fullyPopulated.queryParams['var3'].required);
        assert.ok(!endpoints.fullyPopulated.queryParams['var3'].multiple);
        assert.equal(endpoints.fullyPopulated.queryParams['var4'].type, 'string');
        assert.equal(endpoints.fullyPopulated.queryParams['var4'].description, 'A required query parameter');
        assert.ok(endpoints.fullyPopulated.queryParams['var4'].required);
        assert.ok(!endpoints.fullyPopulated.queryParams['var4'].multiple);
    });

    it('should properly parse headerParameter tags ', function() {
        assert.equal(endpoints.fullyPopulated.headerParams['var5'].type, 'string');
        assert.equal(endpoints.fullyPopulated.headerParams['var5'].description, 'A header parameter');
    });

    it('should properly parse formParameter tags ', function() {
        assert.equal(endpoints.fullyPopulated.formParams['var6'].type, 'string');
        assert.equal(endpoints.fullyPopulated.formParams['var6'].description, 'A form parameter');
        assert.ok(endpoints.fullyPopulated.formParams['var6'].required);
        assert.equal(endpoints.fullyPopulated.formParams['var7'].type, 'string');
        assert.equal(endpoints.fullyPopulated.formParams['var7'].description, 'An optional form parameter');
        assert.ok(!endpoints.fullyPopulated.formParams['var7'].required);

    });

    it('should properly parse httpResponse tags ', function() {
        assert.equal(endpoints.fullyPopulated.httpResponses['404'].code, '404');
        assert.equal(endpoints.fullyPopulated.httpResponses['404'].description, 'Custom http response message');
    });

    it('should properly parse api tags ', function() {
        assert.equal(endpoints.fullyPopulated.api, 'private');
    });
});

describe('Model parsing', function() {

    var models = restjsdoc.parse(doc).models;

    it('should see all model blocks', function() {
        assert.equal(_.size(models), 2);
    });

    it('should properly parse the "required" array', function() {
        assert.equal(models.test.required[0], 'test');
        assert.equal(models.test.required[1], 'num');
    });

    it('should properly parse properties', function() {
        assert.equal(models.test.properties.test.type, 'string');
        assert.equal(models.test.properties.test.description, 'A property');
        assert.equal(models.test.properties.num.type, 'number');
        assert.equal(models.test.properties.num.description, 'Another property');
        assert.ok(_.contains(models.test2.properties.test.validValues, 'foo'));
        assert.ok(_.contains(models.test2.properties.test.validValues, 'bar'));
    });

});
