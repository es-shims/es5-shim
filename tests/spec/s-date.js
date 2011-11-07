describe('Date', function () {
    
    describe('now', function () {
        it('should be the current time', function () {
            expect(Date.now() === new Date().getTime()).toBe(true);
        });
    });

    describe("parse", function () {
        // TODO: Write this test.
    });

});