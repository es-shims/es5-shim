describe('Array', function() {
	var testSubject;
	beforeEach(function() {
		testSubject = [2, 3, undefined, true, 'hej', null, false, 0];
		delete testSubject[1];
	});
	var createArrayLikeFromArray = function(arr) {
		var o = {};
		arr.forEach(function(e, i) {
			o[i]=e;
		});
		o.length = arr.length;
		return o;
	};
	
	describe('forEach', function() {
		"use strict";
		var expected, actual;
		
		beforeEach(function() {
			expected = {0:2, 2: undefined, 3:true, 4: 'hej', 5:null, 6:false, 7:0 };
			actual = {};
		});
		it('should iterate all', function() {
			testSubject.forEach(function(obj, index) {
				actual[index] = obj;
			});
			expect(actual).toExactlyMatch(expected);
		});
		it('should iterate all using a context', function() {
			o = { a: actual };
	
			testSubject.forEach(function(obj, index) {
				this.a[index] = obj;
			}, o);
			expect(actual).toExactlyMatch(expected);
		});
		
		it('should iterate all in an array-like object', function() {
			var ts = createArrayLikeFromArray(testSubject);
			Array.prototype.forEach.call(ts, function(obj, index) {
				actual[index] = obj;
			});
			expect(actual).toExactlyMatch(expected);
		});
		it('should iterate all in an array-like object using a context', function() {
			var ts = createArrayLikeFromArray(testSubject);
			o = { a: actual };
			
			Array.prototype.forEach.call(ts, function(obj, index) {
				this.a[index] = obj;
			}, o);
			expect(actual).toExactlyMatch(expected);
		});
	});
	describe('some', function() {
		var actual, expected, numberOfRuns;
		
		beforeEach(function() {
			expected = {0:2, 2: undefined, 3:true };
			actual = {};
			numberOfRuns = 0;
		});
		
		it('should return false if it runs to the end', function() {
			actual = testSubject.some(function() {});
			expect(actual).toBeFalsy();
		});
		it('should return true if it is stopped somewhere', function() {
			actual = testSubject.some(function() { return true; });
			expect(actual).toBeTruthy();
		});
		it('should return false if there are no elements', function() {
			actual = [].some(function() { return true; });
			expect(actual).toBeFalsy();
		});
	
		it('should stop after 3 elements', function() {
			testSubject.some(function(obj, index) {
				actual[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return true;
				}
				return false;
			});
			expect(actual).toExactlyMatch(expected);
		});
		it('should stop after 3 elements using a context', function() {
			var o = { a: actual };
			testSubject.some(function(obj, index) {
				this.a[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return true;
				}
				return false;
			}, o);
			expect(actual).toExactlyMatch(expected);
		});
	
		it('should stop after 3 elements in an array-like object', function() {
			var ts = createArrayLikeFromArray(testSubject);
			Array.prototype.some.call(ts, function(obj, index) {
				actual[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return true;
				}
				return false;
			});
			expect(actual).toExactlyMatch(expected);
		});
		it('should stop after 3 elements in an array-like object using a context', function() {
			var ts = createArrayLikeFromArray(testSubject);
			var o = { a: actual };
			Array.prototype.some.call(ts, function(obj, index) {
				this.a[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return true;
				}
				return false;
			}, o);
			expect(actual).toExactlyMatch(expected);
		});
	});
	describe('every', function() {
		var actual, expected, numberOfRuns;
		
		beforeEach(function() {
			expected = {0:2, 2: undefined, 3:true };
			actual = {};
			numberOfRuns = 0;
		});
		
		it('should return true if the array is empty', function() {
			actual = [].every(function() { return true; });
			expect(actual).toBeTruthy();
			
			actual = [].every(function() { return false; });
			expect(actual).toBeTruthy();
		});
		it('should return true if it runs to the end', function() {
			actual = [1,2,3].every(function() { return true; });
			expect(actual).toBeTruthy();
		});
		it('should return false if it is stopped before the end', function() {
			actual = [1,2,3].every(function() { return false; });
			expect(actual).toBeFalsy();
		});
		
		it('should return after 3 elements', function() {
			testSubject.every(function(obj, index) {
				actual[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return false;
				}
				return true;
			});
			expect(actual).toExactlyMatch(expected);
		});
		it('should stop after 3 elements using a context', function() {
			var o = { a: actual };
			testSubject.every(function(obj, index) {
				this.a[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return false;
				}
				return true;
			}, o);
			expect(actual).toExactlyMatch(expected);
		});
	
		it('should stop after 3 elements in an array-like object', function() {
			var ts = createArrayLikeFromArray(testSubject);
			Array.prototype.every.call(ts, function(obj, index) {
				actual[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return false;
				}
				return true;
			});
			expect(actual).toExactlyMatch(expected);
		});
		it('should stop after 3 elements in an array-like object using a context', function() {
			var ts = createArrayLikeFromArray(testSubject);
			var o = { a: actual };
			Array.prototype.every.call(ts, function(obj, index) {
				this.a[index] = obj;
				numberOfRuns += 1;
				if(numberOfRuns == 3) {
					return false;
				}
				return true;
			}, o);
			expect(actual).toExactlyMatch(expected);
		});
	});
	
	describe('indexOf', function() {
		"use strict";
		var actual, expected, testSubject;
		
		beforeEach(function() {
			testSubject = [2, 3, undefined, true, 'hej', null, 2, false, 0];
			delete testSubject[1];
	
		});
	
		it('should find the element', function() {
			expected = 4;
			actual = testSubject.indexOf('hej');
			expect(actual).toEqual(expected);
		});
		it('should not find the element', function() {
			expected = -1;
			actual = testSubject.indexOf('mus');
			expect(actual).toEqual(expected);
		});
		it('should find undefined as well', function() {
			expected = -1;
			actual = testSubject.indexOf(undefined);
			expect(actual).not.toEqual(expected);
		});
		it('should skip unset indexes', function() {
			expected = 2;
			actual = testSubject.indexOf(undefined);
			expect(actual).toEqual(expected);
		});
		it('should use a strict test', function() {
			actual = testSubject.indexOf(null);
			expect(actual).toEqual(5);
			
			actual = testSubject.indexOf('2');
			expect(actual).toEqual(-1);
		});
		it('should skip the first if fromIndex is set', function() {
			expect(testSubject.indexOf(2, 2)).toEqual(6);
			expect(testSubject.indexOf(2, 0)).toEqual(0);
			expect(testSubject.indexOf(2, 6)).toEqual(6);
		});
		it('should work with negative fromIndex', function() {
			expect(testSubject.indexOf(2, -3)).toEqual(6);
			expect(testSubject.indexOf(2, -9)).toEqual(0);
		});
		it('should work with fromIndex being greater than the length', function() {
			expect(testSubject.indexOf('hej', 20)).toEqual(-1);
		});
		it('should work with fromIndex being negative and greater than the length', function() {
			expect(testSubject.indexOf('hej', -20)).toEqual(4);
		});
		
		describe('Array-like', function ArrayLike() {
			var indexOf = Array.prototype.indexOf,
				testAL;
			beforeEach(function beforeEach() {
				testAL = {};
				testSubject.forEach(function (o,i) {
					testAL[i] = o;
				});
				testAL.length = testSubject.length;
			});
			it('should find the element (array-like)', function() {
				expected = 4;
				actual = indexOf.call(testAL, 'hej');
				expect(actual).toEqual(expected);
			});
			it('should not find the element (array-like)', function() {
				expected = -1;
				actual = indexOf.call(testAL, 'mus');
				expect(actual).toEqual(expected);
			});
			it('should find undefined as well (array-like)', function() {
				expected = -1;
				actual = indexOf.call(testAL, undefined);
				expect(actual).not.toEqual(expected);
			});
			it('should skip unset indexes (array-like)', function() {
				expected = 2;
				actual = indexOf.call(testAL, undefined);
				expect(actual).toEqual(expected);
			});
			it('should use a strict test (array-like)', function() {
				actual = Array.prototype.indexOf.call(testAL, null);
				expect(actual).toEqual(5);
				
				actual = Array.prototype.indexOf.call(testAL, '2');
				expect(actual).toEqual(-1);
			});
			it('should skip the first if fromIndex is set (array-like)', function() {
				expect(indexOf.call(testAL, 2, 2)).toEqual(6);
				expect(indexOf.call(testAL, 2, 0)).toEqual(0);
				expect(indexOf.call(testAL, 2, 6)).toEqual(6);
			});
			it('should work with negative fromIndex (array-like)', function() {
				expect(indexOf.call(testAL, 2, -3)).toEqual(6);
				expect(indexOf.call(testAL, 2, -9)).toEqual(0);
			});
			it('should work with fromIndex being greater than the length (array-like)', function() {
				expect(indexOf.call(testAL, 'hej', 20)).toEqual(-1);
			});
			it('should work with fromIndex being negative and greater than the length (array-like)', function() {
				expect(indexOf.call(testAL, 'hej', -20)).toEqual(4);
			});
		});
	});
	describe('lastIndexOf', function() {
		"use strict";
		var actual, expected, testSubject, testAL;
		
		beforeEach(function() {
			testSubject = [2, 3, undefined, true, 'hej', null, 2, 3, false, 0];
			delete testSubject[1];
			delete testSubject[7];
		});
		describe('Array', function() {
			it('should find the element', function() {
				expected = 4;
				actual = testSubject.lastIndexOf('hej');
				expect(actual).toEqual(expected);
			});
			it('should not find the element', function() {
				expected = -1;
				actual = testSubject.lastIndexOf('mus');
				expect(actual).toEqual(expected);
			});
			it('should find undefined as well', function() {
				expected = -1;
				actual = testSubject.lastIndexOf(undefined);
				expect(actual).not.toEqual(expected);
			});
			it('should skip unset indexes', function() {
				expected = 2;
				actual = testSubject.lastIndexOf(undefined);
				expect(actual).toEqual(expected);
			});
			it('should use a strict test', function() {
				actual = testSubject.lastIndexOf(null);
				expect(actual).toEqual(5);
				
				actual = testSubject.lastIndexOf('2');
				expect(actual).toEqual(-1);
			});
			it('should skip the first if fromIndex is set', function() {
				expect(testSubject.lastIndexOf(2, 2)).toEqual(0);
				expect(testSubject.lastIndexOf(2, 0)).toEqual(0);
				expect(testSubject.lastIndexOf(2, 6)).toEqual(6);
			});
			it('should work with negative fromIndex', function() {
				expect(testSubject.lastIndexOf(2, -3)).toEqual(6);
				expect(testSubject.lastIndexOf(2, -9)).toEqual(0);
			});
			it('should work with fromIndex being greater than the length', function() {
				expect(testSubject.lastIndexOf(2, 20)).toEqual(6);
			});
			it('should work with fromIndex being negative and greater than the length', function() {
				expect(testSubject.lastIndexOf(2, -20)).toEqual(-1);
			});
		});
	
		describe('Array like', function() {
			var lastIndexOf = Array.prototype.lastIndexOf,
				testAL;
			beforeEach(function() {
				testAL = {};
				testSubject.forEach(function (o,i) {
					testAL[i] = o;
				});
				testAL.length = testSubject.length;
			});
			it('should find the element (array-like)', function() {
				expected = 4;
				actual = lastIndexOf.call(testAL, 'hej');
				expect(actual).toEqual(expected);
			});
			it('should not find the element (array-like)', function() {
				expected = -1;
				actual = lastIndexOf.call(testAL, 'mus');
				expect(actual).toEqual(expected);
			});
			it('should find undefined as well (array-like)', function() {
				expected = -1;
				actual = lastIndexOf.call(testAL, undefined);
				expect(actual).not.toEqual(expected);
			});
			it('should skip unset indexes (array-like)', function() {
				expected = 2;
				actual = lastIndexOf.call(testAL, undefined);
				expect(actual).toEqual(expected);
			});
			it('should use a strict test (array-like)', function() {
				actual = lastIndexOf.call(testAL, null);
				expect(actual).toEqual(5);
				
				actual = lastIndexOf.call(testAL, '2');
				expect(actual).toEqual(-1);
			});
			it('should skip the first if fromIndex is set', function() {
				expect(lastIndexOf.call(testAL, 2, 2)).toEqual(0);
				expect(lastIndexOf.call(testAL, 2, 0)).toEqual(0);
				expect(lastIndexOf.call(testAL, 2, 6)).toEqual(6);
			});
			it('should work with negative fromIndex', function() {
				expect(lastIndexOf.call(testAL, 2, -3)).toEqual(6);
				expect(lastIndexOf.call(testAL, 2, -9)).toEqual(0);
			});
			it('should work with fromIndex being greater than the length', function() {
				expect(lastIndexOf.call(testAL, 2, 20)).toEqual(6);
			});
			it('should work with fromIndex being negative and greater than the length', function() {
				expect(lastIndexOf.call(testAL, 2, -20)).toEqual(-1);
			});
		});
	});
});