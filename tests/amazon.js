const Gatherer = require('../model/gatherer');
const levelup = require('levelup');
const leveldown = require('leveldown');
const db = levelup(leveldown(__dirname + '/localKOIIDB'));
const Data = require('../model/data');
const Amazon = require('../adapters/amazon');

const credentials = {}; // arweave doesn't need credentials

const run = async () => {
  let query = 'shelves'; // the query our twitter search will use

  let dataDb = new Data('amazon', db);

  let options = {
    maxRetry: 3,
    query: query,
  };

  const adapter = new Amazon(credentials, options.maxRetry, dataDb);

  const gatherer = new Gatherer(dataDb, adapter, options);

  // run a gatherer to get 100 items
  let results = await gatherer.gather(100);

  // TODO - add a test to check that the db has been populated with the correct data
  gatherer.getList().then(list => {
    console.log(list);
  });
};

run();
