import { DocumentType } from '@/types';
import chalk from 'chalk';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

export function getFullTime() {
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
}

export function systemLog(level: 0 | 1 | -1, ...args: any[]) {
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
}

export function absolutePath(ps: string): string {
    if (ps.startsWith('~/')) {
        // Replace '~' with the home directory
        return path.resolve(os.homedir(), ps.slice(2));
    }
    return path.resolve(ps, '');
}

export function validFileSize(size: number): string {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(0)}${units[i]}`;
}

export function getFileType(ext: string): DocumentType {
    if (!ext || ext.split('.').length === 0) {
        return DocumentType.UNKNOWN;
    }
    return ext.split('.').pop()! as DocumentType;
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
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
}

export function isJSONObject(val: any): boolean {
    if (val && typeof val === 'object') {
        return true;
    }
    try {
        if (typeof val === 'string') {
            const result = JSON.parse(val);
            return typeof result === 'object' && result !== null;
        }
    } catch (e) {
        systemLog(1, 'JSON.parse input: ', val);
    }
    return false;
}

export async function getFileHash(fileStream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256'); // 64
        fileStream.on('data', data => {
            hash.update(data);
        });
        fileStream.on('end', () => {
            resolve(hash.digest('hex'));
        });
        fileStream.on('error', err => {
            systemLog(-1, err);
            reject(err?.message);
        });
    });
}
