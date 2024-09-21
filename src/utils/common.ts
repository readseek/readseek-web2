import { DocumentType } from '@/types';
import os from 'node:os';
import path from 'node:path';

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
