// vim:set ts=4 sts=4 sw=4 st:
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright(C) 2010 XXX No License Specified
// -- fschaefer Florian Schäfer Copyright (C) 2010 MIT License
// -- Irakli Gozalishvili Copyright (C) 2010 MIT License
// -- kitcambridge Kit Cambridge Copyright (C) 2011 MIT License

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define(function () {
            definition();
        });
    // CommonJS and <script>
    } else {
        definition();
    }

})(function (undefined) {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-050.pdf
 *
 * NOTE: this is a draft, and as such, the URL is subject to change.  If the
 * link is broken, check in the parent directory for the latest TC39 PDF.
 * http://www.ecma-international.org/publications/files/drafts/
 *
 * Previous ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
 * This is a broken link to the previous draft of ES5 on which most of the
 * numbered specification references and quotes herein were taken.  Updating
 * these references and quotes to reflect the new document would be a welcome
 * volunteer project.
 *
 * @module
 */

/*whatsupdoc*/


var protoObject   = {},
    protoArray    = [],
    protoFunction = function(){},
    protoRegExp   = /./,
    protoString   = "";

var natives =
    { Function:
        { call  : protoFunction.call
        , apply : protoFunction.apply
        }
    , Array:
        { constructor : Array
        , slice       : protoArray.slice
        , splice      : protoArray.splice
        , concat      : protoArray.concat
        , push        : protoArray.push
        , shift       : protoArray.shift
        , pop         : protoArray.pop
        }
    , Object:
        { constructor : Object
        , toString    : protoObject.toString
        , create      : Object.create
        , freeze      : Object.freeze
        }
    , String:
        { constructor : String
        , replace     : protoString.replace
        }
    , Math:
        { object : Math
        , abs    : Math.abs
        , floor  : Math.floor
        }
    , Date:
        { constructor        : Date
        , prototype          : Date.prototype
        , getUTCFullYear     : Date.getUTCFullYear
        , getUTCMonth        : Date.getUTCMonth
        , getUTCDate         : Date.getUTCDate
        , getUTCHours        : Date.getUTCHours
        , getUTCMinutes      : Date.getUTCMinutes
        , getUTCSeconds      : Date.getUTCSeconds
        , getUTCMilliseconds : Date.getUTCMilliseconds
        , parse              : Date.parse
        , now                : Date.now
        , UTC                : Date.UTC
        }
    , RegExp:
        { constructor : RegExp
        , exec        : protoRegExp.exec
        }
    };


var apply, call, callProp = 'call';
if (protoFunction.call.call !== protoFunction.call) {
    do { callProp = '_' + callProp; } while(callProp in protoFunction.call);
    protoFunction.call[callProp] = protoFunction.call;
}

if (typeof protoFunction.bind == "function") {
    call = protoFunction.call[callProp](protoFunction.bind, protoFunction.call, protoFunction.call);
    apply = protoFunction.call[callProp](protoFunction.bind, protoFunction.call, protoFunction.apply);
} else {
    // provide temporary `call` and `apply` functions until we've defined `bind`
    apply = function (fn, context, args) {
        return protoFunction.call[callProp](protoFunction.apply, fn, context, args);
    }
    call = function (fn, context) {
        return apply(fn, context, apply(natives.Array.slice, arguments, [2]));
    };
}

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf

if (typeof protoFunction.bind != "function") {
    Function.prototype.bind = function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        // XXX this gets pretty close, for all intents and purposes, letting
        // some duck-types slide
        if (typeof target.apply != "function" || typeof target.call != "function")
            return new TypeError();
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = call(natives.Array.slice, arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 9. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 10. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 11. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 12. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        // 13. The [[Scope]] internal property of F is unused and need not
        //   exist.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.

                var self = call(natives.Object.create, natives.Object.constructor, target.prototype);
                var result = apply(
                    self,
                    target,
                    call(natives.Array.concat, args, call(natives.Array.slice, arguments))
                );
                if (result !== null && call(natives.Object.constructor, null, result) === result)
                    return result;
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the list
                //   boundArgs in the same order followed by the same values as
                //   the list ExtraArgs in the same order. 5.  Return the
                //   result of calling the [[Call]] internal method of target
                //   providing boundThis as the this value and providing args
                //   as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return apply(
                    that,
                    target,
                    call(natives.Array.concat, args, call(natives.Array.slice, arguments))
                );

            }

        };

        // XXX bound.length is never writable, so don't even try
        //
        // 16. The length own property of F is given attributes as specified in
        //   15.3.5.1.
        // TODO
        // 17. Set the [[Extensible]] internal property of F to true.
        // TODO
        // 18. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // 19. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property.
        // XXX can't delete it in pure-js.
        return bound;
    };


    call = protoFunction.bind.call(protoFunction.call, protoFunction.call);
    apply = protoFunction.bind.call(protoFunction.call, protoFunction.apply);
    if (callProp != "call") delete protoFunction.call[callProp];
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
var owns = protoFunction.bind(protoFunction.call, protoObject.hasOwnProperty);

