const axios = require('axios');
const {URL} = require('url');
class Peer {
  constructor(location) {
    this.location = location;
    this.isHealthy = false;
    this.containsTx = false;
    this.peers = [];
  }
  healthCheck = async function (url) {
    // console.log('entered healthcheck')
    if (this.location.length > 100) {
      console.error('location field is too large');
      return;
    }
    try {
      console.log('sending health check for ', this.location)
      const response = await axios.get(url, {
        timeout: 10000,
      });
      console.log('payload received', response.data);
      if (response.data) {
        this.isHealthy = true;
        this.peer.push(response.data);
      }
      // console.log('healthcheck completed')
    } catch (err) {
      console.error("can't fetch " + this.location + err);
    }
    return;
  };

  // FullScan
  // performs a full scan on a node
  // node: a crawler object must be passed in to allow new peers to be added
  fullScan = async function (peer, txid) {
    peer = String(peer).replace(/"/g, ''); // Remove double quotes
    // console.log('checking ' + peer);
    let url = new URL(`http://${peer}/peers`);
    if (!this.isHealthy) await this.healthCheck(url);

    // console.log('moved past')
    if (this.isHealthy) {
      // console.log('getting peers for ' + this.location)
      await this.getPeers(url);

      // console.log('checking tx for ' + this.location)
      await this.checkTx(peer, txid);
    }

    // console.log(this.peers)

    return this;
  };

  // CheckTx
  // Checks if a specific node has a given txId
  checkTx = async function (peer, txid) {
    if (!this.isHealthy) await this.healthCheck();

    if (this.isHealthy) {
      try {
        let txurl = new URL(`http://${peer}/tx/${txid}`);
        // console.log('sending txid check for ', peerUrl)
        const response = await axios.get(txurl, {
          timeout: 10000,
        });
        // console.log('payload returned from ' + peerUrl, payload)
        const body = JSON.parse(response.data);
        if (body) {
          this.containsTx = true;
          await this.adapter.storeListAsPendingItems(this.containsTx);
        }
      } catch (err) {
        // if (debug) console.error ("can't fetch " + this.location, err)
      }
    }
    return this;
  };

  // getPeers
  // Checks peers endpoint
  getPeers = async function (url) {
    if (!this.isHealthy) await this.healthCheck();

    // console.log('trying to get peers')
    if (this.isHealthy) {
      // console.log('passed healthcheck in getPeers')
      try {
        // console.log('sending PEER check for ', this.location)
        const response = await axios.get(url, {
          timeout: 10000,
        });
        // console.log('payload returned from ' + this.location, payload)
        const body = response.data;
        // console.log("BODY", body)
        if (body) {
          this.peers = body;
        }
        return;
      } catch (err) {
        console.error("can't fetch peers from " + this.location, err);
      }
    }
    return;
  };
}

module.exports = Peer;
