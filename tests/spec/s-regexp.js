/* global describe, it, expect */

describe('RegExp', function () {
    'use strict';

    describe('#toString()', function () {
        describe('literals', function () {
          it('should return correct flags and in correct order', function () {
              expect(/pattern/.toString()).toBe('/pattern/');
              expect(/pattern/i.toString()).toBe('/pattern/i');
              expect(/pattern/mi.toString()).toBe('/pattern/im');
              expect(/pattern/im.toString()).toBe('/pattern/im');
              expect(/pattern/mgi.toString()).toBe('/pattern/gim');
          });
        });
        describe('objects', function () {
          it('should return correct flags and in correct order', function () {
              expect(new RegExp('pattern').toString()).toBe('/pattern/');
              expect(new RegExp('pattern', 'i').toString()).toBe('/pattern/i');
              expect(new RegExp('pattern', 'mi').toString()).toBe('/pattern/im');
              expect(new RegExp('pattern', 'im').toString()).toBe('/pattern/im');
              expect(new RegExp('pattern', 'mgi').toString()).toBe('/pattern/gim');
          });
        });
    });
});
