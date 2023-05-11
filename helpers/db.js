const { namespaceWrapper } = require('../namespaceWrapper');
const Data = require('../model/data');

const db = namespaceWrapper.db
  
db.ensureIndex(
    { fieldName: 'itemId', unique: true },
    function (err) {
      if (err) console.log(err.key, "already exist: ", err.errorTypee); // If there are duplicate values when you apply the unique index, you'll get an error.
    },
  );

let dataDb = new Data('arweaveNodes', db);

module.exports = dataDb;