describe('Object', function () {
    "use strict";

    describe("Object.keys", function () {
        var obj = {
            "str": "boz",
            "obj": { },
            "arr": [],
            "bool": true,
            "num": 42,
            "null": null,
            "undefined": undefined
        };

        var loopedValues = [];
        for (var k in obj) {
            loopedValues.push(k);
        }

        var keys = Object.keys(obj);
        it('should have correct length', function () {
            expect(keys.length).toBe(7);    
        });

        it('should return an Array', function () {
            expect(Array.isArray(keys)).toBe(true);    
        });
        
        it('should return names which are own properties', function () {
            keys.forEach(function (name) {
                expect(obj.hasOwnProperty(name)).toBe(true);
            });    
        });

        it('should return names which are enumerable', function () {
            keys.forEach(function (name) {
                expect(loopedValues.indexOf(name)).toNotBe(-1);
            }) 
        });
        
        it('should throw error for non object', function () {
            var e = {};
            expect(function () {
                try {
                    Object.keys(42)
                } catch (err) {
                    throw e;
                }
            }).toThrow(e);
        });
    });

    describe("Object.getOwnPropertyDescriptor", function () {
        function get() { return 42; }
        function set(v) { this.val = v; }

        var obj = {};
        Object.defineProperty(obj, "normal", {
           value: "normal"
        });
        Object.defineProperty(obj, "flags", {
           value: "flags",
           enumerable: true,
           writable: true,
           configurable: true
        });
        try {
            Object.defineProperty(obj, "get", {
               get: get
            });
            Object.defineProperty(obj, "set", {
               set: set
            });    
        } catch (e) {
            if (!e.message === "getters & setters can not be defined on this javascript engine") throw e;
        }
        

        it('should return a property descriptor', function () {
            var pd = Object.getOwnPropertyDescriptor(obj, "normal");
            expect(pd.value).toBe("normal");
            expect(pd.enumerable).toBe(false);
            expect(pd.writable).toBe(false);
            expect(pd.configurable).toBe(false);
        });

        it("should return true for flags", function () {
            var pd = Object.getOwnPropertyDescriptor(obj, "flags");
            expect(pd.value).toBe("flags");
            expect(pd.enumerable).toBe(true);
            expect(pd.writable).toBe(true);
            expect(pd.configurable).toBe(true);
        });

        it("should return a getter", function () {
            var pd = Object.getOwnPropertyDescriptor(obj, "get");
            expect(pd.value).toBe(undefined);
            expect(pd.get).toBe(get);
            expect(pd.set).toBe(undefined);
            expect(pd.enumerable).toBe(false);
            expect(pd.writable).toBe(undefined);
            expect(pd.configurable).toBe(false);
        });

        it("should return a setter", function (){
            var pd = Object.getOwnPropertyDescriptor(obj, "set");
            expect(pd.value).toBe(undefined);
            expect(pd.get).toBe(undefined);
            expect(pd.set).toBe(set);
            expect(pd.writable).toBe(undefined);
            expect(pd.configurable).toBe(false);
            expect(pd.enumerable).toBe(false);
        })
    });
 
});