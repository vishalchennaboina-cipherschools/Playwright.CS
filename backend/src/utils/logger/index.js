/** Configures enterprise-grade logging using winston. */

'use strict';

const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../../config');
const { getRequestId } = require('../../middleware/correlation');
const { maskSensitiveData } = require('./masking');


fs.mkdirSync(config.logDir, { recursive: true });


const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    success: 3,
    info: 4,
    debug: 5,
    trace: 6,
  },
  colors: {
    fatal: 'redBG white',
    error: 'red',
    warn: 'yellow',
    success: 'green',
    info: 'cyan',
    debug: 'gray',
    trace: 'white',
    FATAL: 'redBG white',
    ERROR: 'red',
    WARN: 'yellow',
    SUCCESS: 'green',
    INFO: 'cyan',
    DEBUG: 'gray',
    TRACE: 'white',
  },
};

winston.addColors(customLevels.colors);

const uppercaseLevel = winston.format((info) => {
  info.level = info.level.toUpperCase();
  return info;
});

/** Injects context and masks sensitive metadata. */
const injectContext = winston.format((info) => {
  const reqId = getRequestId();
  if (reqId) {
    info.requestId = reqId;
  }
  

  if (typeof info.message === 'string') {
    const match = info.message.match(/^\[([A-Za-z]+)\]\s(.*)/);
    if (match) {
      // Only set if not already explicitly provided
      if (!info.category) {
        info.category = match[1].toUpperCase();
      }
      info.message = match[2];
    }
  }


  const maskedInfo = maskSensitiveData(info);
  

  for (const sym of Object.getOwnPropertySymbols(info)) {
    maskedInfo[sym] = info[sym];
  }
  

  if (info.executionId) {
    maskedInfo.executionId = info.executionId;
  }
  
  return maskedInfo;
});

/** Formats string output. */
const customFormat = winston.format.printf((info) => {
  const { timestamp, level, message, category, requestId, executionId, ...meta } = info;
  
  let out = `[${timestamp}] [${level}]`;
  if (category) out += ` [${category}]`;
  if (requestId) out += ` [Req: ${requestId}]`;
  if (executionId) out += ` [Exec: ${executionId}]`;
  
  out += ` ${message}`;

  // Print metadata if any remains (excluding standard symbols)
  const metaKeys = Object.keys(meta).filter(k => k !== 'message' && k !== 'level' && typeof k === 'string');
  if (metaKeys.length > 0) {
    const cleanMeta = {};
    for (const key of metaKeys) {
      cleanMeta[key] = meta[key];
    }
    
    // Format error stack specifically if it exists
    if (meta.stack) {
      out += `\n${meta.stack}`;
    } else if (Object.keys(cleanMeta).length > 0) {
      out += `\nMetadata: ${JSON.stringify(cleanMeta, null, 2)}`;
    }
  }

  return out;
});



const transports = [];

// Console Transport
if (config.logToConsole !== false) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        uppercaseLevel(),
        winston.format.colorize({ all: false, level: true }),
        customFormat
      ),
    })
  );
}

// File Transports (Daily Rotate)
if (config.logToFile !== false) {
  const createRotateTransport = (filename, level = null) => {
    const opts = {
      filename: path.join(config.logDir, filename),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d', // keep 14 days by default
      format: customFormat,
    };
    if (level) opts.level = level;
    return new winston.transports.DailyRotateFile(opts);
  };

  transports.push(createRotateTransport('server-%DATE%.log'));
  transports.push(createRotateTransport('errors-%DATE%.log', 'error'));
  
  // Future: you can add specific transports that filter by category (e.g. database.log)
  // using winston.format((info) => info.category === 'DATABASE' ? info : false)()
}



const logger = winston.createLogger({
  levels: customLevels.levels,
  level: config.logLevel || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }), // handle Error objects
    injectContext(),
  ),
  transports,
});

/** Exposes categories as constants. */
logger.CATEGORIES = {
  SERVER: 'SERVER',
  DATABASE: 'DATABASE',
  API: 'API',
  EXECUTION: 'EXECUTION',
  PLAYWRIGHT: 'PLAYWRIGHT',
  SOCKET: 'SOCKET',
  AUTH: 'AUTH',
  REPORTS: 'REPORTS',
  FILES: 'FILES',
  SYSTEM: 'SYSTEM',
  UI: 'UI',
  CONFIG: 'CONFIG',
  SECURITY: 'SECURITY',
};


module.exports = logger;
