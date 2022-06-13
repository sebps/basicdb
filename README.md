# pocdb

pocdb
==========

Lightweight eventually consistent key/value database.

<!-- TOC -->

- [LIB](#lib)
- [CLI](#cli)
- [HTTP](#http)
- [License](#license)

<!-- /TOC -->
## LIB

### Installation
```sh
$ npm install pocdb
```

### Usage 

#### Start pocdb engine
```
const pocdb = require("pocdb")
const configuration = { path: "./data", address: "127.0.0.1, port: 8000 }
pocdb.start(configuration)
```

#### Query pocdb engine
```
pocdb.put("key", "value")
pocdb.get("key")
pocdb.destroy("key")
```

#### Create db backup
A backup is named after the data path, suffixed with a current timestamp generated during the call.

```
pocdb.backup()
```

#### Stop pocdb engine
```
pocdb.stop()
```

## CLI 

### Installation
```sh
$ npm install -g pocdb
```

### Usage

### Start pocdb engine and http server
pocdb --path=./data.json --address=127.0.0.1 --port=2222

## Configuration
Configuration of pocdb is made up of the following properties :

### path
The path of the pocdb persisted data.

### address
The listening address of pocdb http server ( default 127.0.0.1 )

### port
The listening port of pocdb http server ( default 2222 )

## HTTP
At pocdb start an http server is also started at the configured address and port to provide CRUD access to pocdb data. 

### Data explorer access 
Data explorer web interface is available under reserved path "/_explorer" 

The web interface is a fork of project "react-json-editor".
Original project page at https://github.com/sujinleeme/react-json-editor

### Database access 
Database HTTP access is available under reserved path "/_database" 

#### Path convention
For any HTTP request ( exepting for root path ), the request path will be translated into a specific db key. 
Any "/" will be converted as an internal key separator in the data tree structure.
For example an HTTP operation on "/users/1" path will be internally processed as an operation on "users.1" pocdb key.

#### Create / Update 
Put a value at a specific key

##### Method
PUT / POST

##### Body
{
    "value": <ANY_VALUE>
}

##### Response
{
    "statusCode": 200,
    "message": "key updated"
}

#### Read 
Read a value at a specific key

##### Method
GET

##### Response
{
    "statusCode": 200,
    "value": <ANY_VALUE>
}

#### Delete
Delete a value at a specific key

##### Method
DELETE

##### Response
{
    "statusCode": 200,
    "message": "key destroyed"
}

### Eventual consistency
Data synchronisation is supported accross several instances of pocdb referencing the same persisted data file. 
A .pocdb log file is saved under the same location than the persisted data file. 
Real-time updates to .pocdb log file are performed to achieve synchronization accross any number of pocdb instances referencing the data file. 
Synchronization time is of 1 second, meaning eventual consistency for pocdb is reached after 1 second at most.

## License

MIT

[npm-url]: https://www.npmjs.com/package/pocdb
