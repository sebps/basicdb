# readydb

readydb
==========

Lightweight key/value database.

<!-- TOC -->

- [LIB](#lib)
- [License](#license)

<!-- /TOC -->

## LIB

### Installation
```sh
$ npm install readydb
```

### Usage
```
const readydb = require("readydb")

const configuration = { path: "./data" }

readydb.start(configuration)
readydb.put("key", "value")
readydb.get("key")
readydb.destroy("key")
readydb.stop()
```

### Parameters

### configuration 
An object defining the path of the persisted data.

## License

MIT

[npm-url]: https://www.npmjs.com/package/readydb