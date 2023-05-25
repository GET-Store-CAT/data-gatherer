const Twitter = require('./adapters/twitter/twitter.js'); 
const db = require('./helpers/db');
const { Web3Storage } = require('web3.storage');
const Data = require('./model/data');
const dotenv = require('dotenv');

dotenv.config();

class TwitterTask {
  constructor (getRound) {
    this.round = getRound();
    this.lastRoundCheck = Date.now();
    this.isRunning = false;
    this.searchTerm = 'Web3';
    this.db = new Data("db"); // now unused
    this.setAdapter = async ( ) => {
      const username = process.env.TWITTER_USERNAME;
      const password = process.env.TWITTER_PASSWORD;

      if (!username || !password) {
        throw new Error('Environment variables TWITTER_USERNAME and/or TWITTER_PASSWORD are not set');
      }
  
      let credentials = {
          username: username,
          password: password
      }
      this.adapter = new Twitter(credentials, db, 3);
    }
    
    this.updateRound = async () => {
      // if it has been more than 1 minute since the last round check, check the round and update this.round
      if (Date.now() - this.lastRoundCheck > 60000) {
        this.round = await getRound();
        this.lastRoundCheck = Date.now();
      }
      return this.round;
    }
    this.start();
  }

  // the start method accepts a 
  async start () {
    await this.setAdapter();

    await db.intializeData();

    this.isRunning = true;

    let query = {
      limit: 100,
      searchTerm: this.searchTerm,
      query: `https://twitter.com/search?q=${this.searchTerm}&src=typed_query`,
      depth: 3,
      updateRound: async () => {
        return this.updateRound()
      },
      round: this.round
    }
  
    let options = { // TODO - unused?
        maxRetry : 3, 
        query : query
    }
    
    await this.adapter.negotiateSession(); 
    this.adapter.crawl(query); // let it ride
    
  }

  async stop () {
    this.isRunning = false;
    this.adapter.stop();
  }

  async getRoundCID(roundID) {
    console.log('starting submission prep for ')
    let result = await this.adapter.getSubmissionCID(roundID);
    console.log('returning round CID', result, 'for round', roundID)
    return result;
    
  }

  async handleW3SResults(data) {
    // need to load the file and then parse it here for json... wow this is so dumb 
    // Start the download and return a stream
    console.log('type', typeof data, data)
    const downloadStream = data;

    // Create a Promise to handle the asynchronous parsing
    return new Promise((resolve, reject) => {
      let buffer = '';

      // Handle data events from the download stream
      downloadStream.on('data', (data) => {
        buffer += data.toString();
      });

      // Handle the end event when the download is complete
      downloadStream.on('end', () => {
        try {
          const jsonObject = JSON.parse(buffer);
          resolve(jsonObject);
        } catch (error) {
          reject(error);
        }
      });

      // Handle any errors that occur during the download
      downloadStream.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  async validate(proofCid, roundID) {
    // in order to validate, u need to take the proofCid 
    // and go get the results from web3.storage
    let web3StorageClient = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });

    let data = await web3StorageClient.get(  proofCid); // check this
    console.log(`validate got results for CID: ${ proofCid } for round ${ roundID }`, data);

    let files = await data.files();
    for (const file of files) {
      console.log(`${file.cid} -- ${file.path} -- ${file.size}`)
    }
    // let storeObject = await this.handleW3SResults(stream);

    // the data submitted should be an array of additional CIDs for individual tweets, so we'll try to parse it
    let cids = JSON.parse(data.body);
    let proofThreshold = 4; // an arbitrary number of records to check

    for ( let i = 0; i < proofThreshold; i++ ) {
      let randomIndex = Math.floor(Math.random() * cids.length);
      let cid = cids[randomIndex];
      let result = await web3StorageClient.get({ token: process.env.WEB3STORAGE_TOKEN }, cid);

      // then, we need to compare the CID result to the actual result on twitter
      // i.e. 

      // need to check if there's an active session and set one if not
      if (!this.adapter.checkSession()) {
        await this.adapter.negotiateSession();
        let twitterCheck = await this.adapter.parseItem(result.id); // update to suit the adapter 
      }
      
      // TODO - revise this check to make sure it handles issues with type conversions
      if (cid !== twitterCheck) {
        return false;
      } 
    }
    
    // if none of the random checks fail, return true
    return true

  }


} 

module.exports = TwitterTask;