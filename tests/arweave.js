const Gatherer = require('../model/gatherer');
const levelup = require('levelup');
const Arweave = require('../adapters/arweave/arweave');
const leveldown = require('leveldown');
const db = levelup(leveldown(__dirname + '/localKOIIDB'));
const Data = require('../model/data');
const { namespaceWrapper } = require('../namespaceWrapper');
const { Keypair } = require('@solana/web3.js'); // TEST For local testing only

const credentials = {}; // arweave doesn't need credentials

const run = async () => {
  // Load node's keypair from the JSON file
  // const keypair = await namespaceWrapper.getSubmitterAccount();

  // get Round
  // const round = await namespaceWrapper.getRound();

  // TEST ROUND
  let round = 1000;

  // TEST For local testing, hardcode the keypair
  const keypair = Keypair.generate();

  let query = 'web3'; // the query our twitter search will use

  let dataDb = new Data('arweaveNodes', db);

  let options = {
    maxRetry: 3,
    query: query,
  };

  const adapter = new Arweave(
    credentials,
    options.maxRetry,
    dataDb,
    'txidhere',
  );

  const gatherer = new Gatherer(dataDb, adapter, options);

  // run a gatherer to get 100 items
  let result = await gatherer.gather(100);

  const messageUint8Array = new Uint8Array(Buffer.from(result));

  const signedMessage = nacl.sign(messageUint8Array, keypair.secretKey);
  const signature = signedMessage.slice(0, nacl.sign.signatureLength);

  const submission_value = {
    proofs: result,
    node_publicKey: keypair.publicKey,
    node_signature: bs58.encode(signature),
  };

  // TODO test proof db
  await dataDb.addProof(round, submission_value);

  // TODO - add a test to check that the db has been populated with the correct data
  gatherer.getList().then(list => {
    console.log(list);
  });
};

run();
