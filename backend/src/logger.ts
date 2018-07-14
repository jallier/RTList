import winston = require('winston');
// import * as dotenv from 'dotenv';
import * as moment from 'moment';

// dotenv.config();

// Uncomment this if you want to bring in the config file
// const level: string = process.env.LOG_LEVEL || 'warn';
const level: string = 'debug';

export const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      colorize: true,
      level,
      prettyPrint: true,
      timestamp: () => `[${moment().format('ddd MMM DD HH:mm:ss')}]`,
    }),
  ],
});