var defineGetter, defineSetter, lookupGetter, lookupSetter, supportsAccessors;
// If JS engine supports accessors creating shortcuts.
if ((supportsAccessors = owns(protoObject, '__defineGetter__'))) {
    defineGetter = protoFunction.bind.call(protoFunction.call, protoObject.__defineGetter__);
    defineSetter = protoFunction.bind.call(protoFunction.call, protoObject.__defineSetter__);
    lookupGetter = protoFunction.bind.call(protoFunction.call, protoObject.__lookupGetter__);
    lookupSetter = protoFunction.bind.call(protoFunction.call, protoObject.__lookupSetter__);
}

//
// Array
// =====
//

// ES5 15.4.3.2
if (typeof Array.isArray != "function") {
    Array.isArray = function isArray(obj) {
        return call(natives.Object.toString, obj) == "[object Array]";
    };
}

// ES5 15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
if (typeof protoArray.forEach != "function") {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var self = call(natives.Object.constructor, null, this),
            thisp = arguments[1],
            i = 0,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!fun || !fun.call) {
            throw new TypeError();
        }

        while (i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object context
                call(fun, thisp, self[i], i, self);
            }
            i++;
        }
    };
}

// ES5 15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (typeof protoArray.map != "function") {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();
        var result = new natives.Array.constructor(length),
            thisp = arguments[1];
        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = call(fun, thisp, self[i], i, self);
        }
        return result;
    };
}

// ES5 15.4.4.20
if (typeof protoArray.filter != "function") {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();
        var result = [],
            thisp = arguments[1];
        for (var i = 0; i < length; i++)
            if (i in self && call(fun, thisp, self[i], i, self))
                call(natives.Array.push, result, self[i]);
        return result;
    };
}

// ES5 15.4.4.16
if (typeof protoArray.every != "function") {
    Array.prototype.every = function every(fun /*, thisp */) {
        if (this === void 0 || this === null)
            throw new TypeError();
        if (typeof fun !== "function")
            throw new TypeError();
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0,
            thisp = arguments[1];
        for (var i = 0; i < length; i++) {
            if (i in self && !call(fun, thisp, self[i], i, self))
                return false;
        }
        return true;
    };
}

// ES5 15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (typeof protoArray.some != "function") {
    Array.prototype.some = function some(fun /*, thisp */) {
        if (this === void 0 || this === null)
            throw new TypeError();
        if (typeof fun !== "function")
            throw new TypeError();
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0,
            thisp = arguments[1];
        for (var i = 0; i < length; i++) {
            if (i in self && call(fun, thisp, self[i], i, self))
                return true;
        }
        return false;
    };
}

// ES5 15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (typeof protoArray.reduce != "function") {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0;
        // Whether to include (... || fun instanceof RegExp)
        // in the following expression to trap cases where
        // the provided function was actually a regular
        // expression literal, which in V8 and
        // JavaScriptCore is a typeof "function".  Only in
        // V8 are regular expression literals permitted as
        // reduce parameters, so it is desirable in the
        // general case for the shim to match the more
        // strict and common behavior of rejecting regular
        // expressions.  However, the only case where the
        // shim is applied is IE's Trident (and perhaps very
        // old revisions of other engines).  In Trident,
        // regular expressions are a typeof "object", so the
        // following guard alone is sufficient.
        if (Object.prototype.toString.call(fun) != "[object Function]")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (!length && arguments.length == 1)
            throw new TypeError();

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length)
                    throw new TypeError();
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self)
                result = fun(result, self[i], i, self);
        }

        return result;
    };
}

