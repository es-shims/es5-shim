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

describe('Array.prototype.map ( callbackFn [ , thisArg ] )', function () {

    it('should be defined', function () {
        assert([]).should(respondTo, 'map');
    });

    it('should pass three arguments: the value of the element, the index of the element, and the Array object being traversed', function () {
        var testArray = [42];

        testArray.map(function (element, index, array) {
            assert(element).should(eql, 42);
            assert(index).should(eql, 0);
            assert(array).should(eql, testArray);
        });
    });

    it('should create a new array with the results of calling a provided function on every element in this array', function () {

        var testArray = [2, 3, 4].map(function (element, index, array) {
            return element - 1;
        });

        assert(testArray).should(beSimilarTo, [1, 2, 3]);
    });
});

describe('Array.prototype.filter ( callbackFn [ , thisArg ] )', function () {

    it('should be defined', function () {
        assert([]).should(respondTo, 'filter');
    });

    it('should pass three arguments: the value of the element, the index of the element, and the Array object being traversed', function () {
        var testArray = [42];

        testArray.filter(function (element, index, array) {
            assert(element).should(eql, 42);
            assert(index).should(eql, 0);
            assert(array).should(eql, testArray);
        });
    });

    it('should create a new array with all elements that pass the test implemented by the provided function', function () {

        var testArray = [2, 3, 4].filter(function (element, index, array) {
            return element > 3;
        });

        assert(testArray).should(beSimilarTo, [4]);
    });
});

describe('Array.prototype.every ( callbackFn [ , thisArg ] )', function () {

    it('should be defined', function () {
        assert([]).should(respondTo, 'every');
    });

    it('should pass three arguments: the value of the element, the index of the element, and the Array object being traversed', function () {
        var testArray = [42];

        testArray.every(function (element, index, array) {
            assert(element).should(eql, 42);
            assert(index).should(eql, 0);
            assert(array).should(eql, testArray);
        });
    });

    it('should tests whether all elements in the array pass the test implemented by the provided function', function () {

        var bigThanFive = function (element) {
            return element > 5;
        };

        assert(
            [6, 7, 8, 9].every(bigThanFive)

        ).should(be);

        assert(
            [3, 4, 5, 6].every(bigThanFive)

        ).shouldNot(be);
    });
});

describe('Array.prototype.some ( callbackFn [ , thisArg ] )', function () {

    it('should be defined', function () {
        assert([]).should(respondTo, 'some');
    });

    it('should pass three arguments: the value of the element, the index of the element, and the Array object being traversed', function () {
        var testArray = [42];

        testArray.some(function (element, index, array) {
            assert(element).should(eql, 42);
            assert(index).should(eql, 0);
            assert(array).should(eql, testArray);
        });
    });

    it('should return true if some element in the array passes the test implemented by the provided function', function () {

        var bigThanFive = function (element) {
            return element > 5;
        };

        assert(
            [1, 2, 3, 9].some(bigThanFive)

        ).should(be);

        assert(
            [1, 2, 3, 4].some(bigThanFive)

        ).shouldNot(be);
    });
});

describe('Array.prototype.reduce ( callbackFn [ , initialValue ] )', function () {

    it('should be defined', function () {
        assert([]).should(respondTo, 'reduce');
    });

    it('should pass four arguments: the previous value (or value from the previous call to callbackFn), the current value, the current index, and the Array object being traversed', function () {
        var loopCount = 1,
            testArray = [41, 42];

        testArray.reduce(function (prevElement, element, index, array) {

            if (loopCount === 1) {
                assert(prevElement).should(eql, 41)
                assert(element).should(eql, 42);
                assert(index).should(eql, 1);
                assert(array).should(eql, testArray);
            }

            loopCount += 1;
        });

        assert(loopCount).should(eql, 2);
    });

    it('should set default value to 0', function () {

        [42].reduce(function (prevValue) {
            assert(prevValue).should(eql, 0);
        });
    });

    it('should accept default value', function () {

        [42].reduce(function (prevValue) {
            assert(prevValue).should(eql, 24);
        }, 24);
    });

    it('should apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value', function () {

        var testArray = [0, 1, 2, 3].reduce(function (prevElement, element) {
            return prevElement + element;
        });

        assert(testArray).should(eql, 6);
    });
});

