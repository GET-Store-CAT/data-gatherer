const fs = require('fs');
const path = require('path');
const {
  namespaceWrapper,
  taskNodeAdministered,
} = require('./namespaceWrapper');

const logOverwrite = async () => {
  //Setup logging
  const originalConsoleLog = console.log;
  const logDir = './namespace';
  const logFile = 'logs.txt';
  const logPath = path.join(logDir, logFile);
  let logStream;
  const maxLogAgeInDays = 3;

  // Check if the log directory exists, if not, create it
  if (taskNodeAdministered) {
    if (!namespaceWrapper.fs.existsSync(logDir)) {
      namespaceWrapper.fs.mkdirSync(logDir);

      // Create a writable stream to the log file
      logStream = namespaceWrapper.fs.createWriteStream(logPath, {
        flags: 'a',
      });
    }
  } else {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);

      // Create a writable stream to the log file
      logStream = fs.createWriteStream(logPath, { flags: 'a' });
    }
  }

  // Function to remove logs older than specified age (in 3 days)
  async function cleanOldLogs(logDir, logFile, maxLogAgeInDays) {
    const currentDate = new Date();
    const logPath = path.join(logDir, logFile);

    if (taskNodeAdministered) {
      if (namespaceWrapper.fs.existsSync(logPath)) {
        const fileStats = fs.statSync(logPath);
        const fileAgeInDays =
          (currentDate - fileStats.mtime) / (1000 * 60 * 60 * 24);

        if (fileAgeInDays > maxLogAgeInDays) {
          namespaceWrapper.fs.unlinkSync(logPath);
        }
      }
    } else {
      if (fs.existsSync(logPath)) {
        const fileStats = fs.statSync(logPath);
        const fileAgeInDays =
          (currentDate - fileStats.mtime) / (1000 * 60 * 60 * 24);

        if (fileAgeInDays > maxLogAgeInDays) {
          fs.unlinkSync(logPath);
        }
      }
    }
  }

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

module.exports = logOverwrite;
