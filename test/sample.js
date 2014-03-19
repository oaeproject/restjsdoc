/**
 * @REST getTest
 * Some test documentation
 *
 * @method     GET
 * @path       /api/test/{var}
 * @pathParam  {string}              var          A variable
 * @return     {string}                           The result
 */
var someCode = function() {
    // This js code should be ignored by the parser
};

/**
 * @RESTModel test
 *
 * @required   test num
 * @property   {string}             test          A property
 * @property   {number}             num
 */

/**
 * A block comment that doesn't have the REST tag won't be parsed
 */

/**
 * @REST fullyPopulated
 * An endpoint that uses every possible tag type (some more than once!)
 *
 * @server     localhost
 * @method     POST
 * @path       /api/test/{var}
 * @pathParam  {string}            var         A path parameter  [choice1, choice2]
 * @bodyParam  {string}            var2        A body parameter
 * @queryParam {number}            var3        A query parameter
 * @queryParam  {string} !required  var4        A required query parameter
 * @queryParam  {string} !multiple  var5        A query parameter that can appear multiple times
 * @queryParam  {string} !required !multiple var6  A required query parameter that can appear multiple times
 * @headerParam {string}           var7        A header parameter
 * @formParam   {string}           var8        A form parameter
 */
