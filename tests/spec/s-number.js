describe('Number', function () {
    'use strict';
    
    describe('toFixed', function () {
        it('should convert numbers correctly', function () {
            expect((0.9).toFixed(0) === '1');
            expect((1843654265.0774949).toFixed(5) === '1843654265.07749');
            expect((1.255).toFixed(2) === '1.25');
            expect((1000000000000000128).toFixed(0) === '1000000000000000128');
        });
    });

});
