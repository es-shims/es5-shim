Provides compatibility shims so that legacy JavaScript
engines behave as closely as possible to ES5.

This package requires quite a bit more attention and
testing.

TESTS
-----

The tests are written with the Jasmine BDD test framework.
To run the tests, navigate to <root-folder>/tests/.

In order to run against the shim-code, the tests attempt to kill the current
implementation of the missing methods. This happens in <root-folder>/tests/helpers/h-kill.js.
So in order to run the tests against the build-in methods, invalidate that file somehow
(comment-out, delete the file, delete the script-tag, etc.).

SAFE SHIMS
----------

### Complete tests ###

* Array.prototype.every
* Array.prototype.filter
* Array.prototype.forEach
* Array.prototype.indexOf
* Array.prototype.lastIndexOf
* Array.prototype.map
* Array.prototype.some
* Array.prototype.reduce
* Array.prototype.reduceRight
* Array.isArray
* Date.now
* Date.prototype.toJSON
* Function.prototype.bind
    * /!\ Caveat: the bound function's length is always 0.
    * /!\ Caveat: the bound function has a prototype property.
    * /!\ Caveat: bound functions do not try too hard to keep you
      from manipulating their ``arguments`` and ``caller`` properties.
    * /!\ Caveat: bound functions don't have checks in ``call`` and
      ``apply`` to avoid executing as a constructor.
* Object.keys
* String.prototype.trim

### Untested ###

* Date.parse (for ISO parsing)
* Date.prototype.toISOString

DUBIOUS SHIMS
-------------

* /?\ Object.getPrototypeOf

    This will return "undefined" in some cases.  It uses
    __proto__ if it's available.  Failing that, it uses
    constructor.prototype, which depends on the constructor
    property of the object's prototype having not been
    replaced.  If your object was created like this, it
    won't work:

        function Foo() {
        }
        Foo.prototype = {};

    Because the prototype reassignment destroys the
    constructor property.

* Object.isExtensible

    Works like a charm, by trying very hard to extend the
    object then redacting the extension.
