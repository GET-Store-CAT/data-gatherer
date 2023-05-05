// Tests for the Data class
const levelup = require('levelup');
const leveldown = require('leveldown');
const Data = require('../model/data');
const Item = require('./test_item');

const db = levelup(leveldown('./my_test_db'));

const testData = [
  new Item({ id: 1, name: 'Item 1', description: 'First item' }),
  new Item({ id: 2, name: 'Item 2', description: 'Second item' }),
  new Item({ id: 3, name: 'Item 3', description: 'Third item' }),
  new Item({ id: 4, name: 'Item 4', description: 'Fourth item' }),
  new Item({ id: 5, name: 'Item 5', description: 'Fifth item' }),
];

// console.log('Running tests...', testData);

const data = new Data('test', db, testData);

async function test() {
  // // Test creating an item
  // data.createItems(testData)
  //   .then(() => {
  //     console.log('Create item test passed');
  //   })
  //   .catch((err) => {
  //     console.error('Create item test failed:', err);
  //   });

  // TEST get healthy list
  // let healthyList = data.getHealthyList()
  //   .then((list) => {
  //     console.log('Get healthy list test passed');
  //   })
  //   .catch((err) => {
  //     console.error('Get healthy list test failed:', err);
  //   });

  // console.log("healthy list is ", healthyList)

  // // Test creating an item
  // data.create(new Item({ id: 4, name: 'Item 4', description: 'Fourth item' }))
  //   .then(() => {
  //     console.log('Create item test passed');
  //   })
  //   .catch((err) => {
  //     console.error('Create item test failed:', err);
  //   });

  // // Test retrieving an item
  // data.get(2)
  // .then((item) => {
  //     console.log("return result is ", item)
  // })

  // Test getting a list of items
  let testlist = await data.getList();

  console.log('test list is ', testlist);

  // // Test pending item functionality
  // data.addPendingItem(5, new Item({ id: 5, name: 'Item 5', description: 'Fifth item' }))
  //   .then(() => {
  //     console.log('Add pending item test passed');
  //   })
  //   .catch((err) => {
  //     console.error('Add pending item test failed:', err);
  //   });

  // Test getting pending List
  // data.getPendingList()
  //   .then((list) => {
  //     console.log('Get pending items test passed', list);
  //   })
  //   .catch((err) => {
  //     console.error('Get pending items test failed:', err);
  //   });

  // TEST delete itme
  // data.deleteItem("pending:test:5")
  //   .then((list) => {
  //     console.log('Get pending items test passed');
  //   })
  //   .catch((err) => {
  //     console.error('Get pending items test failed:', err);
  //   });

  // Test getting pending item
  // data.getPendingItem(5)
  //   .then((item) => {
  //     console.log('Get pending item test passed', item);
  //   })
  //   .catch((err) => {
  //     console.error('Get pending item test failed:', err);
  //   });

  // TEST set IPFS
  // if (testlist) {
  //   console.log('test list', testlist);
  //   // const cid = db.uploadIPFS(testlist);
  //   let cid = 'befytestcid';

  //   testlist.forEach(async peer => {
  //     console.log('peer ', peer);
  //     const peerString = peer.key.toString();
  //     console.log('peer string ', peerString);
  //     await data.setIPFS(`${peerString}`, cid);
  //   });
  // } else {
  //   console.log('no test list found');
  // }

  // // Clean up the test database
  // db.close(() => {
  //   console.log('Database closed');
  // });
}

test();
