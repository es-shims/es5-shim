describe('String.prototype.trim ( )', function () {

    it('should be defined', function () {
        assert('Some text').should(respondTo, 'trim');
    });

    it('should remove whitespace from both ends of the string', function () {

        var strings = ['Some text', '  Some text', 'Some text  ', '  Some text  '];

        for (var i = 0; i < strings.length; ++i) {
            assert(strings[i].trim()).should(eql, 'Some text');
        }
    });
});
