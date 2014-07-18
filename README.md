[![Build Status](https://travis-ci.org/oaeproject/restjsdoc.png?branch=master)](https://travis-ci.org/oaeproject/restjsdoc)

A parser to read jsdoc-like inline documentation
================================================

See the `test/sample.js` for examples of what the inline docs look like.

Releasing
=========

First setup your github username and a generated access token in environment variables:

```
GITHUB_USERNAME
GITHUB_PASSWORD
```

Please don't use your web access password, generate a token.

Then, to release:

    * Increment and release patch version upgrade (e.g., `0.0.3` -> `0.0.4`): `grunt release:patch`
    * Increment and release minor version upgrade (e.g., `0.1.3` -> `0.2.0`): `grunt release:minor`
    * Increment and release major version upgrade (e.g., `2.1.3` -> `3.0.0`): `grunt release:major`

You should never have to touch the versions inside `package.json` manually, the task increments it for you. Also, make sure your working copy is clean and that: `git fetch origin; git diff origin/master` while on the master branch has no differences.
