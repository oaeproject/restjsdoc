var _ = require('underscore');
var fs = require('fs');
var Parser = require('jison').Parser;

var grammar = fs.readFileSync(__dirname + '/restjsdoc.jison').toString();

var parser = new Parser(grammar);

module.exports.parse = function(code) {
    // TODO move to inline statements in the grammar
    parser.yy.endpoints = [];
    parser.yy.models = [];
    parser.yy.jsonEscape = function(str) {
        return str
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    };

    code = code.toString();
    var parsed = parser.parse(code);

    // Build a nicer object
    var result = {
        endpoints: {},
        models: {}
    };

    _.each(parsed.endpoints, function(endpoint) {
        var target = result.endpoints[endpoint.nickname] = {};
        target.pathParams = {};
        target.queryParams = {};
        target.bodyParams = {};
        target.headerParams = {};
        target.formParams = {};

        _.each(endpoint.tags, function(tag) {
            if (tag.server) {
                return target.server = tag.server;
            }
            if (tag.method) {
                return target.method = tag.method;
            }
            if (tag.path) {
                return target.path = tag.path;
            }
            if (tag.pathParam) {
                return target.pathParams[tag.pathParam.name] = tag.pathParam;
            }
            if (tag.queryParam) {
                return target.queryParams[tag.queryParam.name] = tag.queryParam;
            }
            if (tag.bodyParam) {
                return target.bodyParams[tag.bodyParam.name] = tag.bodyParam;
            }
            if (tag.headerParam) {
                return target.headerParams[tag.headerParam.name] = tag.headerParam;
            }
            if (tag.formParam) {
                return target.formParams[tag.formParam.name] = tag.formParam;
            }
        });
    });

    _.each(parsed.models, function(model) {
        var target = result.models[model.name] = {};
        target.properties = {};

        if (model.required) {
            target.required = model.required;
        }
        _.each(model.properties, function(property) {
            target.properties[property.name] = {
                'type': property.type,
                'description': property.description
            }
        });
    });

    return result;
};
