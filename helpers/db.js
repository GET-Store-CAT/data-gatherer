const levelup = require('levelup');
const leveldown = require('leveldown');
const Data = require('../model/data');

const db = levelup(leveldown('../localKOIIDB'));
let dataDb = new Data('arweaveNodes', db);

module.exports = dataDb;