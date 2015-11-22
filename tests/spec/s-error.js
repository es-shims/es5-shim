/* global describe, it, expect */

describe('Error', function () {
    'use strict';

    describe('#toString()', function () {
        it('stringifies a newed error properly', function () {
            var msg = 'test';
            var error = new RangeError(msg);
            expect(error.name).toBe('RangeError');
            expect(error.message).toBe(msg);
            expect(String(error)).toBe(error.name + ': ' + msg);
        });

        it('stringifies a thrown error properly', function () {
            var msg = 'test';
            var error;
            try {
                throw new RangeError(msg);
            } catch (e) {
                error = e;
            }
            expect(error.name).toBe('RangeError');
            expect(error.message).toBe(msg);
            expect(String(error)).toBe(error.name + ': ' + msg);
        });
    });

    describe('has properties that are not enummerable', function () {
        it('message', function () {
            expect(Error.prototype.propertyIsEnumerable('message')).toBe(false);
            var obj = new Error('test');
            expect(obj.propertyIsEnumerable('message')).toBe(false);
        });

        it('name', function () {
            expect(Error.prototype.propertyIsEnumerable('name')).toBe(false);
            var obj = new Error('test');
            expect(obj.propertyIsEnumerable('name')).toBe(false);
        });

        it('stack', function () {
            expect(Error.prototype.propertyIsEnumerable('stack')).toBe(false);
            var obj = new Error('test');
            expect(obj.propertyIsEnumerable('stack')).toBe(false);
        });

        it('stacktrace', function () {
            expect(Error.prototype.propertyIsEnumerable('stacktrace')).toBe(false);
            var obj = new Error('test');
            expect(obj.propertyIsEnumerable('stacktrace')).toBe(false);
        });
    });
});
