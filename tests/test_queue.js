// Fetch the init_peer_list from the arweave.net/peers endpoint
// Store the init_peer_list in leveldb as pending items
// Use Queue to check if there are nodes existing in the init_peer_list
// If there are nodes, add them to the pending list
// Check if the node is healthy
// If the node is healthy, add it to the healthy list
// If the node is not healthy, add it to the unhealthy list
// Save the healthy list to leveldb
// Save the unhealthy list to leveldb



const { Queue } = require('async-await-queue');
const axios = require('axios');

let pending = [];
let queue = [];
let running = [];
let queried = [];
let healthyNodes = [];
let replicators = [];

async function fetchPeers(url) {
  try {
    const response = await axios.get(url, {
        timeout: 1000,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching peers: ${error}`);
  }
}

async function main() {
  // Create a task_queue with a concurrency of 1 to manage the async tasks
  const task_queue = new Queue(5, 1000); // no more than 5 tasks at a time, 1000ms delay between sequential tasks

  pending = await fetchPeers('https://arweave.net/peers');

  console.log('init_peers', pending);
  // Add the fetchPeers function to the task_queue
  while (true) {
    try {
      console.log(pending.length);
      if (pending.length > 0) {
        console.log('adding batch');
        queue.push(
          task_queue.run(() => addBatch().catch(e => console.error(e))),
        );
        await Promise.allSettled(queue);
      } else {
        printStatus();
      }
    } catch (err) {
      console.error('error processing a node', err);
    }
  }
}

async function addBatch() {
  if (pending.length > 0) {
    let item = await getRandomNode();
    console.log('running', running);
    let result = await fullScan(item);
  }
}

getRandomNode = async function () {
  try {
    let index = Math.floor(Math.random() * pending.length);
    let peer = pending[index];
    pending[index] = pending[pending.length - 1];
    pending.pop();
    running.push(peer);
    return peer;
  } catch (err) {
    console.log('error selecting random node', err);
    return;
  }
};

fullScan = async function (peer) {
  try {
    let result = await fetchPeers(`http://${peer}/peers`);
    running.pop();
    console.log('result', result);
    if (result.length > 0) {
        console.log('new peers found', result)
      result.forEach(peer => {
        if (!queried.includes(peer)) {
          pending.push(peer);
        }
      });
    }
    queried.push(peer);
    console.log('queried', queried);

    return result;
  } catch (err) {
    console.log('error fetching peers', err);
    return;
  }
};

main();
// console.log('queue', queue);
