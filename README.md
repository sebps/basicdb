# expressDB

expressdb
==========

Lightweight key/value database.

<!-- TOC -->

- [LIB](#lib)
- [License](#license)

<!-- /TOC -->

## LIB

### Installation
```sh
$ npm install expressdb
```

### Usage
```
const expressdb = require("expressdb")

const configuration = { path: "./data" }

expressdb.start(configuration)
expressdb.put("key", "value")
expressdb.get("key")
expressdb.destroy("key")
expressdb.stop()
```

### Parameters

### configuration 
An object defining the path of the persisted data.

## License

MIT

[npm-url]: https://www.npmjs.com/package/expressdb