// ES5 15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (typeof protoArray.reduceRight != "function") {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0;
        if (call(natives.Object.toString, fun) != "[object Function]")
            throw new TypeError();
        // no value to return if no initial value, empty array
        if (!length && arguments.length == 1)
            throw new TypeError();

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0)
                    throw new TypeError();
            } while (true);
        }

        do {
            if (i in this)
                result = fun(result, self[i], i, self);
        } while (i--);

        return result;
    };
}

// ES5 15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (typeof protoArray.indexOf != "function") {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        if (this === void 0 || this === null)
            throw new TypeError();
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0;
        if (!length)
            return -1;
        var i = 0;
        if (arguments.length > 1)
            i = toInteger(arguments[1]);
        // handle negative indicies
        i = i >= 0 ? i : length - call(natives.Math.abs, natives.Math.object, i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    }
}

// ES5 15.4.4.15
if (typeof protoArray.lastIndexOf) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        if (this === void 0 || this === null)
            throw new TypeError();
        var self = call(natives.Object.constructor, null, this),
            length = self.length >>> 0;
        if (!length)
            return -1;
        var i = length - 1;
        if (arguments.length > 1)
            i = toInteger(arguments[1]);
        // handle negative indicies
        i = i >= 0 ? i : length - call(natives.Math.abs, natives.Math.object, i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i])
                return i;
        }
        return -1;
    };
}

//
// Object
// ======
//

// ES5 15.2.3.2
if (typeof Object.getPrototypeOf != "function") {
    // https://github.com/kriskowal/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    Object.getPrototypeOf = function getPrototypeOf(object) {
        return object.__proto__ || object.constructor.prototype;
        // or undefined if not available in this engine
    };
}

// ES5 15.2.3.3
if (typeof Object.getOwnPropertyDescriptor != "function") {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a " +
                         "non-object: ";
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT + object);
        // If object does not owns property return undefined immediately.
        if (!owns(object, property))
            return undefined;

        var descriptor, getter, setter;

        // If object has a property then it's for sure both `enumerable` and
        // `configurable`.
        descriptor =  { enumerable: true, configurable: true };

        // If JS engine supports accessor properties then property may be a
        // getter or setter.
        if (supportsAccessors) {
            // Unfortunately `__lookupGetter__` will return a getter even
            // if object has own non getter property along with a same named
            // inherited getter. To avoid misbehavior we temporary remove
            // `__proto__` so that `__lookupGetter__` will return getter only
            // if it's owned by an object.
            var prototype = object.__proto__;
            object.__proto__ = protoObject;

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);

            // Once we have getter and setter we can put values back.
            object.__proto__ = prototype;

            if (getter || setter) {
                if (getter) descriptor.get = getter;
                if (setter) descriptor.set = setter;

                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
            }
        }

        // If we got this far we know that object has an own property that is
        // not an accessor so we set it as a value and return descriptor.
        descriptor.value = object[property];
        return descriptor;
    };
}

