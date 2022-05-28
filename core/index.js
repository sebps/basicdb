const { readFileSync, writeFileSync, existsSync, appendFileSync } = require("fs")
const syncFrequency = 30000

var dataCopy
var dataLocation
var logsLocation
var syncDataTick
var cleanLogsTick
var lastSync

const doPut = (key, value, data) => {
    const keyPath = key.toString().split(".")
    let dataCursor = data
    while(keyPath.length > 0) {
        const keySegment = keyPath.shift()
        if (keyPath.length == 0) {
            dataCursor[keySegment] = value
        } else { 
            if (!dataCursor[keySegment]) dataCursor[keySegment] =  {}    
            dataCursor = dataCursor[keySegment]
        }
    }
}

const doGet = (key, data) => {
    const keyPath = key.split(".")
    let dataCursor = data
    while(keyPath.length > 0) {
        const keySegment = keyPath.shift()
        if (keyPath.length == 0) {
            return dataCursor[keySegment]
        } else { 
            if (!dataCursor[keySegment]) return undefined   
            dataCursor = dataCursor[keySegment]
        }
    }
}

const doDestroy = (key, data) => {
    const keyPath = key.split(".")
    let dataCursor = data
    while(keyPath.length > 0) {
        const keySegment = keyPath.shift()
        if (keyPath.length == 0) {
            dataCursor[keySegment] = undefined
        } else { 
            if (dataCursor[keySegment]) dataCursor = dataCursor[keySegment]
        }
    }
}

const get = (key) => {
    return doGet(key, dataCopy)
}

const put = (key, value) => {
    doPut(key, value, dataCopy)
    console.log("put")
    console.log(dataCopy)
    appendFileSync(logsLocation, `${Date.now()}:${key}:put\n`)
    syncData(key)
}

const destroy = (key) => {
    doDestroy(key, dataCopy)
    appendFileSync(logsLocation, `${Date.now()}:${key}:destroy\n`)
    syncData(key)
}

const syncData = (key) => {
    console.log("syncing data ...")
    
    // sync local data copy with shared data
    const startSync = Date.now()
    
    if (existsSync(dataLocation)) {
        const lastDataRawCopy = readFileSync(dataLocation)
        const lastDataCopy = JSON.parse(lastDataRawCopy)

        if (existsSync(logsLocation)) {
            const logRawCopy = readFileSync(logsLocation)
            logs = logRawCopy.toString().split('\n')
            // loop over logs to detect most recent versions of data records
            for (const log of logs) {
                const [ logTimestamp, logKey, logOp ] = log.split(':')
                if ( logTimestamp > lastSync && logKey != key) {
                    switch(logOp) {
                        case 'put':
                            const lastValue = doGet(logKey, lastDataCopy)
                            doPut(logKey, lastValue, dataCopy)
                        break;
                        case 'destroy':
                            doDestroy(logKey, dataCopy)
                        break;
                    }
                }
            }
        }
    }

    lastSync = startSync
    
    console.log("data copy at the end of syncing : ")
    console.log(dataCopy)
    console.log("data location : ")
    console.log(dataLocation)

    try {
        writeFileSync(dataLocation, JSON.stringify(dataCopy))
    } catch(err) {
        console.log(err)
    }
}

const cleanLogs = () => {
    console.log("cleaning logs ...")

    const now = Date.now()

    // clean logs older than 2 * syncFrequency ( so that everyone syncing with db at syncFrequency should already be synchronized with those logs )    
    if (existsSync(logsLocation)) {
        const logRawCopy = readFileSync(logsLocation)
        const logs = logRawCopy.toString().split('\n')
        const cleanedLogs = []

        // loop over logs to detect most recent versions of data records
        for (const log of logs) {
            const [ timestamp ] = log.split(':')
            if ( timestamp > now - 2 * syncFrequency ) {
                cleanedLogs.push(log)
            }
        }

        writeFileSync(logsLocation, cleanedLogs.join('\n'))
    }
}

const start = ({ path }) => {
    if (!path) throw "missing path to data file in config"

    dataLocation = path 
    logsLocation = path + ".pocdb" 

    if (existsSync(dataLocation)) {
        const dataRawCopy = readFileSync(dataLocation)
        dataCopy = JSON.parse(dataRawCopy)
        lastSync = Date.now()
    } else {
        dataCopy = {}
    }

    syncDataTick = setInterval(() => {
        syncData()
    }, syncFrequency)

    cleanLogsTick = setInterval(() => {
        cleanLogs()
    }, syncFrequency)

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
    if(syncDataTick) clearInterval(syncDataTick)
    if(cleanLogsTick) clearInterval(cleanLogsTick)

    syncData()
}

module.exports = { start, stop, get, put, destroy }