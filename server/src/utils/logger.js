const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Chosen the level depending of the current environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define which transports the logger must use
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
      ),
    ),
  }),
  
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Allow to print all the messages inside the all.log file
  new winston.transports.File({
    filename: path.join(logDir, 'all.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports,
  // Do not exit on handled exceptions
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled promise rejections
logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(logDir, 'exceptions.log'),
    maxsize: 5242880,
    maxFiles: 3,
  })
);

logger.rejections.handle(
  new winston.transports.File({ 
    filename: path.join(logDir, 'rejections.log'),
    maxsize: 5242880,
    maxFiles: 3,
  })
);

// Banking-specific logging functions
logger.auditLog = (action, userId, details) => {
  logger.info('AUDIT', {
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    type: 'audit'
  });
};

logger.transactionLog = (transactionId, type, amount, fromAccount, toAccount, status) => {
  logger.info('TRANSACTION', {
    transactionId,
    type,
    amount,
    fromAccount,
    toAccount,
    status,
    timestamp: new Date().toISOString(),
    type: 'transaction'
  });
};

logger.securityLog = (event, userId, ipAddress, userAgent, details) => {
  logger.warn('SECURITY', {
    event,
    userId,
    ipAddress,
    userAgent,
    details,
    timestamp: new Date().toISOString(),
    type: 'security'
  });
};

logger.loginAttempt = (email, success, ipAddress, userAgent, failureReason = null) => {
  const level = success ? 'info' : 'warn';
  logger[level]('LOGIN_ATTEMPT', {
    email,
    success,
    ipAddress,
    userAgent,
    failureReason,
    timestamp: new Date().toISOString(),
    type: 'authentication'
  });
};

module.exports = logger;