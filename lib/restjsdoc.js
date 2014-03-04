var _ = require('underscore');
var jison = require('jison');
var esprima = require('esprima');

var tagRegex = new RegExp('\\s*@(\\S+)\\s+(\\S*)');

module.exports.parse = function(code) {
    // Pull the relevant comments out of the code
    var comments = esprima.parse(code, {'comment': true}).comments;
    endpointComments = _.pluck(_.filter(comments, function(comment) {
        return comment.type === 'Block' && comment.value.match(/\s*@REST\s/);
    }), 'value');
    modelComments = _.pluck(_.filter(comments, function(comment) {
        return comment.type === 'Block' && comment.value.match(/\s*@RESTModel\s/);
    }), 'value');

    // Parse out the data necessary for swagger
    var endpoints = [];
    _.each(endpointComments, function(comment) {
        var endpoint;
        comment = comment.split('\n');
        _each(comment, function(line) {
            var statement = endpointRegex.exec(line);
            var tag = statement[0];
            var value = statement[1];
            switch (tag) {
                case 'REST':
                    endpoint.nickname = value;
                    break;
                default:
                    endpoint.summary = line;
            }
        });
        endpoints.push(endpoint);
    });

    return {'endpoints': endpoints};
};