// ES5 15.2.3.4
if (typeof Object.getOwnPropertyNames != "function") {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5
if (typeof Object.create != "function") {
    Object.create = function create(prototype, properties) {
        var object;
        if (prototype === null) {
            object = { "__proto__": null };
        } else {
            if (typeof prototype != "object")
                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
            var Type = function () {};
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            object.__proto__ = prototype;
        }
        if (typeof properties != "undefined")
            Object.defineProperties(object, properties);
        return object;
    };
}

// ES5 15.2.3.6
var oldDefineProperty = Object.defineProperty;
var defineProperty = oldDefineProperty;
if (defineProperty) {
    // detect IE 8's DOM-only implementation of defineProperty;
    var subject = {};
    Object.defineProperty(subject, "", {});
    defineProperty = "" in subject;
}
if (!defineProperty) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
                                      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if (typeof object != "object" && typeof object != "function")
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        if (typeof descriptor != "object" || descriptor === null)
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
        // make a valiant attempt to use the real defineProperty
        // for I8's DOM elements.
        if (oldDefineProperty && object.nodeType)
            return oldDefineProperty(object, property, descriptor);

        // If it's a data property.
        if (owns(descriptor, "value")) {
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(owns(descriptor, "writable") ? descriptor.writable : true) ||
                !(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
                !(owns(descriptor, "configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */

            if (supportsAccessors && (lookupGetter(object, property) ||
                                      lookupSetter(object, property)))
            {
                // As accessors are supported only on engines implementing
                // `__proto__` we can safely override `__proto__` while defining
                // a property to make sure that we don't hit an inherited
                // accessor.
                var prototype = object.__proto__;
                object.__proto__ = protoObject;
                // Deleting a property anyway since getter / setter may be
                // defined on object itself.
                delete object[property];
                object[property] = descriptor.value;
                // Setting original `__proto__` back now.
                object.__proto__ = prototype;
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors)
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            // If we got that far then getters and setters can be defined !!
            if (owns(descriptor, "get"))
                defineGetter(object, property, descriptor.get);
            if (owns(descriptor, "set"))
                defineSetter(object, property, descriptor.set);
        }

        return object;
    };
}

// ES5 15.2.3.7
if (typeof Object.defineProperties != "function") {
    Object.defineProperties = function defineProperties(object, properties) {
        for (var property in properties) {
            if (owns(properties, property))
                Object.defineProperty(object, property, properties[property]);
        }
        return object;
    };
}

// ES5 15.2.3.8
if (typeof Object.seal != "function") {
    Object.seal = function seal(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
if (typeof Object.freeze != "function") {
    Object.freeze = function freeze(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    (function () {
        var currFreeze = Object.freeze;
        Object.freeze = function freeze(object) {
            if (typeof object == "function") {
                return object;
            } else {
                return currFreeze(object);
            }
        };
    })();
}

// ES5 15.2.3.10
if (typeof Object.preventExtensions != "function") {
    Object.preventExtensions = function preventExtensions(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
if (typeof Object.isSealed != "function") {
    Object.isSealed = function isSealed(object) {
        return false;
    };
}

// ES5 15.2.3.12
if (typeof Object.isFrozen != "function") {
    Object.isFrozen = function isFrozen(object) {
        return false;
    };
}

// ES5 15.2.3.13
if (typeof Object.isExtensible != "function") {
    Object.isExtensible = function isExtensible(object) {
        return true;
    };
}

// ES5 15.2.3.14
// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
if (typeof Object.keys != "function") {

    var hasDontEnumBug = true,
        dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null})
        hasDontEnumBug = false;

    Object.keys = function keys(object) {

        if (
            typeof object != "object" && typeof object != "function"
            || object === null
        )
            throw new TypeError("Object.keys called on a non-object");

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                call(natives.Array.push, keys, name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    call(natives.Array.push, keys, dontEnum);
                }
            }
        }

        return keys;
    };

}

//
// Date
// ====
//

// ES5 15.9.5.43
// Format a Date object as a string according to a simplified subset of the ISO 8601
// standard as defined in 15.9.1.15.
if (typeof Date.prototype.toISOString != "function") {
    Date.prototype.toISOString = function toISOString() {
        var result, length, value;
        if (!isFinite(this))
            throw new RangeError;

        // the date time string format is specified in 15.9.1.15.
        result =
            [ call(natives.Date.getUTCFullYear, this)
            , call(natives.Date.getUTCMonth   , this) + 1
            , call(natives.Date.getUTCDate    , this)
            , call(natives.Date.getUTCHours   , this)
            , call(natives.Date.getUTCMinutes , this)
            , call(natives.Date.getUTCSeconds , this)
            ];

        length = 6;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two digits.
            if (value < 10)
                result[length] = '0' + value;
        }
        // pad milliseconds to have three digits.
        return call(natives.Array.join, call(natives.Array.slice, result, 0, 3), '-') +
            'T' + call(natives.Array.join, call(natives.Array.slice, result, 3), ':') + '.' +
            call(natives.Array.slice, '000' + call(natives.Date.getUTCMilliseconds, this), -3) + 'Z';
    };
}

// ES5 15.9.4.4
if (typeof Date.now != "function") {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// ES5 15.9.5.44
if (typeof Date.prototype.toJSON != "function") {
    Date.prototype.toJSON = function toJSON(key) {
        // This function provides a String representation of a Date object for
        // use by JSON.stringify (15.12.3). When the toJSON method is called
        // with argument key, the following steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ToPrimitive(O, hint Number).
        // 3. If tv is a Number and is not finite, return null.
        // XXX
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        // XXX this gets pretty close, for all intents and purposes, letting
        // some duck-types slide
        if (typeof this.toISOString != "function")
            throw new TypeError();
        // 6. Return the result of calling the [[Call]] internal method of
        // toISO with O as the this value and an empty argument list.
        return this.toISOString();

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// 15.9.4.2 Date.parse (string)
// 15.9.1.15 Date Time String Format
// Date.parse
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (isNaN(Date.parse("2011-06-15T21:40:05+06:00"))) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function() {

        var NativeDate = natives.Date.constructor;

        // Date.length === 7
        var Date = function(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length == 1 && call(natives.String.constructor, null, Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(natives.Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return apply(NativeDate, this, arguments);
        };

        // 15.9.1.15 Date Time String Format. This pattern does not implement
        // extended years ((15.9.1.15.1), as `Date.UTC` cannot parse them.
        var isoDateExpression = new natives.RegExp.constructor("^" +
            "(\d{4})" + // four-digit year capture
            "(?:-(\d{2})" + // optional month capture
            "(?:-(\d{2})" + // optional day capture
            "(?:" + // capture hours:minutes:seconds.milliseconds
                "T(\d{2})" + // hours capture
                ":(\d{2})" + // minutes capture
                "(?:" + // optional :seconds.milliseconds
                    ":(\d{2})" + // seconds capture
                    "(?:\.(\d{3}))?" + // milliseconds capture
                ")?" +
            "(?:" + // capture UTC offset component
                "Z|" + // UTC capture
                "(?:" + // offset specifier +/-hours:minutes
                    "([-+])" + // sign capture
                    "(\d{2})" + // hours offset capture
                    ":(\d{2})" + // minutes offest capture
                ")" +
            ")?)?)?)?" +
        "$");

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate)
            Date[key] = NativeDate[key];

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = natives.Date.now;
        Date.UTC = natives.Date.UTC;
        Date.prototype = natives.Date.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        Date.parse = function parse(string) {
            var match = call(natives.RegExp.exec, isoDateExpression, string);
            if (match) {
                call(natives.Array.shift, match); // kill match[0], the full match
                // parse months, days, hours, minutes, seconds, and milliseconds
                for (var i = 1; i < 7; i++) {
                    // provide default values if necessary
                    match[i] = +(match[i] || (i < 3 ? 1 : 0));
                    // match[1] is the month. Months are 0-11 in JavaScript
                    // `Date` objects, but 1-12 in ISO notation, so we
                    // decrement.
                    if (i == 1)
                        match[i]--;
                }

                // parse the UTC offset component
                var minutesOffset = +call(natives.Array.pop, match),
                    hourOffset = +call(natives.Array.pop, match),
                    sign = call(natives.Array.pop, match);

                // compute the explicit time zone offset if specified
                var offset = 0;
                if (sign) {
                    // detect invalid offsets and return early
                    if (hourOffset > 23 || minuteOffset > 59)
                        return NaN;

                    // express the provided time zone offset in minutes. The offset is
                    // negative for time zones west of UTC; positive otherwise.
                    offset = (hourOffset * 60 + minuteOffset) * 6e4 * (sign == "+" ? -1 : 1);
                }

                // compute a new UTC date value, accounting for the optional offset
                return apply(natives.Date.UTC, this, match) + offset;
            }
            return apply(natives.Date.parse, this, arguments);
        };

        return Date;
    })();
}

//
// String
// ======
//

// ES5 15.5.4.20
if (typeof protoString.trim != "function") {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    var s = "[\x09\x0A\-\x0D\x20\xA0\u1680\u180E\u2000-\u200A\u202F" +
        "\u205F\u3000\u2028\u2029\uFEFF]"
    var trimBeginRegexp = new natives.RegExp.constructor("^" + s + s + "*");
    var trimEndRegexp = new natives.RegExp.constructor(s + s + "*$");
    String.prototype.trim = function trim() {
        return call(natives.String.replace,
            call(natives.String.replace,
                call(natives.String.constructor, null, this),
                trimBeginRegexp, ""
            ), trimEndRegexp, ""
        );
    };
}

//
// Util
// ======
//

// http://jsperf.com/to-integer
var toInteger = function (n) {
    n = +n;
    if (n !== n) // isNaN
        n = -1;
    else if (n !== 0 && n !== (1/0) && n !== -(1/0))
        n = (n > 0 || -1) * call(natives.Math.floor, natives.Math.object, call(natives.Math.abs, natives.Math.object, n));
    return n;
};

});
