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
"@method"             return 'METHOD';
"@pathParam"          return 'PATHPARAM';
"@queryParam"         return 'QUERYPARAM';
"@bodyParam"          return 'BODYPARAM';
"@formParam"          return 'FORMPARAM';
"@headerParam"        return 'HEADERPARAM';
"@path"               return 'PATH';
"@return"             return 'RETURN';
"@server"             return 'SERVER';
"@required"           return 'REQUIRED';
"@property"           return 'PROPERTY';
"!required"           return 'REQUIREDPARAM';
"!multiple"           return 'MULTIPLEPARAM';
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
    {$$ = '"description": "' + $1 + '"';}
  | NEWLINE
    {$$ = '"description": ""';}
  ;

enum
  : ENUM
    {$$ = $1.substr(1, $1.length - 2).split(',');}
  |
    {$$ = '';}
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
    {$$ = '{"pathParam": {"name": "' + $3 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "description": "' + $4 + '", "validValues": "' + $5 + '"}}';}
  ;

queryparam
  : QUERYPARAM WORD requiredparam multipleparam WORD phrase enum NEWLINE
    {$$ = '{"queryParam": {"name": "' + $5 + '", "type": "' + $2.substr(1, $2.length - 2) + '", "required": ' + $3 + ', "multiple": ' + $4 + ', "description": "' + $6 + '", "validValues": "' + $7 + '"}}';}
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
  : REQUIRED phrase NEWLINE
    {$$ = '"required": ["' + $2.split(' ').join('", "') + '"]';}
  |
    {$$ = '"required": []';}
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
  : COMMENTSTART NEWLINE endpoint description NEWLINE tags COMMENTEND
    {$$ = '{' + $3 + ', ' + $4 + ', "tags": [' + $6 + ']}';}
  ;

modelblock
  : COMMENTSTART NEWLINE restmodel NEWLINE required properties COMMENTEND
    {$$ = '{' + $3 + ', ' + $5 + ', "properties": [' + $6 + ']}';}
  ;

commentcontent
  : WORD
  | NEWLINE
  | commentcontent WORD
  | commentcontent NEWLINE
  ;

comment
  : COMMENTSTART commentcontent COMMENTEND
  ;
