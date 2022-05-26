# BasicDB

basicdb
==========

Lightweight key/value database.

<!-- TOC -->

- [LIB](#lib)
- [License](#license)

<!-- /TOC -->

## LIB

### Installation
```sh
$ npm install basicdb
```

### Usage
```
const basicdb = require("basicdb")

const configuration = { path: "./data" }

basicdb.start(configuration)
basicdb.put("key", "value")
basicdb.get("key")
basicdb.destroy("key")
basicdb.stop()
```

### Parameters

### configuration 
An object defining the path of the persisted data.

## License

MIT

[npm-url]: https://www.npmjs.com/package/basicdb