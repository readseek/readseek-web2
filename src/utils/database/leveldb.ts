'use server';

import path from 'node:path';

import { Level } from 'level';

import { logError, logWarn } from '@/utils/logger';

import { isJSONObject } from '../common';

export default class LevelDB {
    static #db: Level;
    static get db() {
        if (!this.#db) {
            try {
                const DB_PATH = path.join(process.cwd(), process.env.__RSN_LevelDB_PATH ?? '.leveldb_data');
                this.#db = new Level(DB_PATH, { prefix: 'readseek-node-', createIfMissing: true });
            } catch (error) {
                logError(error);
            }
        }
        return this.#db;
    }

    public static async close() {
        try {
            await this.db.close();
            logWarn('LevelDB has been closed.');
        } catch (err) {
            logError(`LevelDB has closed error: `, err);
        }
    }

    public static async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== null && value !== undefined;
    }

    public static async get(key: string | number): Promise<any> {
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

    public static async put(key: string | number, value: any): Promise<boolean> {
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

    public static async delete(key: string, all?: boolean): Promise<boolean> {
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

    public static async checkStatus(): Promise<boolean> {
        if (this.db.status === 'closed') {
            try {
                await this.db.open({ maxFileSize: 10 * 1024 * 1024, maxOpenFiles: 3000, blockSize: 8192, cacheSize: 16 * 1024 * 1024 });
            } catch (err) {
                logError(`LevelDB opening error`, err);
                return false;
            }
        }
        return true;
    }
}
