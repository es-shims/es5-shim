/* global describe, it, xit,  expect, beforeEach */
var hasStrictMode = (function () {
    'use strict';

    return !this;
}());
var ifHasStrictIt = hasStrictMode ? it : xit;
var global = Function('return this')();

describe('Function', function () {
    describe('#call()', function () {
        describe('should pass correct arguments', function () {
            var testFn;
            var expected;
            beforeEach(function () {
                testFn = function () {
                    return Array.prototype.slice.call(arguments);
                };
                expected = [null, '1', 1, true, testFn];
            });

            it('`this` is `undefined`', function () {
                /* eslint-disable no-useless-call */
                var actual = testFn.call(undefined, null, '1', 1, true, testFn);
                expect(actual).toEqual(expected);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `null`', function () {
                /* eslint-disable no-useless-call */
                var actual = testFn.call(null, null, '1', 1, true, testFn);
                expect(actual).toEqual(expected);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `\'a\'`', function () {
                var actual = testFn.call('a', null, '1', 1, true, testFn);
                expect(actual).toEqual(expected);
            });

            it('`this` is `1`', function () {
                var actual = testFn.call(1, null, '1', 1, true, testFn);
                expect(actual).toEqual(expected);
            });

            it('`this` is `true`', function () {
                var actual = testFn.call(true, null, '1', 1, true, testFn);
                expect(actual).toEqual(expected);
            });

            it('`this` is `testFn`', function () {
                var actual = testFn.call(testFn, null, '1', 1, true, testFn);
                expect(actual).toEqual(expected);
            });

            it('`this` is `date`', function () {
                var actual = testFn.call(new Date(), null, '1', 1, true, testFn);
                expect(actual).toEqual(expected);
            });
        });

        describe('context in strict mode', function () {
            'use strict';

            var testFn;
            beforeEach(function () {
                testFn = function () {
                    return this;
                };
            });

            ifHasStrictIt('`this` is not defined', function () {
                expect(testFn.call()).toBe(undefined);
            });

            ifHasStrictIt('`this` is `undefined`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.call(undefined)).toBe(undefined);
                /* eslint-enable no-useless-call */
            });

            ifHasStrictIt('`this` is `null`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.call(null)).toBe(null);
                /* eslint-enable no-useless-call */
            });

            ifHasStrictIt('`this` is `a`', function () {
                expect(testFn.call('a')).toBe('a');
            });

            ifHasStrictIt('`this` is `1`', function () {
                expect(testFn.call(1)).toBe(1);
            });

            ifHasStrictIt('`this` is `true`', function () {
                expect(testFn.call(true)).toBe(true);
            });

            ifHasStrictIt('`this` is `testFn`', function () {
                expect(testFn.call(testFn)).toBe(testFn);
            });

            ifHasStrictIt('`this` is `date`', function () {
                var subject = new Date();
                expect(testFn.call(subject)).toBe(subject);
            });
        });

        describe('context in non-strict mode', function () {
            var testFn;
            beforeEach(function () {
                testFn = function () {
                    return this;
                };
            });

            it('`this` is not defined', function () {
                expect(testFn.call()).toBe(global);
            });

            it('`this` is `undefined`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.call(undefined)).toBe(global);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `null`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.call(null)).toBe(global);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `\'a\'`', function () {
                var result = testFn.call('a');
                expect(typeof result).toBe('object');
                expect(String(result)).toBe('a');
            });

            it('`this` is `1`', function () {
                var result = testFn.call(1);
                expect(typeof result).toBe('object');
                expect(Number(result)).toBe(1);
            });

            it('`this` is `true`', function () {
                var result = testFn.call(true);
                expect(typeof result).toBe('object');
                expect(Boolean(result)).toBe(true);
            });

            it('`this` is `testFn`', function () {
                expect(testFn.call(testFn)).toBe(testFn);
            });

            it('`this` is `date`', function () {
                var subject = new Date();
                expect(testFn.call(subject)).toBe(subject);
            });
        });
    });

    describe('#apply()', function () {
        var expected;
        var testFn;

        beforeEach(function () {
            expected = [];
            testFn = function () {
                return Array.prototype.slice.call(arguments);
            };
        });

        describe('should not throw if argument is `undefined`, `null` or `object`', function () {
            it('`argArray` is `null`', function () {
                var actual = testFn.apply(undefined, null);
                expect(actual).toEqual(expected, 'null');
            });

            it('`argArray` is `undefined`', function () {
                var actual = testFn.apply(undefined, undefined);
                expect(actual).toEqual(expected);
            });

            it('`argArray` is `function`', function () {
                var actual = testFn.apply(undefined, function () {});
                expect(actual).toEqual(expected);
            });

            it('`argArray` is `{}`', function () {
                var actual = testFn.apply(undefined, {});
                expect(actual).toEqual(expected);
            });

            it('`argArray` is `date`', function () {
                var actual = testFn.apply(undefined, new Date());
                expect(actual).toEqual(expected);
            });

            it('`argArray` is `regexp`', function () {
                var actual = testFn.apply(undefined, /pattern/);
                expect(actual).toEqual(expected);
            });
        });

        describe('should throw if argument is any other primitive', function () {
            var testFn;
            beforeEach(function () {
                testFn = function () {};
            });

            it('argument is `1`', function () {
                expect(function () {
                    testFn.apply(undefined, 1);
                }).toThrow();
            });

            it('argument is `true`', function () {
                expect(function () {
                    testFn.apply(undefined, true);
                }).toThrow();
            });

            it('argument is `\'123\'`', function () {
                expect(function () {
                    testFn.apply(undefined, '123');
                }).toThrow();
            });
        });

        describe('should pass correct arguments', function () {
            var testFn;
            var expected;
            var args;
            beforeEach(function () {
                testFn = function () {
                    return Array.prototype.slice.call(arguments);
                };
                expected = [null, '1', 1, true, testFn];
                args = [null, '1', 1, true, testFn];
            });

            it('`this` is `undefined`', function () {
                /* eslint-disable no-useless-call */
                var actual = testFn.apply(undefined, args);
                expect(actual).toEqual(expected);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `null`', function () {
                /* eslint-disable no-useless-call */
                var actual = testFn.apply(null, args);
                expect(actual).toEqual(expected);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `\'a\'`', function () {
                var actual = testFn.apply('a', args);
                expect(actual).toEqual(expected);
            });

            it('`this` is `1`', function () {
                var actual = testFn.apply(1, args);
                expect(actual).toEqual(expected);
            });

            it('`this` is `true`', function () {
                var actual = testFn.apply(true, args);
                expect(actual).toEqual(expected);
            });

            it('`this` is `testFn`', function () {
                var actual = testFn.apply(testFn, args);
                expect(actual).toEqual(expected);
            });

            it('`this` is `date`', function () {
                var actual = testFn.apply(new Date(), args);
                expect(actual).toEqual(expected);
            });
        });

        describe('context in strict mode', function () {
            'use strict';

            var testFn;
            beforeEach(function () {
                testFn = function () {
                    return this;
                };
            });

            ifHasStrictIt('`this` is not defined', function () {
                expect(testFn.apply()).toBe(undefined);
            });

            ifHasStrictIt('`this` is `undefined`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.apply(undefined)).toBe(undefined);
                /* eslint-enable no-useless-call */
            });

            ifHasStrictIt('`this` is `null`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.apply(null)).toBe(null);
                /* eslint-enable no-useless-call */
            });

            ifHasStrictIt('`this` is `a`', function () {
                expect(testFn.apply('a')).toBe('a');
            });

            ifHasStrictIt('`this` is `1`', function () {
                expect(testFn.apply(1)).toBe(1);
            });

            ifHasStrictIt('`this` is `true`', function () {
                expect(testFn.apply(true)).toBe(true);
            });

            ifHasStrictIt('`this` is `testFn`', function () {
                expect(testFn.apply(testFn)).toBe(testFn);
            });

            ifHasStrictIt('`this` is `date`', function () {
                var subject = new Date();
                expect(testFn.apply(subject)).toBe(subject);
            });
        });

        describe('context in non-strict mode', function () {
            var testFn;
            beforeEach(function () {
                testFn = function () {
                    return this;
                };
            });

            it('`this` is not defined', function () {
                expect(testFn.apply()).toBe(global);
            });

            it('`this` is `undefined`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.apply(undefined)).toBe(global);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `null`', function () {
                /* eslint-disable no-useless-call */
                expect(testFn.apply(null)).toBe(global);
                /* eslint-enable no-useless-call */
            });

            it('`this` is `\'a\'`', function () {
                var result = testFn.apply('a');
                expect(typeof result).toBe('object');
                expect(String(result)).toBe('a');
            });

            it('`this` is `1`', function () {
                var result = testFn.apply(1);
                expect(typeof result).toBe('object');
                expect(Number(result)).toBe(1);
            });

            it('`this` is `true`', function () {
                var result = testFn.apply(true);
                expect(typeof result).toBe('object');
                expect(Boolean(result)).toBe(true);
            });

            it('`this` is `testFn`', function () {
                expect(testFn.apply(testFn)).toBe(testFn);
            });

            it('`this` is `date`', function () {
                var subject = new Date();
                expect(testFn.apply(subject)).toBe(subject);
            });
        });

        describe('works with arraylike objects', function () {
            it('object like sparse array', function () {
                var arrayLike = { length: 4, 0: 1, 2: 4, 3: true };
                var expectedArray = [1, undefined, 4, true];
                var actualArray = (function () {
                    return Array.prototype.slice.apply(arguments);
                }.apply(null, arrayLike));
                expect(actualArray).toEqual(expectedArray);
            });

            it('arguments object', function () {
                var args = function () {
                    return arguments;
                };
                var testFn = function () {
                    return Array.prototype.slice.call(arguments);
                };
                expect(testFn.apply(undefined, args(1, 2, 3, 4))).toEqual([1, 2, 3, 4]);
            });
        });
    });

    describe('#bind()', function () {
        var actual;

        var testSubject = {
            push: function (o) {
                this.a.push(o);
            }
        };

        var func = function func() {
            Array.prototype.forEach.call(arguments, function (a) {
                this.push(a);
            }, this);
            return this;
        };

        beforeEach(function () {
            actual = [];
            testSubject.a = [];
        });

        it('binds properly without a context', function () {
            var context;
            testSubject.func = function () {
                context = this;
            }.bind();
            testSubject.func();
            expect(context).toBe(function () { return this; }.call());
        });
        it('binds properly without a context, and still supplies bound arguments', function () {
            var a, context;
            testSubject.func = function () {
                a = Array.prototype.slice.call(arguments);
                context = this;
            }.bind(undefined, 1, 2, 3);
            testSubject.func(1, 2, 3);
            expect(a).toEqual([1, 2, 3, 1, 2, 3]);
            expect(context).toBe(function () { return this; }.call());
        });
        it('binds a context properly', function () {
            testSubject.func = func.bind(actual);
            testSubject.func(1, 2, 3);
            expect(actual).toEqual([1, 2, 3]);
            expect(testSubject.a).toEqual([]);
        });
        it('binds a context and supplies bound arguments', function () {
            testSubject.func = func.bind(actual, 1, 2, 3);
            testSubject.func(4, 5, 6);
            expect(actual).toEqual([1, 2, 3, 4, 5, 6]);
            expect(testSubject.a).toEqual([]);
        });

        it('returns properly without binding a context', function () {
            testSubject.func = function () {
                return this;
            }.bind();
            var context = testSubject.func();
            expect(context).toBe(function () { return this; }.call());
        });
        it('returns properly without binding a context, and still supplies bound arguments', function () {
            var context;
            testSubject.func = function () {
                context = this;
                return Array.prototype.slice.call(arguments);
            }.bind(undefined, 1, 2, 3);
            actual = testSubject.func(1, 2, 3);
            expect(context).toBe(function () { return this; }.call());
            expect(actual).toEqual([1, 2, 3, 1, 2, 3]);
        });
        it('returns properly while binding a context properly', function () {
            var ret;
            testSubject.func = func.bind(actual);
            ret = testSubject.func(1, 2, 3);
            expect(ret).toBe(actual);
            expect(ret).not.toBe(testSubject);
        });
        it('returns properly while binding a context and supplies bound arguments', function () {
            var ret;
            testSubject.func = func.bind(actual, 1, 2, 3);
            ret = testSubject.func(4, 5, 6);
            expect(ret).toBe(actual);
            expect(ret).not.toBe(testSubject);
        });
        it('has the new instance\'s context as a constructor', function () {
            var actualContext;
            var expectedContext = { foo: 'bar' };
            testSubject.Func = function () {
                actualContext = this;
            }.bind(expectedContext);
            var result = new testSubject.Func();
            expect(result).toBeTruthy();
            expect(actualContext).not.toBe(expectedContext);
        });
        it('passes the correct arguments as a constructor', function () {
            var expected = { name: 'Correct' };
            testSubject.Func = function (arg) {
                expect(this.hasOwnProperty('name')).toBe(false);
                return arg;
            }.bind({ name: 'Incorrect' });
            var ret = new testSubject.Func(expected);
            expect(ret).toBe(expected);
        });
        it('returns the return value of the bound function when called as a constructor', function () {
            var oracle = [1, 2, 3];
            var Subject = function () {
                expect(this).not.toBe(oracle);
                return oracle;
            }.bind(null);
            var result = new Subject();
            expect(result).toBe(oracle);
        });

        it('returns the correct value if constructor returns primitive', function () {
            var Subject = function (oracle) {
                expect(this).not.toBe(oracle);
                return oracle;
            }.bind(null);

            var primitives = ['asdf', null, true, 1];
            for (var i = 0; i < primitives.length; ++i) {
                expect(new Subject(primitives[i])).not.toBe(primitives[i]);
            }

            var objects = [[1, 2, 3], {}, function () {}];
            for (var j = 0; j < objects.length; ++j) {
                expect(new Subject(objects[j])).toBe(objects[j]);
            }
        });
        it('returns the value that instance of original "class" when called as a constructor', function () {
            var ClassA = function (x) {
                this.name = x || 'A';
            };
            var ClassB = ClassA.bind(null, 'B');

            var result = new ClassB();
            expect(result instanceof ClassA).toBe(true);
            expect(result instanceof ClassB).toBe(true);
        });
        it('sets a correct length without thisArg', function () {
            var Subject = function (a, b, c) { return a + b + c; }.bind();
            expect(Subject.length).toBe(3);
        });
        it('sets a correct length with thisArg', function () {
            var Subject = function (a, b, c) { return a + b + c + this.d; }.bind({ d: 1 });
            expect(Subject.length).toBe(3);
        });
        it('sets a correct length with thisArg and first argument', function () {
            var Subject = function (a, b, c) { return a + b + c + this.d; }.bind({ d: 1 }, 1);
            expect(Subject.length).toBe(2);
        });
        it('sets a correct length without thisArg and first argument', function () {
            var Subject = function (a, b, c) { return a + b + c; }.bind(undefined, 1);
            expect(Subject.length).toBe(2);
        });
        it('sets a correct length without thisArg and too many argument', function () {
            var Subject = function (a, b, c) { return a + b + c; }.bind(undefined, 1, 2, 3, 4);
            expect(Subject.length).toBe(0);
        });
    });
});
