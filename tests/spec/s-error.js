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
            };
            expect(error.name).toBe('RangeError');
            expect(error.message).toBe(msg);
            expect(String(error)).toBe(error.name + ': ' + msg);
        });
    });
});
