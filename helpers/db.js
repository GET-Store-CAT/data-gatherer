const levelup = require('levelup');
const leveldown = require('leveldown');
const Data = require('../model/data');

const db = levelup(leveldown(__dirname + '/../localKOIIDB'));
let dataDb = new Data('arweaveNodes', db);

module.exports = dataDb;