const { assert } = require('chai')
const commands = require('../commands')

describe('Array', function () {
  describe('functions', function () {
    describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
        assert.equal([1, 2, 3].indexOf(4), -1)
      })
    })
  })
})
