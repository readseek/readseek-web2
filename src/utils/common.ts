import { DocumentType } from '@/types';
import chalk from 'chalk';
import os from 'node:os';
import path from 'node:path';

export const getFullTime = () => {
    const formattedDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Hong_Kong',
        hour12: false,
        fractionalSecondDigits: 3,
    });
    return formattedDate.replace(/\//g, '-');
};

export const systemLog = (level: 0 | 1 | -1, ...args: any[]) => {
    if (!process.env.__RSN_ENV || process.env.__RSN_ENV === 'dev') {
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
        _log(...args);
    }
};

export const absolutePath = (ps: string): string => {
    if (ps.startsWith('~/')) {
        // Replace '~' with the home directory
        return path.resolve(os.homedir(), ps.slice(2));
    }
    return path.resolve(ps, '');
};

export const validFileSize = (size: number): string => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(0)}${units[i]}`;
};

export const getFileType = (ext: string): DocumentType => {
    if (!ext || ext.split('.').length === 0) {
        return DocumentType.UNKNOWN;
    }
    return ext.split('.').pop()! as DocumentType;
};

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let lastFunc: ReturnType<typeof setTimeout>;
    let lastRan: number;
    return ((...args) => {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(
                () => {
                    if (Date.now() - lastRan >= limit) {
                        func(...args);
                        lastRan = Date.now();
                    }
                },
                limit - (Date.now() - lastRan),
            );
        }
    }) as T;
};
