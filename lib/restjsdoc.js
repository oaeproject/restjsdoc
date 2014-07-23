var _ = require('underscore');
var esprima = require('esprima');
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
    var parsed = {};
    // If it was an empty file, there's nothing to parse
    if (code.length > 0) {
        // Get just the Block comments
        code = _.where(esprima.parse(code, {'comment': true, 'loc': true}).comments, {'type': 'Block'});
        // Turn it into a string with empty lines for ignored values so we get
        // proper line numbers on parse errors
        code =  _.reduce(code, function(memo, block) {
            var match = memo.match(/\n\r|\r\n|[\n\r]/g);
            var line = match ? match.length + 1 : 1;
            var toAdd = block.loc.start.line - line;
            for (var i=0; i < toAdd; i++) {
                memo += '\n';
            }
            // regex strips leading * on lines as that's a pain to do in the grammar
            return memo + '/* ' + block.value.replace(/(^\s*)\*+($|\s+)/mg, '$1$2') + ' */';
        }, '');
        // If there were no block comments there will be nothing to parse
        if (code.length > 0) {
            parsed = parser.parse(code);
        }
    }

    // Build a nicer object
    var result = {
        endpoints: [],
        models: {}
    };

    _.each(parsed.endpoints, function(endpoint) {
        var target = {};
        target.nickname = endpoint.nickname;
        target.pathParams = {};
        target.queryParams = {};
        target.bodyParams = {};
        target.headerParams = {};
        target.formParams = {};
        target.httpResponses = {};
        target.description = endpoint.description.replace(/^\s+/, '').replace(/\s+$/, '');

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
            if (tag.httpResponse) {
                return target.httpResponses[tag.httpResponse.code] = tag.httpResponse;
            }
            if (tag['return']) {
                return target['return'] = tag['return'];
            }
            if (tag.api) {
                return target.api = tag.api;
            }
            if (tag.produces) {
                return target.produces = tag.produces;
            }
            if (tag.consumes) {
                return target.consumes = tag.consumes;
            }
        });
        result.endpoints.push(target);
    });

    _.each(parsed.models, function(model) {
        var target = result.models[model.name] = {};
        target.properties = {};
        target.description = model.description.replace(/^\s+/, '').replace(/\s+$/, '');

        if (model.required) {
            target.required = model.required;
        }
        _.each(model.properties, function(property) {
            target.properties[property.name] = {
                'type': property.type,
                'description': property.description,
                'validValues': property.validValues
            }
        });
    });

    return result;
};
