describe('String#trim', function () {

    it('should be defined', function () {
        assert('Some text').should(respondTo, 'trim');
    });

    it('should remove spaces at end and start of string', function () {

        var strings = ['Some text', '  Some text', 'Some text  ', '  Some text  '];

        for (var i = 0; i < strings.length; i += 1) {
            assert(strings[0].trim()).should(eql, 'Some text');
        }
    });
});
