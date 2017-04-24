/* global describe, it, xit, expect, beforeEach, jasmine, window */

var has = Object.prototype.hasOwnProperty;
var supportsDescriptors = Object.defineProperty && (function () {
    try {
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        for (var _ in obj) { return false; } // jscs:ignore disallowUnusedVariables
        return obj.x === obj;
    } catch (e) { /* this is ES3 */
        return false;
    }
}());
var ifWindowIt = typeof window === 'undefined' ? xit : it;
var extensionsPreventible = typeof Object.preventExtensions === 'function' && (function () {
    var obj = {};
    Object.preventExtensions(obj);
    obj.a = 3;
    return obj.a !== 3;
}());
var ifExtensionsPreventibleIt = extensionsPreventible ? it : xit;
var canSeal = typeof Object.seal === 'function' && (function () {
    var obj = { a: 3 };
    Object.seal(obj);
    delete obj.a;
    return obj.a === 3;
}());
var ifCanSealIt = canSeal ? it : xit;
var canFreeze = typeof Object.freeze === 'function' && (function () {
    var obj = {};
    Object.freeze(obj);
    obj.a = 3;
    return obj.a !== 3;
}());
var ifCanFreezeIt = canFreeze ? it : xit;

describe('Object', function () {
    'use strict';

    describe('.keys()', function () {
        var obj = {
            str: 'boz',
            obj: { },
            arr: [],
            bool: true,
            num: 42,
            'null': null,
            undefined: undefined
        };

        var loopedValues = [];
        for (var key in obj) {
            loopedValues.push(key);
        }

        var keys = Object.keys(obj);
        it('should have correct length', function () {
            expect(keys.length).toBe(7);
        });

        describe('arguments objects', function () {
            it('works with an arguments object', function () {
                (function () {
                    expect(arguments.length).toBe(3);
                    expect(Object.keys(arguments).length).toBe(arguments.length);
                    expect(Object.keys(arguments)).toEqual(['0', '1', '2']);
                }(1, 2, 3));
            });

            it('works with a legacy arguments object', function () {
                var FakeArguments = function (args) {
                    args.forEach(function (arg, i) {
                        this[i] = arg;
                    }.bind(this));
                };
                FakeArguments.prototype.length = 3;
                FakeArguments.prototype.callee = function () {};

                var fakeOldArguments = new FakeArguments(['a', 'b', 'c']);
                expect(Object.keys(fakeOldArguments)).toEqual(['0', '1', '2']);
            });
        });

        it('should return an Array', function () {
            expect(Array.isArray(keys)).toBe(true);
        });

        it('should return names which are own properties', function () {
            keys.forEach(function (name) {
                expect(has.call(obj, name)).toBe(true);
            });
        });

        it('should return names which are enumerable', function () {
            keys.forEach(function (name) {
                expect(loopedValues.indexOf(name)).toNotBe(-1);
            });
        });

        // ES6 Object.keys does not require this throw
        xit('should throw error for non object', function () {
            var e = {};
            expect(function () {
                try {
                    Object.keys(42);
                } catch (err) {
                    throw e;
                }
            }).toThrow(e);
        });

        describe('enumerating over non-enumerable properties', function () {
            it('has no enumerable keys on a Function', function () {
                var Foo = function () {};
                expect(Object.keys(Foo.prototype)).toEqual([]);
            });

            it('has no enumerable keys on a boolean', function () {
                expect(Object.keys(Boolean.prototype)).toEqual([]);
            });

            it('has no enumerable keys on an object', function () {
                expect(Object.keys(Object.prototype)).toEqual([]);
            });
        });

        it('works with boxed primitives', function () {
            expect(Object.keys(Object('hello'))).toEqual(['0', '1', '2', '3', '4']);
        });

        it('works with boxed primitives with extra properties', function () {
            var x = Object('x');
            x.y = 1;
            var actual = Object.keys(x);
            var expected = ['0', 'y'];
            actual.sort();
            expected.sort();
            expect(actual).toEqual(expected);
        });

        ifWindowIt('can serialize all objects on the `window`', function () {
            var windowItemKeys, exception;
            var excludedKeys = ['window', 'console', 'parent', 'self', 'frame', 'frames', 'frameElement', 'external', 'height', 'width'];
            if (supportsDescriptors) {
                Object.defineProperty(window, 'thrower', {
                    configurable: true,
                    get: function () { throw new RangeError('thrower!'); }
                });
            }
            for (var k in window) {
                exception = void 0;
                windowItemKeys = exception;
                if (excludedKeys.indexOf(k) === -1 && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
                    try {
                        windowItemKeys = Object.keys(window[k]);
                    } catch (e) {
                        exception = e;
                    }
                    expect(Array.isArray(windowItemKeys)).toBe(true);
                    expect(exception).toBeUndefined();
                }
            }
            if (supportsDescriptors) {
                delete window.thrower;
            }
        });
    });

    describe('.isExtensible()', function () {
        var obj = { };

        it('should return true if object is extensible', function () {
            expect(Object.isExtensible(obj)).toBe(true);
        });

        ifExtensionsPreventibleIt('should return false if object is not extensible', function () {
            expect(Object.isExtensible(Object.preventExtensions(obj))).toBe(false);
        });

        ifCanSealIt('should return false if object is sealed', function () {
            expect(Object.isExtensible(Object.seal(obj))).toBe(false);
        });

        ifCanFreezeIt('should return false if object is frozen', function () {
            expect(Object.isExtensible(Object.freeze(obj))).toBe(false);
        });

        it('should throw error for non object', function () {
            try {
                // note: in ES6, this is expected to return false.
                expect(Object.isExtensible(42)).toBe(false);
            } catch (err) {
                expect(err).toEqual(jasmine.any(TypeError));
            }
        });
    });

    describe('.defineProperty()', function () {
        var obj;

        beforeEach(function () {
            obj = {};

            Object.defineProperty(obj, 'name', {
                value: 'Testing',
                configurable: true,
                enumerable: true,
                writable: true
            });
        });

        it('should return the initial value', function () {
            expect(has.call(obj, 'name')).toBeTruthy();
            expect(obj.name).toBe('Testing');
        });

        it('should be setable', function () {
            obj.name = 'Other';
            expect(obj.name).toBe('Other');
        });

        it('should return the parent initial value', function () {
            var child = Object.create(obj, {});

            expect(child.name).toBe('Testing');
            expect(has.call(child, 'name')).toBeFalsy();
        });

        it('should not override the parent value', function () {
            var child = Object.create(obj, {});

            Object.defineProperty(child, 'name', { value: 'Other' });

            expect(obj.name).toBe('Testing');
            expect(child.name).toBe('Other');
        });

        it('should throw error for non object', function () {
            expect(function () {
                Object.defineProperty(42, 'name', {});
            }).toThrow();
        });

        it('should not throw error for empty descriptor', function () {
            expect(function () {
                Object.defineProperty({}, 'name', {});
            }).not.toThrow();
        });
    });

    describe('.getOwnPropertyDescriptor()', function () {
        it('should return undefined because the object does not own the property', function () {
            var descr = Object.getOwnPropertyDescriptor({}, 'name');

            expect(descr).toBeUndefined();
        });

        it('should return a data descriptor', function () {
            var descr = Object.getOwnPropertyDescriptor({ name: 'Testing' }, 'name');
            var expected = {
                value: 'Testing',
                enumerable: true,
                writable: true,
                configurable: true
            };

            expect(descr).toEqual(expected);
        });

        it('should return undefined because the object does not own the property', function () {
            var descr = Object.getOwnPropertyDescriptor(Object.create({ name: 'Testing' }, {}), 'name');

            expect(descr).toBeUndefined();
        });

        it('should return a data descriptor', function () {
            var expected = {
                value: 'Testing',
                configurable: true,
                enumerable: true,
                writable: true
            };
            var obj = Object.create({}, { name: expected });

            var descr = Object.getOwnPropertyDescriptor(obj, 'name');

            expect(descr).toEqual(expected);
        });

        it('should throw error for non object', function () {
            try {
                // note: in ES6, we expect this to return undefined.
                expect(Object.getOwnPropertyDescriptor(42, 'name')).toBeUndefined();
            } catch (err) {
                expect(err).toEqual(jasmine.any(TypeError));
            }
        });
    });

    describe('.getPrototypeOf()', function () {
        it('should return the [[Prototype]] of an object', function () {
            var Foo = function () {};

            var proto = Object.getPrototypeOf(new Foo());

            expect(proto).toBe(Foo.prototype);
        });

        it('should shamone to the `Object.prototype` if `object.constructor` is not a function', function () {
            var Foo = function () {};
            Foo.prototype.constructor = 1;

            var proto = Object.getPrototypeOf(new Foo()),
                fnToString = Function.prototype.toString;

            if (fnToString.call(Object.getPrototypeOf).indexOf('[native code]') < 0) {
                expect(proto).toBe(Object.prototype);
            } else {
                expect(proto).toBe(Foo.prototype);
            }
        });

        it('should throw error for non object', function () {
            try {
                expect(Object.getPrototypeOf(1)).toBe(Number.prototype); // ES6 behavior
            } catch (err) {
                expect(err).toEqual(jasmine.any(TypeError));
            }
        });

        it('should return null on Object.create(null)', function () {
            var obj = Object.create(null);

            expect(Object.getPrototypeOf(obj) === null).toBe(true);
        });
    });

    describe('.defineProperties()', function () {
        it('should define the constructor property', function () {
            var target = {};
            var newProperties = { constructor: { value: 'new constructor' } };
            Object.defineProperties(target, newProperties);
            expect(target.constructor).toBe('new constructor');
        });
    });

    describe('.create()', function () {
        it('should create objects with no properties when called as `Object.create(null)`', function () {
            var obj = Object.create(null);

            expect('hasOwnProperty' in obj).toBe(false);
            expect('toString' in obj).toBe(false);
            expect('constructor' in obj).toBe(false);

            var protoIsEnumerable = false;
            for (var k in obj) {
                if (k === '__proto__') {
                    protoIsEnumerable = true;
                }
            }
            expect(protoIsEnumerable).toBe(false);

            expect(obj instanceof Object).toBe(false);
        });
    });

    describe('.hasOwnProperty()', function () {
        var noop = function () {};
        var obj = {
                'toString': noop,
                'toLocaleString': noop,
                'valueOf': noop,
                'hasOwnProperty': noop,
                'isPrototypeOf': noop,
                'propertyIsEnumerable': noop,
                'constructor': noop
            };
        var obj2 = {};
        var hasOwn = Object.prototype.hasOwnProperty;

        it('defined on object "toString"', function () {
            expect(hasOwn.call(obj, 'toString')).toBe(true);
        });

        it('defined on object "toLocaleString"', function () {
            expect(hasOwn.call(obj, 'toLocaleString')).toBe(true);
        });

        it('defined on object "valueOf"', function () {
            expect(hasOwn.call(obj, 'valueOf')).toBe(true);
        });

        it('defined on object "hasOwnProperty"', function () {
            expect(hasOwn.call(obj, 'hasOwnProperty')).toBe(true);
        });

        it('defined on object "isPrototypeOf"', function () {
            expect(hasOwn.call(obj, 'isPrototypeOf')).toBe(true);
        });

        it('defined on object "propertyIsEnumerable"', function () {
            expect(hasOwn.call(obj, 'propertyIsEnumerable')).toBe(true);
        });

        it('defined on object "constructor"', function () {
            expect(hasOwn.call(obj, 'constructor')).toBe(true);
        });

        it('properties that are not defined', function () {
            expect(hasOwn.call(obj, 'foo')).toBe(false);
            expect(hasOwn.call(obj, 'bar')).toBe(false);
            expect(hasOwn.call(obj, 'fuz')).toBe(false);
        });

        it('not defined on object "toString"', function () {
            expect(hasOwn.call(obj2, 'toString')).toBe(false);
        });

        it('not defined on object "toLocaleString"', function () {
            expect(hasOwn.call(obj2, 'toLocaleString')).toBe(false);
        });

        it('not defined on object "valueOf"', function () {
            expect(hasOwn.call(obj2, 'valueOf')).toBe(false);
        });

        it('not defined on object "hasOwnProperty"', function () {
            expect(hasOwn.call(obj2, 'hasOwnProperty')).toBe(false);
        });

        it('not defined on object "isPrototypeOf"', function () {
            expect(hasOwn.call(obj2, 'isPrototypeOf')).toBe(false);
        });

        it('not defined on object "propertyIsEnumerable"', function () {
            expect(hasOwn.call(obj2, 'propertyIsEnumerable')).toBe(false);
        });

        it('not defined on object "constructor"', function () {
            expect(hasOwn.call(obj2, 'constructor')).toBe(false);
        });

        it('not defined on object should be not ok in each case', function () {
            expect(hasOwn.call(obj2, 'foo')).toBe(false);
            expect(hasOwn.call(obj2, 'bar')).toBe(false);
            expect(hasOwn.call(obj2, 'fuz')).toBe(false);
        });

        it('defined on object with "undefined" value "toString"', function () {
            expect(hasOwn.call({
                toString: undefined
            }, 'toString')).toBe(true);
        });

        it('defined on object with "undefined" value "toLocaleString"', function () {
            expect(hasOwn.call({
                toLocaleString: undefined
            }, 'toLocaleString')).toBe(true);
        });

        it('defined on object with "undefined" value "valueOf"', function () {
            expect(hasOwn.call({
                valueOf: undefined
            }, 'valueOf')).toBe(true);
        });

        it('defined on object with "undefined" value "hasOwnProperty"', function () {
            expect(hasOwn.call({
                hasOwnProperty: undefined
            }, 'hasOwnProperty')).toBe(true);
        });

        it('defined on object with "undefined" value "isPrototypeOf"', function () {
            expect(hasOwn.call({
                isPrototypeOf: undefined
            }, 'isPrototypeOf')).toBe(true);
        });

        it('defined on object with "undefined" value "propertyIsEnumerable"', function () {
            expect(hasOwn.call({
                propertyIsEnumerable: undefined
            }, 'propertyIsEnumerable')).toBe(true);
        });

        it('defined on object with "undefined" value "constructor"', function () {
            expect({
                constructor: undefined
            }.hasOwnProperty('constructor')).toBe(true);
        });

        it('string defined', function () {
            var str = 'abc';
            expect(str.hasOwnProperty('0')).toBe(true);
            expect(str.hasOwnProperty('1')).toBe(true);
            expect(str.hasOwnProperty('2')).toBe(true);
        });

        it('string not-defined', function () {
            var str = 'abc';
            expect(str.hasOwnProperty('3')).toBe(false);
        });

        it('string object defined', function () {
            var strObj = Object('abc');
            expect(strObj.hasOwnProperty('0')).toBe(true);
            expect(strObj.hasOwnProperty('1')).toBe(true);
            expect(strObj.hasOwnProperty('2')).toBe(true);
        });

        it('string object not-defined', function () {
            var strObj = Object('abc');
            expect(strObj.hasOwnProperty('3')).toBe(false);
        });

        it('arguments defined', function () {
            var args = (function () {
                return arguments;
            }(false, undefined, null, '', 0));
            expect(args.hasOwnProperty('0')).toBe(true);
            expect(args.hasOwnProperty('1')).toBe(true);
            expect(args.hasOwnProperty('2')).toBe(true);
            expect(args.hasOwnProperty('3')).toBe(true);
            expect(args.hasOwnProperty('4')).toBe(true);
        });

        it('arguments not-defined', function () {
            var args = (function () {
                return arguments;
            }(false, undefined, null, '', 0));
            expect(args.hasOwnProperty('5')).toBe(false);
        });

        it('should not list prototype or constructor', function () {
            var Constructor = function () {
                this.constructor = this.prototype = 1;
            };
            Constructor.prototype.constructor = 1;
            expect(Constructor.hasOwnProperty('constructor')).toBe(false);
        });

        it('should list prototype and constructor', function () {
            var Constructor = function () {
                this.constructor = this.prototype = 1;
            };
            Constructor.prototype.constructor = 1;
            expect(Constructor.hasOwnProperty('prototype')).toBe(true);
            expect(Constructor.prototype.hasOwnProperty('constructor')).toBe(true);
            var obj = new Constructor();
            expect(hasOwn.call(obj, 'prototype')).toBe(true);
            expect(hasOwn.call(obj, 'constructor')).toBe(true);
        });
    });
});
