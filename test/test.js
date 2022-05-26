const { start, stop, get, put, destroy } = require("../core")
const expect = require('chai').expect;

describe('express Features', function() {
  this.timeout(60000)

  describe('Start / Stop database: ', function() {
      it('Start / Stop', async function() {
        start({ path: "./data" })
        stop()
      })

      describe('CRUD operations: ', function() {
        before(async function() {
            start({ path: "./data" })
        })    

        it('Put', async function() {
            put("test", "test")
        })

        it('Get', async function() {
            const test = get("test")
            console.log(test)
        })

        it('Destroy', async function() {
            destroy("test")
        })

        after(async function() {
            stop()
        })    
      })
    })
})