/* global describe, it, xit, expect,beforeEach */

var global = Function('return this')();
var supportsDescriptors = Object.defineProperty && (function () {
    try {
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        for (var _ in obj) { return false; }
        return obj.x === obj;
    } catch (e) { /* this is ES3 */
        return false;
    }
}());
var ifSupportsDescriptors = supportsDescriptors ? it : xit;

/* Ported from JSON 3 Unit Test Suite | https://bestiejs.github.io/json3 */
describe('JSON', function () {
  var parse = function (text, reviver) {
    return function () {
      return JSON.parse(text, reviver);
    };
  };
  var stringify = function (value, replacer, space) {
    return function () {
      return JSON.stringify(value, replacer, space);
    };
  };
  // Ensures that `JSON.parse` throws an exception when parsing the given
  // `source` string.
  beforeEach(function () {
    this.addMatchers({
      toError: function (expected, message) {
        var pass = false;
        var exception;
        if (typeof this.actual !== 'function') {
          throw new Error('Actual is not a function');
        }
        if (typeof expected !== 'function' || !(expected() instanceof Error)) {
          throw new Error('Expected is not an Error constructor');
        }
        var msg = '';
        if (typeof message === 'string') {
          msg = message;
        }
        try {
          this.actual();
        } catch (e) {
          exception = e;
        }
        if (exception) {
          pass = exception instanceof expected;
        }
        if (!pass) {
          this.message = function () {
            return ['Expected' + (message ? ' "' + message + '"' : message) + ' to throw an instance of ' + expected() + ', but ' + (exception ? 'threw ' + exception : 'did not throw')];
          };
        }
        return pass;
      }
    });
  });
  // Tests
  // -----
  it('`parse`: Empty Source Strings', function () {
    expect(parse('')).toError(SyntaxError, 'Empty JSON source string');
    expect(parse('\n\n\r\n')).toError(SyntaxError, 'Source string containing only line terminators');
    expect(parse(' ')).toError(SyntaxError, 'Source string containing a single space character');
    expect(parse(' ')).toError(SyntaxError, 'Source string containing multiple space characters');
  });
  it('`parse`: Whitespace', function () {
    // The only valid JSON whitespace characters are tabs, spaces, and line
    // terminators. All other Unicode category `Z` (`Zs`, `Zl`, and `Zp`)
    // characters are invalid (note that the `Zs` category includes the
    // space character).
    var characters = [
        '{\u00a0}', // No-break space
        '{\u1680}', // Ogham space mark
        '{\u180e}', // Mongolian vowel separator
        '{\u2000}', // En quad
        '{\u2001}', // En quad
        '{\u2002}', // En quad
        '{\u2003}', // En quad
        '{\u2004}', // Three-per-em space
        '{\u2005}', // Four-per-em space
        '{\u2006}', // Six-per-em space
        '{\u2007}', // Figure space
        '{\u2008}', // Punctuation space
        '{\u2009}', // Thin space
        '{\u200a}', // Hair space
        '{\u202f}', // Narrow no-break space
        '{\u205f}', // Medium mathematical space
        '{\u3000}', // Ideographic space
        '{\u2028}', // Line separator
        '{\u2029}' // Paragraph separator
    ];
    characters.forEach(function (value) {
      expect(parse(value)).toError(SyntaxError, 'Source string containing an invalid Unicode whitespace character: ' + encodeURI(value.slice(1, -1)));
    });
    expect(parse('{\u000b}')).toError(SyntaxError, 'Source string containing a vertical tab');
    expect(parse('{\u000c}')).toError(SyntaxError, 'Source string containing a form feed');
    expect(parse('{\u0085}')).toError(SyntaxError, 'Source string containing a Next line');
    expect(parse('{\ufeff}')).toError(SyntaxError, 'Source string containing a byte-order mark');
    expect(parse('{\ufffe}')).toError(SyntaxError, 'Source string containing a non byte-order mark');
    expect(JSON.parse('{\r\n}')).toEqual({}, 'Source string containing a CRLF line ending');
    expect(JSON.parse('{\n\n\r\n}')).toEqual({}, 'Source string containing multiple line terminators');
    expect(JSON.parse('{\t}')).toEqual({}, 'Source string containing a tab character');
    expect(JSON.parse('{ }')).toEqual({}, 'Source string containing a space character');
  });
  it('`parse`: Octal Values', function () {
    // `08` and `018` are invalid octal values.
    var octal = ['00', '01', '02', '03', '04', '05', '06', '07', '010', '011', '08', '018'];
    octal.forEach(function (value) {
      expect(parse(value)).toError(SyntaxError, 'Octal literal: ' + value);
      expect(parse('-' + value)).toError(SyntaxError, 'Negative octal literal: -' + value);
      expect(parse('"\\' + value + '"')).toError(SyntaxError, 'Octal escape sequence in a string: "\\' + value + '"');
      expect(parse('"\\x' + value + '"')).toError(SyntaxError, 'Hex escape sequence in a string: "\\x' + value + '"');
    });
  });
  it('`parse`: Numeric Literals', function () {
    expect(JSON.parse('100')).toBe(100, 'Integer');
    expect(JSON.parse('-100')).toBe(-100, 'Negative integer');
    expect(JSON.parse('10.5')).toBe(10.5, 'Float');
    expect(JSON.parse('-3.141')).toBe(-3.141, 'Negative float');
    expect(JSON.parse('0.625')).toBe(0.625, 'Decimal');
    expect(JSON.parse('-0.03125')).toBe(-0.03125, 'Negative decimal');
    expect(JSON.parse('1e3')).toBe(1000, 'Exponential');
    expect(JSON.parse('1e+2')).toBe(100, 'Positive exponential');
    expect(JSON.parse('-1e-2')).toBe(-0.01, 'Negative exponential');
    expect(JSON.parse('0.03125e+5')).toBe(3125, 'Decimalized exponential');
    expect(JSON.parse('1E2')).toBe(100, 'Case-insensitive exponential delimiter');
    expect(parse('+1')).toError(SyntaxError, 'Leading `+`');
    expect(parse('1.')).toError(SyntaxError, 'Trailing decimal point');
    expect(parse('.1')).toError(SyntaxError, 'Leading decimal point');
    expect(parse('1e')).toError(SyntaxError, 'Missing exponent');
    expect(parse('1e-')).toError(SyntaxError, 'Missing signed exponent');
    expect(parse('--1')).toError(SyntaxError, 'Leading `--`');
    expect(parse('1-+')).toError(SyntaxError, 'Trailing `-+`');
    expect(parse('0xaf')).toError(SyntaxError, 'Hex literal');
    // The native `JSON.parse` implementation in IE 9 allows this syntax, but
    // the feature tests should detect the broken implementation.
    expect(parse('- 5')).toError(SyntaxError, 'Invalid negative sign');
  });
  it('`parse`: String Literals', function () {
    var expected = 48;
    var controlCharacters = [
      '\u0001',
      '\u0002',
      '\u0003',
      '\u0004',
      '\u0005',
      '\u0006',
      '\u0007',
      '\b',
      '\t',
      '\n',
      '\u000b',
      '\f',
      '\r',
      '\u000e',
      '\u000f',
      '\u0010',
      '\u0011',
      '\u0012',
      '\u0013',
      '\u0014',
      '\u0015',
      '\u0016',
      '\u0017',
      '\u0018',
      '\u0019',
      '\u001a',
      '\u001b',
      '\u001c',
      '\u001d',
      '\u001e',
      '\u001f'
    ];
    // Opera 7 discards null characters in strings.
    if ('\0'.length) {
      expected += 1;
      controlCharacters.push('\u0000');
    }
    expect(JSON.parse('"value"')).toBe('value', 'Double-quoted string literal');
    expect(JSON.parse('""')).toBe('', 'Empty string literal');
    expect(JSON.parse('"\\u2028"')).toBe('\u2028', 'String containing an escaped Unicode line separator');
    expect(JSON.parse('"\\u2029"')).toBe('\u2029', 'String containing an escaped Unicode paragraph separator');
    // ExtendScript doesn't handle surrogate pairs correctly; attempting to
    // parse `"\ud834\udf06"` will throw an uncatchable error (issue #29).
    expect(JSON.parse('"\ud834\udf06"')).toBe('\ud834\udf06', 'String containing an unescaped Unicode surrogate pair');
    expect(JSON.parse('"\\u0001"')).toBe('\u0001', 'String containing an escaped ASCII control character');
    expect(JSON.parse('"\\b"')).toBe('\b', 'String containing an escaped backspace');
    expect(JSON.parse('"\\f"')).toBe('\f', 'String containing an escaped form feed');
    expect(JSON.parse('"\\n"')).toBe('\n', 'String containing an escaped line feed');
    expect(JSON.parse('"\\r"')).toBe('\r', 'String containing an escaped carriage return');
    expect(JSON.parse('"\\t"')).toBe('\t', 'String containing an escaped tab');
    expect(JSON.parse('"hello\\/world"')).toBe('hello/world', 'String containing an escaped solidus');
    expect(JSON.parse('"hello\\\\world"')).toBe('hello\\world', 'String containing an escaped reverse solidus');
    expect(JSON.parse('"hello\\"world"')).toBe('hello"world', 'String containing an escaped double-quote character');
    expect(parse('\'hello\'')).toError(SyntaxError, 'Single-quoted string literal');
    expect(parse('"\\x61"')).toError(SyntaxError, 'String containing a hex escape sequence');
    expect(parse('"hello \r\n world"')).toError(SyntaxError, 'String containing an unescaped CRLF line ending');
    controlCharacters.forEach(function (value) {
      expect(parse('"' + value + '"')).toError(SyntaxError, 'String containing an unescaped ASCII control character: ' + encodeURI(value));
    });
  });
  it('`parse`: Array Literals', function () {
    expect(parse('[1, 2, 3,]')).toError(SyntaxError, 'Trailing comma in array literal');
    expect(JSON.parse('[1, 2, [3, [4, 5]], 6, [true, false], [null], [[]]]')).toEqual([1, 2, [3, [4, 5]], 6, [true, false], [null], [[]]], 'Nested arrays');
    expect(JSON.parse('[{}]')).toEqual([{}], 'Array containing empty object literal');
    var expected = [
      100,
      true,
      false,
      null,
      {
        a: ['hello'],
        b: ['world']
      },
      [0.01]
    ];
    expect(JSON.parse('[1e2, true, false, null, {"a": ["hello"], "b": ["world"]}, [1e-2]]')).toEqual(expected, 'Mixed array');
  });
  it('`parse`: Object Literals', function () {
    expect(JSON.parse('{"hello": "world"}')).toEqual({ hello: 'world' }, 'Object literal containing one member');
    expect(JSON.parse('{"hello": "world", "foo": ["bar", true], "fox": {"quick": true, "purple": false}}')).toEqual({
      hello: 'world',
      foo: ['bar', true],
      fox: {
        quick: true,
        purple: false
      }
    }, 'Object literal containing multiple members');
    expect(parse('{key: 1}')).toError(SyntaxError, 'Unquoted identifier used as a property name');
    expect(parse('{false: 1}')).toError(SyntaxError, '`false` used as a property name');
    expect(parse('{true: 1}')).toError(SyntaxError, '`true` used as a property name');
    expect(parse('{null: 1}')).toError(SyntaxError, '`null` used as a property name');
    expect(parse('{\'key\': 1}')).toError(SyntaxError, 'Single-quoted string used as a property name');
    expect(parse('{1: 2, 3: 4}')).toError(SyntaxError, 'Number used as a property name');
    expect(parse('{"hello": "world", "foo": "bar",}')).toError(SyntaxError, 'Trailing comma in object literal');
  });
  // JavaScript expressions should never be evaluated, as JSON 3 does not use
  // `eval`.
  it('`parse`: Invalid Expressions', function () {
    var expressions = [
      '1 + 1',
      '1 * 2',
      'var value = 123;',
      '{});value = 123;({}',
      'call()',
      '1, 2, 3, "value"'
    ];
    expressions.forEach(function (expression) {
      expect(parse(expression)).toError(SyntaxError, 'Source string containing a JavaScript expression');
    });
  });
  it('`stringify` and `parse`: Optional Arguments', function () {
    expect(JSON.parse('{"a": 1, "b": "10000"}', function (key, value) {
      return typeof value === 'string' ? parseInt(value, 2) : value;
    })).toEqual({
      a: 1,
      b: 16
    }, 'Callback function provided');
    expect(JSON.stringify({
      foo: 123,
      bar: 456
    }, ['bar'], 2)).toBe('{\n  "bar": 456\n}', 'Object; optional `filter` and `whitespace` arguments');
    // Test adapted from the Opera JSON test suite via Ken Snyder.
    // See http://testsuites.opera.com/JSON/correctness/scripts/045.js
    // The regular expression is necessary because the ExtendScript engine
    // only approximates pi to 14 decimal places (ES 3 and ES 5 approximate
    // pi to 15 places).
    expect(/^\{"PI":3\.\d{14,15}\}$/.test(JSON.stringify(Math, ['PI'])), 'List of non-enumerable property names specified as the `filter` argument').toBe(true);
    expect(JSON.parse('[1, 2, 3]', function (key, value) {
      if (typeof value === 'object' && value) {
        return value;
      }
    }).length, 'Issue #10: `walk` should not use `splice` when removing an array element').toBe(3);
  });
  it('`stringify`', function () {
    var expected = 30;
    // Special values.
    expect(JSON.stringify(null)).toBe('null', '`null` is represented literally');
    expect(JSON.stringify(1 / 0)).toBe('null', '`Infinity` is serialized as `null`');
    expect(JSON.stringify(0 / 0)).toBe('null', '`NaN` is serialized as `null`');
    expect(JSON.stringify(-1 / 0)).toBe('null', '`-Infinity` is serialized as `null`');
    expect(JSON.stringify(true)).toBe('true', 'Boolean primitives are represented literally');
    expect(JSON.stringify(Object(false))).toBe('false', 'Boolean objects are represented literally');
    expect(JSON.stringify(Object('\\"How\bquickly\tdaft\njumping\fzebras\rvex"'))).toBe('"\\\\\\"How\\bquickly\\tdaft\\njumping\\fzebras\\rvex\\""', 'All control characters in strings are escaped');
    expect(JSON.stringify([Object(false), Object(1), Object('Kit')])).toBe('[false,1,"Kit"]', 'Arrays are serialized recursively');
    expect(JSON.stringify([void 0])).toBe('[null]', '`[undefined]` is serialized as `[null]`');
    // Property enumeration is implementation-dependent.
    var value = {
      jdalton: ['John-David', 29],
      kitcambridge: ['Kit', 18],
      mathias: ['Mathias', 23]
    };
    var jsonStr = '{"jdalton":["John-David",29],"kitcambridge":["Kit",18],"mathias":["Mathias",23]}';
    expect(JSON.stringify(value)).toBe(jsonStr, 'Objects are serialized recursively');
    expect(JSON.parse(jsonStr)).toEqual(value, 'Objects are deserialized recursively');
    expect(JSON.parse(JSON.stringify(value))).toEqual(value, 'Objects are serialized/deserialized recursively');
    // Complex cyclic structures.
    value = {
      foo: {
        b: {
          foo: {
            c: {
              foo: null
            }
          }
        }
      }
    };
    expect(JSON.stringify(value)).toBe('{"foo":{"b":{"foo":{"c":{"foo":null}}}}}', 'Nested objects containing identically-named properties should serialize correctly');
    var S = [], N = {};
    S.push(N, N);
    expect(JSON.stringify(S)).toBe('[{},{}]', 'Objects containing duplicate references should not throw a `TypeError`');
    value.foo.b.foo.c.foo = value;
    expect(stringify(value)).toError(TypeError, 'Objects containing complex circular references should throw a `TypeError`');
    // Sparse arrays.
    value = [];
    value[5] = 1;
    expect(JSON.stringify(value)).toBe('[null,null,null,null,null,1]', 'Sparse arrays should serialize correctly');
    // Dates.
    expect(JSON.stringify(new Date(Date.UTC(1994, 6, 3)))).toBe('"1994-07-03T00:00:00.000Z"', 'Dates should be serialized according to the simplified date time string format');
    expect(JSON.stringify(new Date(Date.UTC(1993, 5, 2, 2, 10, 28, 224)))).toBe('"1993-06-02T02:10:28.224Z"', 'The date time string should conform to the format outlined in the spec');
    expect(JSON.stringify(new Date(-8.64e15))).toBe('"-271821-04-20T00:00:00.000Z"', 'The minimum valid date value should serialize correctly');
    expect(JSON.stringify(new Date(8.64e15))).toBe('"+275760-09-13T00:00:00.000Z"', 'The maximum valid date value should serialize correctly');
    expect(JSON.stringify(new Date(Date.UTC(10000, 0, 1)))).toBe('"+010000-01-01T00:00:00.000Z"', 'https://bugs.ecmascript.org/show_bug.cgi?id=119');
    value = new Date();
    value.toJSON = function () {
      return 'date';
    };
    expect(JSON.stringify(value)).toBe('"date"');
    // Tests based on research by @Yaffle. See kriskowal/es5-shim#111.
    expect(JSON.stringify(new Date(-1))).toBe('"1969-12-31T23:59:59.999Z"', 'Millisecond values < 1000 should be serialized correctly');
    expect(JSON.stringify(new Date(-621987552e5))).toBe('"-000001-01-01T00:00:00.000Z"', 'Years prior to 0 should be serialized as extended years');
    expect(JSON.stringify(new Date(2534023008e5))).toBe('"+010000-01-01T00:00:00.000Z"', 'Years after 9999 should be serialized as extended years');
    expect(JSON.stringify(new Date(-3509827334573292))).toBe('"-109252-01-01T10:37:06.708Z"', 'Issue #4: Opera > 9.64 should correctly serialize a date with a year of `-109252`');
    // Opera 7 normalizes dates with invalid time values to represent the
    // current date.
    value = new Date('Kit');
    if (!isFinite(value)) {
      expected += 1;
      expect(JSON.stringify(value)).toBe('null', 'Invalid dates should serialize as `null`');
    }
    // Additional arguments.
    expect(JSON.stringify([1, 2, 3, [4, 5]], null, '  ')).toBe('[\n  1,\n  2,\n  3,\n  [\n    4,\n    5\n  ]\n]', 'Nested arrays; optional `whitespace` argument');
    expect(JSON.stringify([], null, '  ')).toBe('[]', 'Empty array; optional string `whitespace` argument');
    expect(JSON.stringify({}, null, 2)).toBe('{}', 'Empty object; optional numeric `whitespace` argument');
    expect(JSON.stringify([1], null, 2)).toBe('[\n  1\n]', 'Single-element array; optional numeric `whitespace` argument');
    expect(JSON.stringify({
      foo: 123
    }, null, '  ')).toBe('{\n  "foo": 123\n}', 'Single-member object; optional string `whitespace` argument');
    expect(JSON.stringify({
      foo: {
        bar: [123]
      }
    }, null, 2)).toBe('{\n  "foo": {\n    "bar": [\n      123\n    ]\n  }\n}', 'Nested objects; optional numeric `whitespace` argument');
  });
  it('Does not have non-standard `toJSON` methods', function () {
    expect(Boolean.prototype.toJSON).toBe(undefined, 'Boolean.prototype.toJSON');
    expect(Number.prototype.toJSON).toBe(undefined, 'Number.prototype.toJSON');
    expect(String.prototype.toJSON).toBe(undefined, 'String.prototype.toJSON');
  });
  it('Has standard `Date#toJSON` method', function () {
    expect(typeof Date.prototype.toJSON).toBe('function', 'Date.prototype.toJSON');
  });
  ifSupportsDescriptors('Has `enumerable` property of `false`', function () {
    expect(global.propertyIsEnumerable('JSON')).toBe(false, 'JSON');
    expect(JSON.propertyIsEnumerable('parse')).toBe(false, 'JSON.parse');
    expect(JSON.propertyIsEnumerable('stringify')).toBe(false, 'JSON.stringify');
    expect(Date.prototype.propertyIsEnumerable('toJSON')).toBe(false, 'Date.prototype.toJSON');
  });

  /*
   * The following tests are adapted from the ECMAScript 5 Conformance Suite.
   * Copyright 2009, Microsoft Corporation. Distributed under the New BSD License.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   *   - Redistributions of source code must retain the above copyright notice,
   *     this list of conditions and the following disclaimer.
   *   - Redistributions in binary form must reproduce the above copyright notice,
   *     this list of conditions and the following disclaimer in the documentation
   *     and/or other materials provided with the distribution.
   *   - Neither the name of Microsoft nor the names of its contributors may be
   *     used to endorse or promote products derived from this software without
   *     specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
  */
  it('ECMAScript 5 Conformance', function () {
    var value = {
      a1: {
        b1: [1, 2, 3, 4],
        b2: {
          c1: 1,
          c2: 2
        }
      },
      a2: 'a2'
    };
    // Section 15.12.1.1: The JSON Grammar.
    // ------------------------------------
    // Tests 15.12.1.1-0-1 thru 15.12.1.1-0-8.
    expect(parse('12\t\r\n 34')).toError(SyntaxError, 'Valid whitespace characters may not separate two discrete tokens');
    expect(parse('\u000b1234')).toError(SyntaxError, 'The vertical tab is not a valid whitespace character');
    expect(parse('\u000c1234')).toError(SyntaxError, 'The form feed is not a valid whitespace character');
    expect(parse('\u00a01234')).toError(SyntaxError, 'The non-breaking space is not a valid whitespace character');
    expect(parse('\u200b1234')).toError(SyntaxError, 'The zero-width space is not a valid whitespace character');
    expect(parse('\ufeff1234')).toError(SyntaxError, 'The byte order mark (zero-width non-breaking space) is not a valid whitespace character');
    expect(parse('\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u30001234')).toError(SyntaxError, 'Other Unicode category `Z` characters are not valid whitespace characters');
    expect(parse('\u2028\u20291234')).toError(SyntaxError, 'The line (U+2028) and paragraph (U+2029) separators are not valid whitespace characters');
    // Test 15.12.1.1-0-9.
    expect(JSON.parse('\t\r \n{\t\r \n"property"\t\r \n:\t\r \n{\t\r \n}\t\r \n,\t\r \n"prop2"\t\r \n:\t\r \n[\t\r \ntrue\t\r \n,\t\r \nnull\t\r \n,123.456\t\r \n]\t\r \n}\t\r \n')).toEqual({
      property: {},
      prop2: [true, null, 123.456]
    }, 'Valid whitespace characters may precede and follow all tokens');
    // Tests 15.12.1.1-g1-1 thru 15.12.1.1-g1-4.
    expect(JSON.parse('\t1234')).toBe(1234, 'Leading tab characters should be ignored');
    expect(parse('12\t34')).toError(SyntaxError, 'A tab character may not separate two disparate tokens');
    expect(JSON.parse('\r1234')).toBe(1234, 'Leading carriage returns should be ignored');
    expect(parse('12\r34')).toError(SyntaxError, 'A carriage return may not separate two disparate tokens');
    expect(JSON.parse('\n1234')).toBe(1234, 'Leading line feeds should be ignored');
    expect(parse('12\n34')).toError(SyntaxError, 'A line feed may not separate two disparate tokens');
    expect(JSON.parse(' 1234')).toBe(1234, 'Leading space characters should be ignored');
    expect(parse('12 34')).toError(SyntaxError, 'A space character may not separate two disparate tokens');
    // Tests 15.12.1.1-g2-1 thru 15.12.1.1-g2-5.
    expect(JSON.parse('"abc"')).toBe('abc', 'Strings must be enclosed in double quotes');
    expect(parse('\'abc\'')).toError(SyntaxError, 'Single-quoted strings are not permitted');
    // Note: the original test 15.12.1.1-g2-3 (`"\u0022abc\u0022"`) is incorrect,
    // as the JavaScript interpreter will always convert `\u0022` to `"`.
    expect(parse('\\u0022abc\\u0022')).toError(SyntaxError, 'Unicode-escaped double quote delimiters are not permitted');
    expect(parse('"abc\'')).toError(SyntaxError, 'Strings must terminate with a double quote character');
    expect(JSON.parse('""')).toBe('', 'Strings may be empty');
    // Tests 15.12.1.1-g4-1 thru 15.12.1.1-g4-4.
    expect(parse('"\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007"')).toError(SyntaxError, 'Unescaped control characters in the range [U+0000, U+0007] are not permitted within strings');
    expect(parse('"\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f"')).toError(SyntaxError, 'Unescaped control characters in the range [U+0008, U+000F] are not permitted within strings');
    expect(parse('"\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017"')).toError(SyntaxError, 'Unescaped control characters in the range [U+0010, U+0017] are not permitted within strings');
    expect(parse('"\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f"')).toError(SyntaxError, 'Unescaped control characters in the range [U+0018, U+001F] are not permitted within strings');
    // Tests 15.12.1.1-g5-1 thru 15.12.1.1-g5-3.
    expect(JSON.parse('"\\u0058"')).toBe('X', 'Unicode escape sequences are permitted within strings');
    expect(parse('"\\u005"')).toError(SyntaxError, 'Unicode escape sequences may not comprise fewer than four hexdigits');
    expect(parse('"\\u0X50"')).toError(SyntaxError, 'Unicode escape sequences may not contain non-hex characters');
    // Tests 15.12.1.1-g6-1 thru 15.12.1.1-g6-7.
    expect(JSON.parse('"\\/"')).toBe('/', 'Escaped solidus');
    expect(JSON.parse('"\\\\"')).toBe('\\', 'Escaped reverse solidus');
    expect(JSON.parse('"\\b"')).toBe('\b', 'Escaped backspace');
    expect(JSON.parse('"\\f"')).toBe('\f', 'Escaped form feed');
    expect(JSON.parse('"\\n"')).toBe('\n', 'Escaped line feed');
    expect(JSON.parse('"\\r"')).toBe('\r', 'Escaped carriage return');
    expect(JSON.parse('"\\t"')).toBe('\t', 'Escaped tab');

    // Section 15.12.3: `JSON.stringify()`.
    // ------------------------------------
    // Test 15.12.3-11-1 thru 5.12.3-11-15.
    expect(JSON.stringify(void 0)).toBe(void 0, '`JSON.stringify(undefined)` should return `undefined`');
    expect(JSON.stringify(void 0, function () {
      return 'replacement';
    })).toBe('"replacement"', 'The `JSON.stringify` callback function can be called on a top-level `undefined` value');
    expect(JSON.stringify('a string')).toBe('"a string"', '`JSON.stringify` should serialize top-level string primitives');
    expect(JSON.stringify(123)).toBe('123', '`JSON.stringify` should serialize top-level number primitives');
    expect(JSON.stringify(true)).toBe('true', '`JSON.stringify` should serialize top-level Boolean primitives');
    expect(JSON.stringify(null)).toBe('null', '`JSON.stringify` should serialize top-level `null` values');
    expect(JSON.stringify(Object(42))).toBe('42', '`JSON.stringify` should serialize top-level number objects');
    expect(JSON.stringify(Object('wrapped'))).toBe('"wrapped"', '`JSON.stringify` should serialize top-level string objects');
    expect(JSON.stringify(Object(false))).toBe('false', '`JSON.stringify` should serialize top-level Boolean objects');
    expect(JSON.stringify(42, function () {
      return void 0;
    })).toBe(void 0, 'The `JSON.stringify` callback function may return `undefined` when called on a top-level number primitive');
    expect(JSON.stringify({
      prop: 1
    }, function () {
      return void 0;
    })).toBe(void 0, 'The `JSON.stringify` callback function may return `undefined` when called on a top-level object');
    expect(JSON.stringify(42, function (key, value) {
      return value === 42 ? [4, 2] : value;
    })).toBe('[4,2]', 'The `JSON.stringify` callback function may return an array when called on a top-level number primitive');
    expect(JSON.stringify(42, function (key, value) {
      return value === 42 ? {
        forty: 2
      } : value;
    })).toBe('{"forty":2}', 'The `JSON.stringify` callback function may return an object literal when called on a top-level number primitive');
    expect(JSON.stringify(function () {})).toBe(void 0, '`JSON.stringify` should return `undefined` when called on a top-level function');
    expect(JSON.stringify(function () {}, function () {
      return 99;
    })).toBe('99', 'The `JSON.stringify` callback function may return a number primitive when called on a top-level function');
    // Test 15.12.3-4-1.
    expect(JSON.stringify([42], {})).toBe('[42]', '`JSON.stringify` should ignore `filter` arguments that are not functions or arrays');
    // Test 15.12.3-5-a-i-1 and 15.12.3-5-b-i-1.
    expect(JSON.stringify(value, null, 5)).toBe(JSON.stringify(value, null, Object(5)), 'Optional `width` argument: Number object and primitive width values should produce identical results');
    expect(JSON.stringify(value, null, 'xxx')).toBe(JSON.stringify(value, null, Object('xxx')), 'Optional `width` argument: String object and primitive width values should produce identical results');
    // Test 15.12.3-6-a-1 and 15.12.3-6-a-2.
    expect(JSON.stringify(value, null, 100)).toBe(JSON.stringify(value, null, 10), 'Optional `width` argument: The maximum numeric width value should be 10');
    expect(JSON.stringify(value, null, 5.99999)).toBe(JSON.stringify(value, null, 5), 'Optional `width` argument: Numeric values should be converted to integers');
    // Test 15.12.3-6-b-1 and 15.12.3-6-b-4.
    expect(JSON.stringify(value, null, 0.999999)).toBe(JSON.stringify(value), 'Optional `width` argument: Numeric width values between 0 and 1 should be ignored');
    expect(JSON.stringify(value, null, 0)).toBe(JSON.stringify(value), 'Optional `width` argument: Zero should be ignored');
    expect(JSON.stringify(value, null, -5)).toBe(JSON.stringify(value), 'Optional `width` argument: Negative numeric values should be ignored');
    expect(JSON.stringify(value, null, 5)).toBe(JSON.stringify(value, null, '     '), 'Optional `width` argument: Numeric width values in the range [1, 10] should produce identical results to that of string values containing `width` spaces');
    // Test 15.12.3-7-a-1.
    expect(JSON.stringify(value, null, '0123456789xxxxxxxxx')).toBe(JSON.stringify(value, null, '0123456789'), 'Optional `width` argument: String width values longer than 10 characters should be truncated');
    // Test 15.12.3-8-a-1 thru 15.12.3-8-a-5.
    expect(JSON.stringify(value, null, '')).toBe(JSON.stringify(value), 'Empty string `width` arguments should be ignored');
    expect(JSON.stringify(value, null, true)).toBe(JSON.stringify(value), 'Boolean primitive `width` arguments should be ignored');
    expect(JSON.stringify(value, null, null)).toBe(JSON.stringify(value), '`null` `width` arguments should be ignored');
    expect(JSON.stringify(value, null, Object(false))).toBe(JSON.stringify(value), 'Boolean object `width` arguments should be ignored');
    expect(JSON.stringify(value, null, value)).toBe(JSON.stringify(value), 'Object literal `width` arguments should be ignored');
    // Test 15.12.3@2-2-b-i-1.
    expect(JSON.stringify([
      {
        prop: 42,
        toJSON: function () {
          return 'fortytwo objects';
        }
      }
    ])).toBe('["fortytwo objects"]', 'An object literal with a custom `toJSON` method nested within an array may return a string primitive for serialization');
    // Test 15.12.3@2-2-b-i-2.
    expect(JSON.stringify([
      {
        prop: 42,
        toJSON: function () {
          return Object(42);
        }
      }
    ])).toBe('[42]', 'An object literal with a custom `toJSON` method nested within an array may return a number object for serialization');
    // Test 15.12.3@2-2-b-i-3.
    expect(JSON.stringify([
      {
        prop: 42,
        toJSON: function () {
          return Object(true);
        }
      }
    ])).toBe('[true]', 'An object literal with a custom `toJSON` method nested within an array may return a Boolean object for serialization');
    // Test 15.12.3@2-3-a-1.
    expect(JSON.stringify([42], function (key, value) {
      return value === 42 ? Object('fortytwo') : value;
    })).toBe('["fortytwo"]', 'The `JSON.stringify` callback function may return a string object when called on an array');
    // Test 15.12.3@2-3-a-2.
    expect(JSON.stringify([42], function (key, value) {
      return value === 42 ? Object(84) : value;
    })).toBe('[84]', 'The `JSON.stringify` callback function may return a number object when called on an array');
    // Test 15.12.3@2-3-a-3.
    expect(JSON.stringify([42], function (key, value) {
      return value === 42 ? Object(false) : value;
    })).toBe('[false]', 'The `JSON.stringify` callback function may return a Boolean object when called on an array');
    // Test 15.12.3@4-1-2. 15.12.3@4-1-1 only tests whether an exception is
    // thrown; the type of the exception is not checked.
    value = {};
    value.prop = value;
    expect(stringify(value)).toError(TypeError, 'An object containing a circular reference should throw a `TypeError`');
    // Test 15.12.3@4-1-3, modified to ensure that a `TypeError` is thrown.
    value = {
      p1: {
        p2: {}
      }
    };
    value.p1.p2.prop = value;
    expect(stringify(value)).toError(TypeError, 'A nested cyclic structure should throw a `TypeError`');
  });
});
