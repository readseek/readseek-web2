'use server';

import path from 'node:path';

import { Level } from 'level';

import { logError, logInfo, logWarn } from '@/utils/logger';

import { isJSONObject } from '../common';

const LevelDB_PATH = path.join(process.cwd(), process.env.__RSN_LevelDB_PATH ?? '.leveldb_data');

class LevelDBWrapper {
    private db: Level;

    constructor(dbPath: string) {
        logInfo('LevelDB path is: ', dbPath);
        this.db = new Level(dbPath, { keyEncoding: 'utf8', valueEncoding: 'utf8' });
    }

    private async close() {
        try {
            await this.db.close();
            logWarn('LevelDB has been closed.');
        } catch (err) {
            logError(`LevelDB has closed error: `, err);
        }
    }

    public async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== null && value !== undefined;
    }

    public async get(key: string | number): Promise<any> {
        try {
            if (await this.checkStatus()) {
                const value = await this.db.get(`${key}`);
                if (isJSONObject(value)) {
                    return JSON.parse(value);
                }
                return value;
            }
        } catch (err: any) {
            logWarn(`LevelDB no key '${key}' found, code is:`, err?.code);
        }
        return null;
    }

    public async put(key: string | number, value: any): Promise<boolean> {
        try {
            if (await this.checkStatus()) {
                if (isJSONObject(value)) {
                    await this.db.put(`${key}`, JSON.stringify(value));
                } else {
                    await this.db.put(`${key}`, `${value}`);
                }
                return true;
            }
        } catch (err: any) {
            logError(`LevelDB put [key: ${key}] error`, err?.code);
        }
        return false;
    }

    public async delete(key: string, all?: boolean): Promise<boolean> {
        try {
            if (await this.checkStatus()) {
                if (all) {
                    for await (const k of this.db.keys()) {
                        await this.db.del(k);
                    }
                } else {
                    await this.db.del(key);
                }
                return true;
            }
        } catch (err: any) {
            logError(`LevelDB delete error`, err?.code);
        }
        return false;
    }

    public async checkStatus(): Promise<boolean> {
        if (this.db.status === 'closed') {
            try {
                await this.db.open({ createIfMissing: true, multithreading: true, compression: true });
            } catch (err) {
                logError(`LevelDB opening error`, err);
                return false;
            }
        }
        return true;
    }
}

export default class LevelDB {
    private static dbWrapper: LevelDBWrapper;
    private constructor() {}

    public static get getSharedDB(): LevelDBWrapper {
        if (!this.dbWrapper) {
            this.dbWrapper = new LevelDBWrapper(LevelDB_PATH);
        }
        return this.dbWrapper;
    }
}
