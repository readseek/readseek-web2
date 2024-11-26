import chalk from 'chalk';

import { isDevModel, isBrowserModel, getFullTime } from './common';

function logWrapper(level: number) {
    // Using curried wrapper
    return (...logs: any[]) => {
        if (isDevModel() && logs.length > 0) {
            const timestamp = `[${getFullTime()}]`;
            let logFunction: any = null;
            switch (level) {
                case 1:
                    logFunction = isBrowserModel ? console.warn : (msg: any) => console.log(chalk.yellow.italic.underline(msg));
                    break;
                case -1:
                    logFunction = isBrowserModel ? console.error : (msg: any) => console.log(chalk.red.bold.underline(msg));
                    break;
                default:
                    logFunction = isBrowserModel ? console.log : (msg: any) => console.log(chalk.green.underline(msg));
                    break;
            }
            logFunction(timestamp, ...logs);
        }
    };
}

/**
 * print standard console log with current time
 * @param args log
 */
export const logInfo = (...args: any[]) => logWrapper(0)(...args);

/**
 * print warning console log with current time
 * @param args log
 */
export const logWarn = (...args: any[]) => logWrapper(1)(...args);

/**
 * print error console log with current time
 * @param args log
 */
export const logError = (...args: any[]) => logWrapper(-1)(...args);
