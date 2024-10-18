import path from 'node:path';

import { Level } from 'level';

import { isJSONObject, systemLog } from '../common';

const LevelDB_PATH = path.join(process.cwd(), process.env.__RSN_LevelDB_PATH ?? 'levelDB_v8');

class LevelDBWrapper {
    private db: Level;

    constructor(dbPath: string) {
        systemLog(0, 'LevelDB path is: ', dbPath);
        this.db = new Level(dbPath, { keyEncoding: 'utf8', valueEncoding: 'utf8' });
    }

    private close() {
        try {
            this.db.close(() => {
                systemLog(1, 'LevelDB has closed.');
            });
        } catch (err) {
            systemLog(-1, `LevelDB has closed error: `, err);
        }
    }

    public async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== null && value !== undefined;
    }

    public async get(key: string): Promise<any> {
        try {
            if (await this.checkStatus()) {
                const value = await this.db.get(key);
                if (isJSONObject(value)) {
                    return JSON.parse(value);
                }
                return value;
            }
        } catch (err: any) {
            systemLog(1, `LevelDB no key '${key}' found, code is:`, err?.code);
        } finally {
            this.close();
        }
        return null;
    }

    public async put(key: string, value: any): Promise<void> {
        try {
            if (await this.checkStatus()) {
                if (isJSONObject(value)) {
                    await this.db.put(key, JSON.stringify(value));
                } else {
                    await this.db.put(key, `${value}`);
                }
            }
        } catch (err: any) {
            systemLog(-1, `LevelDB put [key: ${key}] error`, err?.code);
        } finally {
            this.close();
        }
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
            systemLog(-1, `LevelDB delete error`, err?.code);
        } finally {
            this.close();
        }
        return false;
    }

    public async checkStatus(): Promise<boolean> {
        if (this.db.status !== 'open') {
            try {
                await this.db.open({ createIfMissing: true, multithreading: true, compression: true });
            } catch (err) {
                systemLog(-1, `LevelDB opening error`, err);
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
