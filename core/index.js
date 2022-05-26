const { readFileSync, writeFileSync, existsSync } = require("fs")

var dataCopy
var dataLocation
var tick

const put = (key, value) => {
    const keyPath = key.split(".")
    let dataCursor = dataCopy
    while(keyPath.length > 0) {
        const keySegment = keyPath.shift()
        
        if (!dataCursor[keySegment]) dataCursor[keySegment] =  {}

        if (keyPath.length == 0) dataCursor[keySegment] = value
    }
}

const get = (key) => {
    const keyPath = key.split(".")
    let dataCursor = dataCopy
    while(keyPath.length > 0) {
        const keySegment = keyPath.shift()
        
        if (!dataCursor[keySegment]) return undefined

        if (keyPath.length == 0) return dataCursor[keySegment]
    }
}

const destroy = (key) => {
    const keyPath = key.split(".")
    let dataCursor = dataCopy
    while(keyPath.length > 0) {
        const keySegment = keyPath.shift()
        
        if (!dataCursor[keySegment]) dataCursor[keySegment] =  {}

        if (keyPath.length == 0) dataCursor[keySegment] = undefined
    }
}

const start = ({ path }) => {
    if (!path) throw "missing path to data file in config"

    dataLocation = path 

    if (existsSync(dataLocation)) {
        dataRawCopy = readFileSync(dataLocation)
        dataCopy = JSON.parse(dataRawCopy)
    } else {
        dataCopy = {}
    }

    tick = setInterval(() => {}, 1000)

    process.on('SIGINT', () => {
        console.log(`SIGINT : persisting db at ${dataLocation} ...`)
        stop()
    })

    process.on('SIGTERM', () => {
        console.log(`SIGTERM : persisting db at ${dataLocation} ...`)
        stop()
    })
}

const stop = () => {
    if(tick) clearInterval(tick)
    if( dataLocation && dataCopy) writeFileSync(dataLocation, JSON.stringify(dataCopy))
}

module.exports = { start, stop, get, put, destroy }