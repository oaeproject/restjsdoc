/* description: Parses RestJSDoc */

/* lexical grammar */
%lex


/* The order of macros is important, jison gives the first match not the longest */

%%

\n\r|\r\n|[\n\r]      return 'NEWLINE';
\s+                   /* skip whitespace */;
"/*".*                return 'COMMENTSTART';
.*"*/"                return 'COMMENTEND';
^\s*"*"               /* skip * at start of line */;
\[[^\]]+\]            return 'ENUM';
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
"!Required"           return 'REQUIREDPARAM';
"!Multiple"           return 'MULTIPLEPARAM';
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
  | WORD
    {$$ = '';}
  | ENUM
    {$$ = '';}
  | comment
    {$$ = '';}
  | NEWLINE
    {$$ = '';}
  ;

phrase
  : WORD
    {$$ = $1;}
  | phrase WORD
    {$$ = $1 + ' ' + $2;}
  ;

description
  : phrase NEWLINE
    {$$ = '"description": "' + yy.jsonEscape($1) + '"';}
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
    {$$ = '["' + $1.substr(1, $1.length - 2).split(/,\s*/).join('", "') + '"]';}
  |
    {$$ = '[]';}
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

requiredparam
  : REQUIREDPARAM
    {$$ = true;}
  |
    {$$ = false;}
  ;

multipleparam
  : MULTIPLEPARAM
    {$$ = 'true';}
  |
    {$$ = 'false';}
  ;

pathparam
  : PATHPARAM WORD WORD phrase enum NEWLINE
    {$$ = '{"pathParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "description": "' + $4 + '", "validValues": ' + $5 + '}}';}
  ;

queryparam
  : QUERYPARAM WORD requiredparam multipleparam WORD phrase enum NEWLINE
    {$$ = '{"queryParam": {"name": "' + $5 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "required": ' + $3 + ', "multiple": ' + $4 + ', "description": "' + $6 + '", "validValues": ' + $7 + '}}';}
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
  : HEADERPARAM WORD requiredparam WORD description
    {$$ = '{"headerParam": {"name": "' + $4 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "required": ' + $3 + ', ' + $5 + '}}';}
  ;

return
  : RETURN WORD description
    {$$ = '{"return": {"type": "' + $2 + '", ' + $3 + '}}';}
  ;

server
  : SERVER WORD NEWLINE
    {$$ = '{"server": "' + $2 + '"}';}
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
  : PROPERTY WORD WORD description
    {$$ = '{"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", ' + $4 + '}';}
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
  | NEWLINE
  | commentcontent WORD
  | commentcontent NEWLINE
  | commentcontent ENUM
  ;

comment
  : COMMENTSTART commentcontent COMMENTEND
  ;
