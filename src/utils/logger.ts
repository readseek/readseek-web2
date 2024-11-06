import chalk from 'chalk';

import { isDevModel, getFullTime } from './common';

function logWrapper(...args: any[]) {
    const level = args[0];
    const rests = args.slice(1);
    if (isDevModel() && rests.length > 0) {
        const _log = (...logs: any[]) => {
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
        };
        _log(rests);
    }
}

export function logInfo(...args: any[]) {
    logWrapper(0, args);
}

export function logWarn(...args: any[]) {
    logWrapper(1, args);
}

export function logError(...args: any[]) {
    logWrapper(-1, args);
}
