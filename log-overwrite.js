/**
 * NOTICE: THIS FUNCTION IS BEEN ARCHIVED AND IS NO LONGER IN USE
 */

const fs = require('fs');
const path = require('path');
const { namespaceWrapper } = require('./namespaceWrapper');
const { TASK_ID } = require('./init');

const logOverwrite = async () => {
  //Setup logging
  const originalConsoleLog = console.log;
  const logDir = './';
  const logFile = 'logs.txt';
  let logPath = path.join(logDir, logFile);
  const maxLogAgeInDays = 3;

  // Check if the log directory exists, if not, create it

  if (!namespaceWrapper.fs('access', logPath)) {
    await namespaceWrapper.fs('mkdir', logPath);
  }

  // ! THIS IS THE LINE THAT IS CAUSING THE ERROR
  let logStream = namespaceWrapper.fsWriteStream(`namespace/${TASK_ID}/${logPath}`, {
    flags: 'a',
  });

  // Overwrite the console.log function to write to the log file
  console.log = function (...args) {
    originalConsoleLog.apply(console, args);
    const message =
      args
        .map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
        .join(' ') + '\n';

    // Write the message to the log file
    logStream.write(message);
  };

  // Clean old logs
  await cleanOldLogs(logDir, logFile, maxLogAgeInDays);
};

// Function to remove logs older than specified age (in 3 days)
async function cleanOldLogs(logDir, logFile, maxLogAgeInDays) {
  const currentDate = new Date();
  const logPath = path.join(logDir, logFile);

  if (namespaceWrapper.fs('access', logPath)) {
    const fileStats = namespaceWrapper.fs('stat', logPath);
    const fileAgeInDays =
      (currentDate - fileStats.mtime) / (1000 * 60 * 60 * 24);

    if (fileAgeInDays > maxLogAgeInDays) {
      namespaceWrapper.fs('unlink', logPath);
    }
  }
}

module.exports = logOverwrite;
