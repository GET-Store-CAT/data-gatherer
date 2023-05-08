const Gatherer = require('./model/gatherer');
const levelup = require('levelup');
const Arweave = require('./adapters/arweave/arweave');
const leveldown = require('leveldown');
const db = levelup(leveldown(__dirname + '/localKOIIDB'));
const Data = require('./model/data');
const { namespaceWrapper } = require('./namespaceWrapper');
const { Keypair } = require('@solana/web3.js'); // TEST For local testing only
const fs = require('fs');
const fsPromise = require("fs/promises");
const { Web3Storage, getFilesFromproofPath } = require('web3.storage');
const storageClient = new Web3Storage({
  token: process.env.SECRET_WEB3_STORAGE_KEY,
});


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

  console.log('IN FETCH SUBMISSION');

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

  const proof_cid = await uploadIPFS(submission_value);

  return proof_cid;

};

uploadIPFS = async function (data) {
  const proofPath = `./${this.name}/proofs${round}.json`;

  if (!fs.existsSync(`/${this.name}`)) fs.mkdirSync(`/${this.name}`);

  console.log('proofPATH', proofPath);

  await fsPromise.writeFile(proofPath, JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
    }
  });

  if (storageClient) {
    const file = await getFilesFromproofPath(proofPath);
    const proof_cid = await storageClient.put(file);
    console.log(`Proofs of healthy list in round ${round} : `, proof_cid);

    return proof_cid;
  } else {
    console.log('NODE DO NOT HAVE ACCESS TO WEB3.STORAGE');
  }
};

module.exports = run;
