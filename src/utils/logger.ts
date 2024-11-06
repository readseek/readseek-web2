import chalk from 'chalk';

import { isDevModel, getFullTime } from './common';

function logWrapper(level: number) {
    // Using curried wrapper
    return (...logs: any[]) => {
        if (isDevModel() && logs.length > 0) {
            switch (level) {
                case 1:
                    console.log(chalk.yellow.underline(`[${getFullTime()}]`), ...logs);
                    break;
                case -1:
                    console.log(chalk.red.bold.underline(`[${getFullTime()}]`), ...logs);
                    break;
                default:
                    console.log(chalk.green(`[${getFullTime()}]`), ...logs);
                    break;
            }
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
