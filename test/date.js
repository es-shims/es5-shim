describe('Date.prototype.toISOString', function () {

    it('should support extended years', function () {

        assert(new Date(-62198755200000).toISOString().indexOf('-000001-01-01')).should(eql, 0);
        assert(new Date(8.64e15).toISOString().indexOf('+275760-09-13')).should(eql, 0);

    });

});

describe('Date.parse', function () {

    it('should support extended years', function () {

        assert(Date.parse('0001-01-01T00:00:00Z')).should(eql, -62135596800000);
        assert(Date.parse('+275760-09-13T00:00:00.000Z')).should(eql, 8.64e15);
        assert(Date.parse('+033658-09-27T01:46:40.000Z')).should(eql, 1e15);
        assert(Date.parse('-000001-01-01T00:00:00Z')).should(eql, -62198755200000);
        assert(Date.parse('+002009-12-15T00:00:00Z')).should(eql, 1260835200000);

    });

});
