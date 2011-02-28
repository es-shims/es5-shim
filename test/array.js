describe('Array.isArray ( arg )', function () {

    it('should be defined', function () {
        assert(Array).should(respondTo, 'isArray');
    });

    it('should return true if argument is an object whose class internal prperty is "Array"', function () {

        assert(Array.isArray([])).should(be);
        assert(Array.isArray([1, 2, 3])).should(be);

        assert(Array.isArray('')).shouldNot(be);
        assert(Array.isArray(1)).shouldNot(be);
        assert(Array.isArray(true)).shouldNot(be);
        assert(Array.isArray(false)).shouldNot(be);
    });
});

