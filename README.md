# pocdb

pocdb
==========

Lightweight eventually consistent key/value database.

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
An object defining pocdb configuration containing the following properties :

#### path
The path of the persisted data.

### Eventual consistency
Data synchronisation is supported accross several instances of pocdb referencing the same persisted data file. 
A .pocdb log file is saved under the same location than the persisted data file. 
Real-time updates to .pocdb log file are performed to achieve synchronization accross any number of pocdb instances referencing the data file. 
Synchronization time is of 1 second, meaning eventual consistency for pocdb is reached after 1 second at most.

## License

MIT

[npm-url]: https://www.npmjs.com/package/pocdb