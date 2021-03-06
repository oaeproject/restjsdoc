import fs from 'fs';
import path from 'path';
import _ from 'underscore';
import * as esprima from 'esprima';

import { Parser } from 'jison';

const grammar = fs.readFileSync(path.resolve(__dirname, './restjsdoc.jison')).toString();

const parser = new Parser(grammar);

export const parse = function(code) {
  // TODO move to inline statements in the grammar
  parser.yy.endpoints = [];
  parser.yy.models = [];
  parser.yy.jsonEscape = function(str) {
    return str
      .replace(/[\\]/g, '\\\\')
      .replace(/["]/g, '\\"')
      .replace(/[/]/g, '\\/')
      .replace(/[\b]/g, '\\b')
      .replace(/[\f]/g, '\\f')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t');
  };

  code = code.toString();
  let parsed = {};
  // If it was an empty file, there's nothing to parse
  if (code.length > 0) {
    // Get just the Block comments
    code = _.where(esprima.parseModule(code, { comment: true, loc: true }).comments, { type: 'Block' });
    // Turn it into a string with empty lines for ignored values so we get
    // proper line numbers on parse errors
    code = _.reduce(
      code,
      function(memo, block) {
        const match = memo.match(/\n\r|\r\n|[\n\r]/g);
        const line = match ? match.length + 1 : 1;
        const toAdd = block.loc.start.line - line;
        for (let i = 0; i < toAdd; i++) {
          memo += '\n';
        }

        // Regex strips leading * on lines as that's a pain to do in the grammar
        return memo + '/* ' + block.value.replace(/(^\s*)\*+($|\s+)/gm, '$1$2') + ' */';
      },
      ''
    );
    // If there were no block comments there will be nothing to parse
    if (code.length > 0) {
      parsed = parser.parse(code);
    }
  }

  // Build a nicer object
  const result = {
    endpoints: [],
    models: {}
  };

  _.each(parsed.endpoints, function(endpoint) {
    const target = {};
    target.nickname = endpoint.nickname;
    target.pathParams = {};
    target.queryParams = {};
    target.bodyParams = {};
    target.headerParams = {};
    target.formParams = {};
    target.httpResponses = [];
    target.description = endpoint.description.replace(/^\s+/, '').replace(/\s+$/, '');

    _.each(endpoint.tags, function(tag) {
      if (tag.server) {
        target.server = tag.server;
        return target.server;
      }

      if (tag.method) {
        target.method = tag.method;
        return target.method;
      }

      if (tag.path) {
        target.path = tag.path;
        return target.path;
      }

      if (tag.pathParam) {
        target.pathParams[tag.pathParam.name] = tag.pathParam;
        return target.pathParams[tag.pathParam.name];
      }

      if (tag.queryParam) {
        target.queryParams[tag.queryParam.name] = tag.queryParam;
        return target.queryParams[tag.queryParam.name];
      }

      if (tag.bodyParam) {
        target.bodyParams[tag.bodyParam.name] = tag.bodyParam;
        return target.bodyParams[tag.bodyParam.name];
      }

      if (tag.headerParam) {
        target.headerParams[tag.headerParam.name] = tag.headerParam;
        return target.headerParams[tag.headerParam.name];
      }

      if (tag.formParam) {
        target.formParams[tag.formParam.name] = tag.formParam;
        return target.formParams[tag.formParam.name];
      }

      if (tag.httpResponse) {
        target.httpResponses.push({ code: tag.httpResponse.code, message: tag.httpResponse.description });
        return target.httpResponses;
      }

      if (tag.return) {
        target.return = tag.return;
        return target.return;
      }

      if (tag.api) {
        target.api = tag.api;
        return target.api;
      }

      if (tag.produces) {
        target.produces = tag.produces;
        return target.produces;
      }

      if (tag.consumes) {
        target.consumes = tag.consumes;
        return target.consumes;
      }
    });
    result.endpoints.push(target);
  });

  _.each(parsed.models, function(model) {
    result.models[model.name] = {};
    const target = result.models[model.name];
    target.properties = {};
    target.description = model.description.replace(/^\s+/, '').replace(/\s+$/, '');

    if (model.required) {
      target.required = model.required;
    }

    _.each(model.properties, function(property) {
      target.properties[property.name] = {
        type: property.type,
        description: property.description,
        validValues: property.validValues
      };
    });
  });

  return result;
};
