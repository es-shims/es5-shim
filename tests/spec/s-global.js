describe('global methods', function () {
    'use strict';

    describe('parseInt', function () {
        it('accepts a radix', function () {
            for (var i = 2; i <= 36; ++i) {
                expect(parseInt('10', i)).toBe(i);
            }
        });

        it('defaults the radix to 10', function () {
           [
               '01',
               '08',
               '10',
               '42'
           ].forEach(function (str) {
               expect(parseInt(str)).toBe(parseInt(str, 10));
           });
        });
    });
});

