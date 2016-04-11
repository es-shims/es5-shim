/* global describe, it, xit, expect, beforeEach, jasmine, window */

var supportsDescriptors = Object.defineProperty && (function () {
    try {
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        for (var _ in obj) { return false; }
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
                expect(obj.hasOwnProperty(name)).toBe(true);
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
          var has = Object.prototype.hasOwnProperty;
          var windowItemKeys, exception;
          var blacklistedKeys = ['window', 'console', 'parent', 'self', 'frame', 'frames', 'frameElement', 'external'];
          if (supportsDescriptors) {
              Object.defineProperty(window, 'thrower', {
                  configurable: true,
                  get: function () { throw new RangeError('thrower!'); }
              });
          }
          for (var k in window) {
              windowItemKeys = exception = void 0;
              if (blacklistedKeys.indexOf(k) === -1 && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
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
        describe('original tests', function () {
            // No tests to check default properties or if they work?
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
                expect(obj.hasOwnProperty('name')).toBeTruthy();
                expect(obj.name).toBe('Testing');
            });

            it('should be setable', function () {
                obj.name = 'Other';
                expect(obj.name).toBe('Other');
            });

            it('should return the parent initial value', function () {
                var child = Object.create(obj, {});

                expect(child.name).toBe('Testing');
                expect(child.hasOwnProperty('name')).toBeFalsy();
            });

            it('should not override the parent value', function () {
                var child = Object.create(obj, {});

                Object.defineProperty(child, 'name', {
                    value: 'Other'
                });

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

            it('should throw a TypeError in each case', function () {
                expect(function () {
                    Object.defineProperty();
                }).toThrow();
                expect(function () {
                    Object.defineProperty(undefined);
                }).toThrow();
                expect(function () {
                    Object.defineProperty(null);
                }).toThrow();
                expect(function () {
                    Object.defineProperty({}, 'foo');
                }).toThrow();
                expect(function () {
                    Object.defineProperty({}, 'foo', undefined);
                }).toThrow();
                expect(function () {
                    Object.defineProperty({}, 'foo', null);
                }).toThrow();
                expect(function () {
                    Object.defineProperty({}, 'foo', true);
                }).toThrow();
                expect(function () {
                    Object.defineProperty({}, 'foo', 1);
                }).toThrow();
            });
        });

        describe('extended tests', function () {
            var noop;
            beforeEach(function () {
                noop = function () {};
            });

            describe('defining properties on objects', function () {
                it('without `value` should define own property and have a value of `undefined`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toBe(undefined);
                });

                it('with `value` as `undefined` should define own property and have a value of `undefined`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: undefined,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toBe(undefined);
                });

                it('with `value` as `null` should define own property and have a value of `null`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: null,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toBe(null);
                });

                it('with `value` as `1` should define own property and have a value of `1`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: 1,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toBe(1);
                });

                it('with `value` as `true` should define own property and have a value of `true`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: true,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toBe(true);
                });

                it('with `value` as `` should define own property and have a value of ``', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: '',
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toBe('');
                });

                it('with `value` as `{}` should define own property and have a value of `{}`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: {},
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toEqual({});
                });

                it('with `value` as `[]` should define own property and have a value of `[]`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: [],
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toEqual([]);
                });

                it('with `value` as `function` should define own property and have a value of `function`', function () {
                    var obj = Object.defineProperty({}, 'foo', {
                        value: noop,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                    expect(obj.foo).toBe(noop);
                });
            });

            it('should not throw an error redefinining properties on plain objects', function () {
                var obj = {
                    foo: 10
                };
                Object.defineProperty(obj, 'foo', {
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(10);

                Object.defineProperty(obj, 'foo', {
                    enumerable: false,
                    writable: false,
                    configurable: false
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(10);
            });
        });

        describe('defining non-item properties on arrays', function () {
            it('property without `value` should be own property with value of `undefined`', function () {
                var obj = Object.defineProperty([], 'foo', {
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(undefined);
            });

            it('property with `value` of `undefined` should be own property with value of `undefined`', function () {
                var obj = Object.defineProperty([], 'foo', {
                    value: undefined,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(undefined);
            });

            it('property with `value` of `null` should be own property with value of `null`', function () {
                var obj = Object.defineProperty([], 'foo', {
                    value: null,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(null);
            });

            it('property with `value` of `1` should be own property with value of `1`', function () {
                var obj = Object.defineProperty([], 'foo', {
                    value: 1,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(1);
            });

            it('property with `value` of `true` should be own property with value of `true`', function () {
                var obj = Object.defineProperty([], 'foo', {
                    value: true,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(true);
            });

            it('property with `value` of `[]` should be own property with value of `[]`', function () {
                var obj = Object.defineProperty([], 'foo', {
                    value: '',
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe('');
            });

            it('property with `value` of `function` should be own property with value of `function`', function () {
                var noop = function () {};
                var obj = Object.defineProperty([], 'foo', {
                    value: noop,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(noop);
            });
        });

        describe('defining items on arrays, string property name', function () {
            it('with `value` not defined', function () {
                var obj = Object.defineProperty([], '0', {
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(obj.length).toBe(1);
                expect(Object.prototype.hasOwnProperty.call(obj, '0')).toBe(true);
                expect(obj[0]).toBe(undefined);
            });

            it('with `value` of `undefined`', function () {
                var obj = Object.defineProperty([], '0', {
                    value: undefined,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(obj.length).toBe(1);
                expect(Object.prototype.hasOwnProperty.call(obj, '0')).toBe(true);
                expect(obj[0]).toBe(undefined);
            });

            it('with `value` of `null`', function () {
                var obj = Object.defineProperty([], '0', {
                    value: null,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, '0')).toBe(true);
                expect(obj.length).toBe(1);
                expect(obj[0]).toBe(null);
            });
        });

        describe('defining items on arrays, number as property name', function () {
            it('with `value` not defined', function () {
                var obj = Object.defineProperty([], 0, {
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(obj.length).toBe(1);
                expect(obj[0]).toBe(undefined);
            });

            it('with `value` of `undefined`', function () {
                var obj = Object.defineProperty([], 0, {
                    value: undefined,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(obj.length).toBe(1);
                expect(obj[0]).toBe(undefined);
            });

            it('with `value` of `null`', function () {
                var obj = Object.defineProperty([], 0, {
                    value: null,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 0)).toBe(true);
                expect(obj.length).toBe(1);
                expect(obj[0]).toBe(null);
            });

            describe('sparse', function () {
                it('with `value` not defined', function () {
                    var obj = Object.defineProperty([], 1, {
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(obj.length).toBe(2);
                    expect(obj[1]).toBe(undefined);
                });

                it('with `value` of `undefined`', function () {
                    var obj = Object.defineProperty([], 1, {
                        value: undefined,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(obj.length).toBe(2);
                    expect(obj[1]).toBe(undefined);
                });

                it('with `value` of `null`', function () {
                    var obj = Object.defineProperty([], 1, {
                        value: null,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 1)).toBe(true);
                    expect(obj.length).toBe(2);
                    expect(obj[1]).toBe(null);
                });
            });

            describe('using a float as property name', function () {
                it('`value` not defined should be a property and not an item', function () {
                    var obj = Object.defineProperty([], 1.1, {
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 1.1)).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj[1.1]).toBe(undefined);
                });

                it('`value` of `undefined` should be a property and not an item', function () {
                    var obj = Object.defineProperty([], 1.1, {
                        value: undefined,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 1.1)).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj[1.1]).toBe(undefined);
                });

                it('`value` of `null` should be a property and not an item', function () {
                    var obj = Object.defineProperty([], 1.1, {
                        value: null,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, 1.1)).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj[1.1]).toBe(null);
                });
            });

            describe('using a float string as property name', function () {
                it('`value` not defined should be a property and not an item', function () {
                    var obj = Object.defineProperty([], '1.', {
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, '1.')).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj['1.']).toBe(undefined);
                });

                it('`value` of `undefined` should be a property and not an item', function () {
                    var obj = Object.defineProperty([], '1.', {
                        value: undefined,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, '1.')).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj['1.']).toBe(undefined);
                });

                it('`value` of `null` should be a property and not an item', function () {
                    var obj = Object.defineProperty([], '1.', {
                        value: null,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, '1.')).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj['1.']).toBe(null);
                });

                it('`value` of `true` should be a property and not an item', function () {
                    var obj = Object.defineProperty([], '1.', {
                        value: true,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, '1.')).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj['1.']).toBe(true);
                });
            });

            describe('using a hex string as property name', function () {
                it('name of `01` should be a property and not an item', function () {
                    var obj = Object.defineProperty([], '01', {
                        value: true,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, '01')).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj['01']).toBe(true);
                });

                it('name of `0x1` should be a property and not an item', function () {
                    var obj = Object.defineProperty([], '0x1', {
                        value: true,
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                    expect(Object.prototype.hasOwnProperty.call(obj, '0x1')).toBe(true);
                    expect(obj.length).toBe(0);
                    expect(obj['0x1']).toBe(true);
                });
            });
        });

        describe('redefining descriptors on arrays', function () {
            it('elements on arrays', function () {
                var result = Object.defineProperty([10], '0', {
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(result.length).toBe(1);
                expect(result[0]).toBe(10);
            });
        });

        describe('defining properties on functions', function () {
            it('with `value` not defined', function () {
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(undefined);
            });

            it('with `value` of `undefined`', function () {
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: undefined,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(undefined);
            });

            it('with `value` of `null`', function () {
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: null,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(null);
            });

            it('with `value` of `{}`', function () {
              var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: {},
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toEqual({});
            });

            it('with `value` of `[]`', function () {
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: [],
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toEqual([]);
            });

            it('with `value` of ``', function () {
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: '',
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe('');
            });

            it('with `value` of `true`', function () {
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: true,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(true);
            });

            it('with `value` of `1`', function () {
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: 1,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(1);
            });

            it('with `value` of `function`', function () {
                var noop = function () {};
                var obj = Object.defineProperty(function () { return; }, 'foo', {
                    value: noop,
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
                expect(Object.prototype.hasOwnProperty.call(obj, 'foo')).toBe(true);
                expect(obj.foo).toBe(noop);
            });
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
            var newProperties = {
                constructor: {
                  value: 'new constructor'
                }
            };
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
});
