'use server';

import { writeFile } from 'node:fs';
import path from 'node:path';

import { absolutePath } from './common';
import { logInfo, logWarn } from './logger';

export function writeToFile(content: object, fPath?: string) {
    try {
        const localPath = path.join(absolutePath(fPath ?? '~/Downloads'), `RSNOut_${new Date().toISOString()}.txt`);
        writeFile(localPath, JSON.stringify(content, null, 4), 'utf8', (err: any) => {
            if (!err) {
                logInfo('File have been create: ', localPath);
            }
        });
    } catch (error) {
        logWarn(error);
    }
}
