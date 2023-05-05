const levelup = require('levelup');
const leveldown = require('leveldown');
const Item = require('./item');

class Data {
  constructor(name, db, data) {
    this.name = name;
    this.db = db;
    this.data = data;
    this.dbprefix = `${name} + ":"`;
    this.fullList = [];
    this.lastUpdate = Date.now();
  }

  // create a new item
  async create(item) {
    return new Promise((resolve, reject) => {
      this.db.put(this.createId(item.id), JSON.stringify(item), err => {
        if (err) {
          console.error('Error in create', err);
          reject(err);
        } else {
          console.log('Created item', item.id);
          resolve(item);
        }
      });
    });
  }

  // creates new database with received data
  async createItems(data) {
    for (let i = 0; i < data.length; i++) {
      try {
        const createdItem = await this.create(data[i]);
        this.fullList.push(createdItem);
        console.log(
          `Created ${this.fullList.length} items from a list of ${data.length}`,
        );
      } catch (err) {
        console.error('Error creating item:', err);
      }
    }
  }
  // returns item by id
  async get(id) {
    return new Promise((resolve, reject) => {
      this.db.get(this.createId(id), (err, value) => {
        if (err) {
          // console.error("Error in getData get", err, id);
          resolve(null);
        } else {
          resolve(JSON.parse(value || '[]'));
        }
      });
    });
  }

  // return items by name
  async getList(options) {
    // if no options supplied, default to a list of stored items by their keys
    if (!options)
      options = {
        lt: `${this.name}~`,
        reverse: true,
        keys: true,
        values: true,
      };
    return new Promise((resolve, reject) => {
      let dataStore = [];
      this.db
        .createReadStream(options)
        .on('data', function (data) {
          console.log(data.key.toString(), '=', data.value.toString());
          dataStore.push({
            key: data.key.toString(),
            value: data.value.toString(),
          });
        })
        // TODO - add error handling
        .on('error', function (err) {
          console.log('Something went wrong in read Stream!', err);
          reject(err);
        })
        .on('close', function () {
          console.log('Stream closed');
        })
        .on('end', function () {
          console.log('Stream ended');
          resolve(dataStore);
        });
    });
  }

  // create pending item
  addPendingItem(id, value) {
    return new Promise((resolve, reject) => {
      this.db.put(this.createPendingId(id), JSON.stringify(value), err => {
        if (err) {
          console.error('Error in addPendingItem', err);
          reject(err);
        } else {
          console.log('added pending item', id);
          resolve(true);
        }
      });
    });
  }

  // get pending item
  getPendingItem(id) {
    return new Promise((resolve, reject) => {
      this.db.get(this.createPendingId(id), (err, value) => {
        if (err) {
          console.error('Error in getData get', err, id);
          resolve(null);
        } else {
          resolve(JSON.parse(value || '[]'));
        }
      });
    });
  }

  // get pending item List
  getPendingList(limit) {
    return new Promise((resolve, reject) => {
      let dataStore = [];
      let options = {
        lt: `pending:${this.name}~`,
        reverse: true,
        keys: true,
        values: true,
      };
      if (limit) options.limit = limit;

      this.db
        .createReadStream(options)
        .on('data', function (data) {
          console.log(data.key.toString(), '=', data.value.toString());
          dataStore.push(JSON.parse(data.value.toString()));

          // check if the limit has been reached
          if (limit && dataStore.length >= limit) {
            console.log('limit reached');
            this.destroy(); // TODO - test this
          }
        })
        .on('error', function (err) {
          console.log('Oh my!', err);
          reject(err);
        })
        .on('close', function () {
          console.log('Stream closed');
        })
        .on('end', function () {
          console.log('Stream ended');
          resolve(dataStore);
        });
    });
  }

  // add running item
  addRunningItem(id, value) {
    return new Promise((resolve, reject) => {
      this.db.put(this.createRunningId(id), JSON.stringify(value), err => {
        if (err) {
          console.error('Error in addRunningItem', err);
          reject(err);
        } else {
          console.log('added running item', id);
          resolve(true);
        }
      });
    });
  }

  // get running item
  getRunningItem(id) {
    return new Promise((resolve, reject) => {
      this.db.get(this.createRunningId(id), (err, value) => {
        if (err) {
          console.error('Error in getData get', err, id);
          resolve(null);
        } else {
          resolve(JSON.parse(value || '[]'));
        }
      });
    });
  }

