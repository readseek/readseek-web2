import chalk from 'chalk';

import { isDevModel, getFullTime } from './common';

function logWrapper(...args: any[]) {
    if (isDevModel() && args.length > 1) {
        const _log = (logs: any[]) => {
            switch (args[0] as number) {
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
        _log(args[1]);
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
