import chalk from 'chalk';

import { isDevModel, isBrowserModel, getFullTime } from './common';

function logWrapper(level: number) {
    // Using curried wrapper
    return (logs: any[]) => {
        if ((isBrowserModel || isDevModel()) && logs.length > 0) {
            const timestamp = `[${getFullTime()}]`;
            let logFunction: any = null;
            switch (level) {
                case 1:
                    logFunction = isBrowserModel ? console.warn : (time: string, ...msg: any) => console.log(chalk.yellow.italic.underline(time), ...msg);
                    break;
                case -1:
                    logFunction = isBrowserModel ? console.error : (time: string, ...msg: any) => console.log(chalk.red.bold.italic.underline(time), ...msg);
                    break;
                default:
                    logFunction = isBrowserModel ? console.log : (time: string, ...msg: any) => console.log(chalk.green.underline(time), ...msg);
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
export const logInfo = (...args: any[]) => logWrapper(0)(args);

/**
 * print warning console log with current time
 * @param args log
 */
export const logWarn = (...args: any[]) => logWrapper(1)(args);

/**
 * print error console log with current time
 * @param args log
 */
export const logError = (...args: any[]) => logWrapper(-1)(args);