  // get running item List
  getRunningList(limit) {
    let runningStore = [];
    return new Promise((resolve, reject) => {
      let options = {
        lt: `running:${this.name}~`,
        reverse: true,
        keys: true,
        values: true,
      };
      if (limit) options.limit = limit;
      this.db
        .createReadStream(options)
        .on('data', function (data) {
          console.log(data.key.toString(), '=', data.value.toString());
          runningStore.push(JSON.parse(data.value.toString()));
          // check if the limit has been reached
        })
        .on('error', function (err) {
          console.log('Oh my!', err);
          reject(err);
        })
        .on('close', function () {
          console.log('Stream closed');
        })
        .on('end', function () {
          console.log('Stream ended');
          resolve(runningStore);
        });
    });
  }

  // add healthy item
  addHealthyItem(id, value) {
    return new Promise((resolve, reject) => {
      this.db.put(this.createHealthyId(id), JSON.stringify(value), err => {
        if (err) {
          console.error('Error in addHealthyItem', err);
          reject(err);
        } else {
          console.log('added healthy item', id);
          resolve(true);
        }
      });
    });
  }

  // get healthy item
  getHealthyItem(id) {
    return new Promise((resolve, reject) => {
      this.db.get(this.createHealthyId(id), (err, value) => {
        if (err) {
          console.error('Error in getData get', err, id);
          resolve(null);
        } else {
          resolve(JSON.parse(value || '[]'));
        }
      });
    });
  }

  // get healthy item List
  getHealthyList(limit) {
    let healthyStore = [];
    return new Promise((resolve, reject) => {
      let options = {
        lt: `healthy:${this.name}~`,
        reverse: true,
        keys: true,
        values: true,
      };
      if (limit) options.limit = limit;
      this.db
        .createReadStream(options)
        .on('data', function (data) {
          console.log(data.key.toString(), '=', data.value.toString());
          healthyStore.push(JSON.parse(data.value.toString()));
          // TODO: check if the limit has been reached
        })
        .on('error', function (err) {
          console.log('Oh my!', err);
          reject(err);
        })
        .on('close', function () {
          console.log('Stream closed');
        })
        .on('end', function () {
          console.log('Stream ended');
          resolve(healthyStore);
        });
    });
  }

  // add proof to db by round
  addProof(round, proof) {
    return new Promise((resolve, reject) => {
      this.db.put(`${this.name}:proof:${round}`, JSON.stringify(proof), err => {
        if (err) {
          console.error('Error in addProof', err);
          reject(err);
        } else {
          console.log('added proof', round);
          resolve(true);
        }
      });
    });
  }

  // get proof by round
  getProof(round) {
    return new Promise((resolve, reject) => {
      this.db.get(`${this.name}:proof:${round}`, (err, value) => {
        if (err) {
          console.error('Error in getProof', err, round);
          resolve(null);
        } else {
          resolve(JSON.parse(value || '[]'));
        }
      });
    });
  }

  // get list of proofs
  getProofList() {
    return new Promise((resolve, reject) => {
      let dataStore = [];
      let options = {
        gt: `${this.name}:proof:`,
        lt: `${this.name}:proof:~`,
        reverse: true,
        keys: true,
        values: true,
      };

      this.db
        .createReadStream(options)
        .on('data', function (data) {
          console.log(data.key.toString(), '=', data.value.toString());
          dataStore.push(JSON.parse(data.value.toString()));
        })
        .on('error', function (err) {
          console.log('Oh my!', err);
          reject(err);
        })
        .on('close', function () {
          console.log('Stream closed');
        })
        .on('end', function () {
          console.log('Stream ended');
          resolve(dataStore);
        });
    });
  }

  // delte item
  deleteItem(key) {
    return new Promise((resolve, reject) => {
      try {
        this.db.del(key);
        console.log('deleted item', key);
        resolve(true);
      } catch (err) {
        console.error('Error in deleteItem', err);
        resolve(false);
      }
    });
  }

  // ? What is this for?
  isDataItem(id) {
    return new Promise((resolve, reject) => {
      this.get(this.createId(id), (err, value) => {
        if (err) {
          console.error('Error in getData - dataItem ', err, id);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Tool to create a new ID
  createId(id) {
    console.log('Received DB name is', this.name);
    let newId = `${this.name}:${id}`;
    console.log('new id is ', newId);
    return newId;
  }

  // Tool to create a pending ID
  createPendingId(id) {
    console.log(id);
    let normalId = this.createId(id);
    console.log('normal ID is ' + normalId);
    let pendingId = `pending:${normalId}`;
    console.log('new pending ID: ', pendingId);
    return pendingId;
  }

  // Tool to create a runnig ID
  createRunningId(id) {
    console.log(id);
    let normalId = this.createId(id);
    console.log('normal ID is ' + normalId);
    let runningId = `running:${normalId}`;
    console.log('new running ID: ', runningId);
    return runningId;
  }
}

module.exports = Data;
