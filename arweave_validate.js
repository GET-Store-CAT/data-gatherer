const dataFromCid = require('./helpers/dataFromCid');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { default: axios } = require('axios');
const { namespaceWrapper } = require('./namespaceWrapper');

module.exports = async (submission_value, round) => {
  console.log('******/ Areawve Scrapping VALIDATION Task FUNCTION /******');
  const outputraw = await dataFromCid(submission_value);
  const output = outputraw.data;
  console.log('OUTPUT', output);
  console.log('RESPONSE DATA length', output.proofs.length);
  console.log('PUBLIC KEY', output.node_publicKey);
  console.log('SIGNATURE', output.node_signature);

  // Check that the node who submitted the proofs is a valid staked node
  let isNode = await verifyNode(
    output.proofs,
    output.node_signature,
    output.node_publicKey,
  );
  console.log("Is the node's signature on the CID payload correct?", isNode);

  // check each item in the linktrees list and verify that the node is holding that payload, and the signature matches
  let isPeer = await verifyPeers(output.proofs);
  console.log('Are peers True?', isPeer);

  if (isNode && isPeer) return true; // if both are true, return true
  else return false; // if one of them is false, return false
};

// verify the linktree signature by querying the other node to get it's copy of the linktree
async function verifyPeers(proofs) {
  const healthyList = await dataFromCid(proofs);
  for (let i = 0; i < healthyList.length; i++) {
    let peer = healthyList[i];
    let url = `http://${peer}`;
    let response = await axios.get(url);
    let peerData = response.data;
    if (peerData) {
      return true;
    } else {
      return false;
    }
  }
}

// verifies that a node's signature is valid, and rejects situations where CIDs from IPFS return no data or are not JSON
async function verifyNode(proofs, signature, publicKey) {
  const messageUint8Array = new Uint8Array(Buffer.from(proofs));
  const signatureUint8Array = bs58.decode(signature);
  const publicKeyUint8Array = bs58.decode(publicKey);

  if (!proofs || !signature || !publicKey) {
    console.error('No data received from web3.storage');
    return false;
  }

  // verify the node signature
  const isSignatureValid = await verifySignature(
    messageUint8Array,
    signatureUint8Array,
    publicKeyUint8Array,
  );

  return isSignatureValid;
}

async function verifySignature(message, signature, publicKey) {
  return nacl.sign.detached.verify(message, signature, publicKey);
}
