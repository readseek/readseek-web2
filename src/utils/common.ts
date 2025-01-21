import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

import { DocumentType } from '@/models/Document';
import { logError } from '@/utils/logger';

export const isBrowserModel = ((): boolean => {
    try {
        return typeof window === 'object' && typeof document === 'object';
    } catch (error) {
        console.warn(error);
        return false;
    }
})();

export function isDevModel(): boolean {
    return Boolean(process.env.__RSN_ENV && (process.env.__RSN_ENV === 'dev' || process.env.__RSN_ENV === 'development'));
}

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

/**
 * e.g. getFileType('.md') ==> MARKDOWN
 * @param ext fileExt
 * @returns DocumentType KEY
 */
export function getFileType(ext: string): DocumentType {
    const type = ext.replace(/\./g, '');
    for (const [key, value] of Object.entries(DocumentType)) {
        if (value === type) {
            return key as DocumentType;
        }
    }
    return type as never;
}

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timer: any;
    return ((...args) => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            // @ts-ignore
            func.apply(this, args);
        }, delay);
    }) as T;
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle = false;
    return ((...args) => {
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(() => {
                // @ts-ignore
                func.apply(this, args);
                inThrottle = false;
            }, limit);
        }
    }) as T;
}

export function isJSONObject(val: any): boolean {
    try {
        if (val && typeof val === 'object') {
            return true;
        } else if (typeof val === 'string') {
            const result = JSON.parse(val);
            return typeof result === 'object' && result !== null;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

export async function getFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        const fileStream = Readable.fromWeb(file.stream());
        const hash = crypto.createHash('sha256'); // 64
        fileStream.on('data', data => {
            hash.update(data);
        });
        fileStream.on('end', () => {
            resolve(hash.digest('hex'));
        });
        fileStream.on('error', err => {
            logError(err);
            reject(err?.message);
        });
    });
}
