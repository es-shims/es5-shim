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

describe('Array.prototype.forEach ( callbackFn [ , thisArg ] )', function () {

    it('should be defined', function () {
        assert([]).should(respondTo, 'forEach');
    });

    it('should pass three arguments: the value of the element, the index of the element, and the Array object being traversed', function () {
        var testArray = [42];

        testArray.forEach(function (element, index, array) {
            assert(element).should(eql, 42);
            assert(index).should(eql, 0);
            assert(array).should(eql, testArray);
        });
    });

    it('should executes the provided function (callback) once for each element present in the array', function () {
        var testArray = [];

        [2, 3, 4].forEach(function (element, index, array) {
            testArray.push(element - 1);
        });

        assert(testArray).should(beSimilarTo, [1, 2, 3]);
    });
});

