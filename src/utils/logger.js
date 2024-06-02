// const pino = require('pino');
// const fs = require('fs');

// // Specify the log file path
// const logFilePath = 'C:/ApplicationLogs/WebAPPLogs/file.log';

// const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });


// // Create a Pino logger instance with the log file path
// const logger = pino({
//   level: 'error', // Specify log level
//   prettyPrint: true, // Optional: makes the log output human-readable
//   timestamp: pino.stdTimeFunctions.isoTime, // Include ISO timestamps in log messages
// },  logStream ); // Pass the log file path using pino.destination

// module.exports = logger;

// Logger.js
// import pino from 'pino';
// import { tee } from 'pino-tee';

// // Create a writable stream for the file 
// const fileStream = pino.destination('C:/ApplicationLogs/WebAPPLogs/file.log'); // Change the file path as needed

// // Create a Pino logger instance
// const logger = pino(tee({ streams: [fileStream, process.stdout] }));

// export default logger;