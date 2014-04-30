/**
 * @REST getTest
 * Some test documentation
 * This description can be multi-line
 *
 * @Method     GET
 * @Path       /api/test/{var}
 * @PathParam  {string}              var          A variable
 * @Return     {string}                           The result
 */
var someCode = function(/* comment */) {
    // This js code should be ignored by the parser
    var arr = []/* inline block comment also ignored*/;
};

/**
 * @RESTModel test
 *
 * @Required   [test, num]
 * @Property   {string}             test          A property
 * @Property   {number}             num
 */

/**
 * @RESTModel test2
 * Models can have a description as well
 *
 * @Required   [test, num]
 * @Property   {string}             test          A property
 * @Property   {number}             num
 */

/**
 * A block comment that doesn't have the REST tag won't be parsed
 * and can contain an [enum]
 */

/**
 * @REST fullyPopulated
 *
 * An endpoint that uses every possible tag type (some more than once!)
 *
 * @Server     localhost
 * @Method     POST
 * @Path       /api/test/{var}
 * @PathParam  {string}            var         A path parameter  [choice1, choice2]
 * @BodyParam  {string}            var2        A body parameter
 * @QueryParam {number}            var3        A query parameter
 * @QueryParam  {string} !Required  var4        A required query parameter
 * @QueryParam  {string} !Multiple  var5        A query parameter that can appear multiple times
 * @QueryParam  {string} !Required !Multiple var6  A required query parameter that can appear multiple times
 * @HeaderParam {string}           var7        A header parameter
 * @FormParam   {string}           var8        A form parameter
 */
