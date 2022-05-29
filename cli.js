#!/usr/bin/env node
const args = require('yargs').argv;
const pocdb = require('./lib')
const { path, address, port } = args
pocdb.start({ path, address, port })