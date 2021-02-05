import assert from 'assert';
import { describe, it } from 'mocha';

import path from 'path';
import fs from 'fs';
import _ from 'underscore';
import * as restjsdoc from '../lib/restjsdoc.js';

const doc = fs.readFileSync(path.resolve(__dirname, 'sample.js'));

describe('Type conversion', function () {
  it('should handle strings', function () {
    let result = restjsdoc.parse(doc.toString());
    assert.ok(result);
    // And the empty string
    result = restjsdoc.parse('');
    assert.ok(result);
  });

  it('should handle buffers', function () {
    const result = restjsdoc.parse(doc);
    assert.ok(result);
  });
});

describe('Endpoint parsing', function () {
  const endpoints = _.indexBy(restjsdoc.parse(doc).endpoints, 'nickname');

  it('should see all endpoint blocks', function () {
    assert.strict.equal(_.size(endpoints), 2);
  });

  it('should properly parse server tags', function () {
    assert.ok(!endpoints.getTest.server);
    assert.strict.equal(endpoints.fullyPopulated.server, 'localhost');
  });

  it('should properly parse endpoint descriptions', function () {
    assert.strict.equal(endpoints.getTest.description, 'Some test documentation\nThis description can be multi-line');
    assert.strict.equal(
      endpoints.fullyPopulated.description,
      'An endpoint that uses every possible tag type (some more than once!)'
    );
  });

  it('should properly parse method tags', function () {
    assert.strict.equal(endpoints.getTest.method, 'GET');
    assert.strict.equal(endpoints.fullyPopulated.method, 'POST');
  });

  it('should properly parse path tags', function () {
    assert.strict.equal(endpoints.getTest.path, '/api/test/{var}');
    assert.strict.equal(endpoints.fullyPopulated.path, '/api/test/{var}');
  });

  it('should properly parse pathParameter tags ', function () {
    assert.strict.equal(endpoints.getTest.pathParams.var.type, 'string');
    assert.strict.equal(endpoints.fullyPopulated.pathParams.var.type, 'string');
    assert.strict.equal(endpoints.getTest.pathParams.var.description, 'A variable');
    assert.strict.equal(endpoints.fullyPopulated.pathParams.var.description, 'A path parameter');
    assert.ok(_.isEmpty(endpoints.getTest.pathParams.var.validValues));
    assert.strict.equal(endpoints.fullyPopulated.pathParams.var.validValues[0], 'choice1');
    assert.strict.equal(endpoints.fullyPopulated.pathParams.var.validValues[1], 'choice2');
  });

  it('should properly parse bodyParameter tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.bodyParams.var2.type, 'string');
    assert.strict.equal(endpoints.fullyPopulated.bodyParams.var2.description, 'A body parameter');
  });

  it('should properly parse queryParameter tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.queryParams.var3.type, 'number');
    assert.strict.equal(endpoints.fullyPopulated.queryParams.var3.description, 'A query parameter');
    assert.ok(!endpoints.fullyPopulated.queryParams.var3.required);
    assert.ok(!endpoints.fullyPopulated.queryParams.var3.multiple);
    assert.strict.equal(endpoints.fullyPopulated.queryParams.var4.type, 'string');
    assert.strict.equal(endpoints.fullyPopulated.queryParams.var4.description, 'A required query parameter');
    assert.ok(endpoints.fullyPopulated.queryParams.var4.required);
    assert.ok(!endpoints.fullyPopulated.queryParams.var4.multiple);
  });

  it('should properly parse headerParameter tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.headerParams.var5.type, 'string');
    assert.strict.equal(endpoints.fullyPopulated.headerParams.var5.description, 'A header parameter');
  });

  it('should properly parse formParameter tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.formParams.var6.type, 'string');
    assert.strict.equal(endpoints.fullyPopulated.formParams.var6.description, 'A form parameter');
    assert.ok(endpoints.fullyPopulated.formParams.var6.required);
    assert.strict.equal(endpoints.fullyPopulated.formParams.var7.type, 'string');
    assert.strict.equal(endpoints.fullyPopulated.formParams.var7.description, 'An optional form parameter');
    assert.ok(!endpoints.fullyPopulated.formParams.var7.required);
    assert.ok(_.contains(endpoints.fullyPopulated.formParams.var7.validValues, 'choice1'));
    assert.ok(_.contains(endpoints.fullyPopulated.formParams.var7.validValues, 'choice2'));
  });

  it('should properly parse httpResponse tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.httpResponses[0].code, '404');
    assert.strict.equal(endpoints.fullyPopulated.httpResponses[0].message, 'Custom http response message');
  });

  it('should properly parse api tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.api, 'private');
  });

  it('should properly parse produces tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.produces[0], 'application/json');
  });

  it('should properly parse consumes tags ', function () {
    assert.strict.equal(endpoints.fullyPopulated.consumes[0], 'application/json');
  });
});

describe('Model parsing', function () {
  const { models } = restjsdoc.parse(doc);

  it('should see all model blocks', function () {
    assert.strict.equal(_.size(models), 2);
  });

  it('should properly parse the "required" array', function () {
    assert.strict.equal(models.test.required[0], 'test');
    assert.strict.equal(models.test.required[1], 'num');
  });

  it('should properly parse properties', function () {
    assert.strict.equal(models.test.properties.test.type, 'string');
    assert.strict.equal(models.test.properties.test.description, 'A property');
    assert.strict.equal(models.test.properties.num.type, 'number');
    assert.strict.equal(models.test.properties.num.description, 'Another property');
    assert.ok(_.contains(models.test2.properties.test.validValues, 'foo'));
    assert.ok(_.contains(models.test2.properties.test.validValues, 'bar'));
  });
});
