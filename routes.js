const express = require('express');
const router = express.Router();
const Data = require('./model/data');
const db = levelup(leveldown(__dirname + '/localKOIIDB'));
const fs = require('fs');
const { namespaceWrapper } = require('./namespaceWrapper');

let data = new Data('arweaveNodes', db);

// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  next();
});

// Route to get task state
router.get('/taskState', async (req, res) => {
  const state = await namespaceWrapper.getTaskState();
  console.log("TASK STATE", state);

  res.status(200).json({ taskState: state })
})

// Route to fetch a user by ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).send('User not found');
  }
});

module.exports = router;