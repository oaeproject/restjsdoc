/**
 * @REST getTest
 * Some test documentation
 * This description can be multi-line
 *
 * @Method      GET
 * @Path        /api/test/{var}
 * @PathParam   {string}            var     A variable
 * @Return      {string}                    The result
 */
// eslint-disable-next-line no-unused-vars
const someCode = function(/* comment */) {
  // This js code should be ignored by the parser
  // eslint-disable-next-line no-unused-vars
  const arr = []; /* Inline block comment also ignored */
};

/**
 * @RESTModel test
 *
 * @Required    [test, num]
 * @Property    {string}        test    A property
 * @Property    {number}        num     Another property
 */

/**
 * @RESTModel test2
 * Models can have a description as well
 *
 * @Required    [test, num]
 * @Property    {string}        test    A property "can contain quotes" [foo, bar]
 * @Property    {number}        num     Another property "here too"
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
 * @Server      localhost
 * @Method      POST
 * @Path        /api/test/{var}
 * @PathParam   {string}            var     A path parameter  [choice1, choice2]
 * @BodyParam   {string}            var2    A body parameter
 * @QueryParam  {number}            [var3]  A query parameter
 * @QueryParam  {string}            var4    A required query parameter
 * @HeaderParam {string}            var5    A header parameter
 * @FormParam   {string}            var6    A form parameter
 * @FormParam   {string}            [var7]  An optional form parameter [choice1, choice2]
 * @HttpResponse                    404     Custom http response message
 * @Produces    [application/json]
 * @Consumes    [application/json]
 * @Api private
 */
