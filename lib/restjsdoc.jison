/* description: Parses RestJSDoc */

/* lexical grammar */
%lex


/* The order of macros is important, jison gives the first match not the longest */

%%

[ \f\t\v\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000] /*   skip non linebreaking whitespace */;
\n\r|\r\n|[\n\r]      return 'NEWLINE';
"/*"                  return 'COMMENTSTART';
"*/"                  return 'COMMENTEND';
\[[^\]]*\]            return 'ENUM';
"@RESTModel"          return 'RESTMODEL';
"@REST"               return 'ENDPOINT';
"@Method"             return 'METHOD';
"@PathParam"          return 'PATHPARAM';
"@QueryParam"         return 'QUERYPARAM';
"@BodyParam"          return 'BODYPARAM';
"@FormParam"          return 'FORMPARAM';
"@HeaderParam"        return 'HEADERPARAM';
"@Path"               return 'PATH';
"@Return"             return 'RETURN';
"@Server"             return 'SERVER';
"@Required"           return 'REQUIRED';
"@Property"           return 'PROPERTY';
"@HttpResponse"       return 'HTTPRESP';
"@Api"                return 'API';
\S+                   return 'WORD';
<<EOF>>               return 'EOF';


/lex


%start expressions


%% /* language grammar */


expressions
  : expression
  | expressions expression
  | expressions EOF
    %{
      return {"endpoints": yy.endpoints, "models": yy.models};
    %}
  ;

expression
  : endpointblock
    {yy.endpoints.push(JSON.parse($1));}
  | modelblock
    {yy.models.push(JSON.parse($1));}
  | comment
    {$$ = '';}
  | NEWLINE
    {$$ = '';}
  ;

phrase
  : WORD
    {$$ = yy.jsonEscape($1);}
  | phrase WORD
    {$$ = $1 + ' ' + yy.jsonEscape($2);}
  ;

description
  : phrase NEWLINE
    {$$ = '"description": "' + $1 + '"';}
  | NEWLINE
    {$$ = '"description": ""';}
  ;

multilinedesc
  : phrase NEWLINE
    {$$ = $1 + $2;}
  | multilinedesc phrase NEWLINE
    {$$ = $1 + $2 + $3;}
  | multilinedesc NEWLINE
    {$$ = $1 + $2;}
  | NEWLINE
    {$$ = $1;}
  ;

enum
  : ENUM
    {$$ = $1 === '[]' ? $1 : '["' + $1.substr(1, $1.length - 2).split(/,\s*/).join('", "') + '"]';}
  |
    {$$ = 'null';}
  ;

method
  : METHOD WORD NEWLINE
    {$$ = '{"method": "' + $2 + '"}';}
  ;

endpoint
  : ENDPOINT WORD NEWLINE
    {$$ = '"nickname": "' + $2 + '"';}
  ;

restmodel
  : RESTMODEL WORD NEWLINE
    {$$ = '"name": "' + $2 + '"';}
  ;

path
  : PATH WORD NEWLINE
    {$$ = '{"path": "' + $2 + '"}';}
  ;

optionalparam
  : ENUM
    {$$ = $1.substr(1, $1.length - 2);}
  ;

pathparam
  : PATHPARAM WORD WORD phrase enum NEWLINE
    {$$ = '{"pathParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "description": "' + $4 + '", "validValues": ' + $5 + '}}';}
  ;

queryparam
  : QUERYPARAM WORD WORD phrase enum NEWLINE
    {$$ = '{"queryParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "required": true, "description": "' + $4 + '", "validValues": ' + $5 + '}}';}
  | QUERYPARAM WORD optionalparam phrase enum NEWLINE
    {$$ = '{"queryParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "required": false, "description": "' + $4 + '", "validValues": ' + $5 + '}}';}
  ;

bodyparam
  : BODYPARAM WORD WORD description
    {$$ = '{"bodyParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", ' + $4 + '}}';}
  ;

formparam
  : FORMPARAM WORD WORD description
    {$$ = '{"formParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", ' + $4 + '}}';}
  ;

headerparam
  : HEADERPARAM WORD WORD description
    {$$ = '{"headerParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "required": true, ' + $4 + '}}';}
  | HEADERPARAM WORD optionalparam description
    {$$ = '{"headerParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "required": false, ' + $4 + '}}';}
  ;

return
  : RETURN WORD description
    {$$ = '{"return": {"type": "' + $2.substr(1, $2.length - 2) + '", ' + $3 + '}}';}
  ;

server
  : SERVER WORD NEWLINE
    {$$ = '{"server": "' + $2 + '"}';}
  ;

httpresponse
  : HTTPRESP WORD description
    {$$ = '{"httpResponse": {"code": "' + $2 + '", ' + $3 + '}}';}
  ;

api
  : API WORD NEWLINE
    {$$ = '{"api": "' + $2 + '"}';}
  ;

tag
  : method
  | path
  | pathparam
  | queryparam
  | bodyparam
  | formparam
  | headerparam
  | return
  | server
  | httpresponse
  | api
  ;

tags
  : tag
  | tags tag
    {$$ = $1 + ', ' + $2;}
  ;

required
  : REQUIRED enum NEWLINE
    {$$ = '"required": ' + $2;}
  ;

property
  : PROPERTY WORD WORD phrase enum NEWLINE
    {$$ = '{"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "description": "' + $4 + '", "validValues": ' + $5 +'}';}
  ;

properties
  : property
  | properties property
    {$$ = $1 + ', ' + $2;}
  ;

endpointblock
  : COMMENTSTART NEWLINE endpoint multilinedesc tags COMMENTEND
    {$$ = '{' + $3 + ', "description": "' + yy.jsonEscape($4) + '", "tags": [' + $5 + ']}';}
  ;

modelblock
  : COMMENTSTART NEWLINE restmodel multilinedesc required properties COMMENTEND
    {$$ = '{' + $3 + ', "description": "' + yy.jsonEscape($4) + '", ' + $5 + ', "properties": [' + $6 + ']}';}
  ;

commentcontent
  : WORD
  | ENUM
  | NEWLINE
  | commentcontent WORD
  | commentcontent NEWLINE
  | commentcontent ENUM
  ;

comment
  : COMMENTSTART commentcontent COMMENTEND
  | COMMENTSTART COMMENTEND
  ;
