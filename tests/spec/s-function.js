
describe('Function', function() {
	describe('bind', function() {
		var actual, expected,
			testSubject;
		
		testSubject = {
			push: function(o) {
				this.a.push(o);
			}
		};
		window.push = testSubject.push;
		
		func = function() {
			Array.prototype.forEach.call(arguments, function(a) {
				this.push(a);
			}, this);
			return this;
		};
		
		beforeEach(function() {
			actual = [];
			testSubject.a = [];
			window.a = [];
		});
		
		it('binds properly without a context', function() {
			testSubject.func = func.bind();
			testSubject.func(1,2,3);
			expect(window.a).toEqual([1,2,3]);
			expect(testSubject.a).toEqual([]);
			expect(actual).toEqual([]);
		});
		it('binds properly without a context, and still supplies bound arguments', function() {
			testSubject.func = func.bind(undefined, 1,2,3);
			testSubject.func(1,2,3);
			expect(window.a).toEqual([1,2,3,1,2,3]);
			expect(testSubject.a).toEqual([]);
			expect(actual).toEqual([]);
		});
		it('binds a context properly', function() {
			testSubject.func = func.bind(actual);
			testSubject.func(1,2,3);
			expect(actual).toEqual([1,2,3]);
			expect(testSubject.a).toEqual([]);
		});
		it('binds a context and supplies bound arguments', function() {
			testSubject.func = func.bind(actual, 1,2,3);
			testSubject.func(4,5,6);
			expect(actual).toEqual([1,2,3,4,5,6]);
			expect(testSubject.a).toEqual([]);
		});
		
		it('returns properly without binding a context', function() {
			testSubject.func = func.bind();
			actual = testSubject.func(1,2,3);
			expect(actual).toBe(window);
			expect(actual).not.toBe(testSubject);
		});
		it('returns properly without binding a context, and still supplies bound arguments', function() {
			testSubject.func = func.bind(undefined, 1,2,3);
			actual = testSubject.func(1,2,3);
			expect(actual).toBe(window);
			expect(actual).not.toBe(testSubject);
		});
		it('returns properly while binding a context properly', function() {
			var ret;
			testSubject.func = func.bind(actual);
			ret = testSubject.func(1,2,3);
			expect(ret).toBe(actual);
			expect(ret).not.toBe(testSubject);
		});
		it('returns properly while binding a context and supplies bound arguments', function() {
			var ret;
			testSubject.func = func.bind(actual, 1,2,3);
			ret = testSubject.func(4,5,6);
			expect(ret).toBe(actual);
			expect(ret).not.toBe(testSubject);
		});
		
		it('sets the toString to the original version', function() {
			expect(func.bind().toString()).toEqual(func.toString());
		});
	});
});
