# pocdb

pocdb
==========

Lightweight key/value database.

<!-- TOC -->

- [LIB](#lib)
- [License](#license)

<!-- /TOC -->

## LIB

### Installation
```sh
$ npm install pocdb
```

### Usage
```
const pocdb = require("pocdb")

const configuration = { path: "./data" }

pocdb.start(configuration)
pocdb.put("key", "value")
pocdb.get("key")
pocdb.destroy("key")
pocdb.stop()
```

### Parameters

### configuration 
An object defining the path of the persisted data.

## License

MIT

[npm-url]: https://www.npmjs.com/package/pocdb