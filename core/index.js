const { readFileSync, writeFileSync, existsSync, appendFileSync } = require("fs")
const syncFrequency = 1000

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
            if (Object.prototype.toString.call(dataCursor[keySegment] != '[object Object]')) dataCursor[keySegment] =  {}
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
    appendFileSync(logsLocation, `${Date.now()}:${key}:put\n`)
    syncData(key)
}

const destroy = (key) => {
    doDestroy(key, dataCopy)
    appendFileSync(logsLocation, `${Date.now()}:${key}:destroy\n`)
    syncData(key)
}

const syncData = (updatedKey) => {    
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
                if ( logTimestamp > lastSync && logKey != updatedKey) {
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
    
    // persist only if a key was updated locally
    if (updatedKey) writeFileSync(dataLocation, JSON.stringify(dataCopy))
}

const cleanLogs = () => {
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
        console.log(`pocdb : persisting db at ${dataLocation} ...`)
        stop()
    })

    process.on('SIGTERM', () => {
        console.log(`pocdb : persisting db at ${dataLocation} ...`)
        stop()
    })
}

const stop = () => {
    if(syncDataTick) clearInterval(syncDataTick)
    if(cleanLogsTick) clearInterval(cleanLogsTick)
    cleanLogs()
    syncData()
}

module.exports = { start, stop, get, put, destroy }