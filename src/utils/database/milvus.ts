'use server';

import type { EmbeddingTextItem } from '../embeddings';

import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

import { logError, logInfo, logWarn } from '@/utils/logger';

export default class MilvusDB {
    private static readonly MILVUS_DBNAME = process.env.__RSN_MILVUS_DBName || 'default';
    private static readonly MILVUS_USERNAME = process.env.__RSN_MILVUS_USERNAME || 'root';
    private static readonly MILVUS_ADDRESS = process.env.__RSN_MILVUS_ADDRESS || '127.0.0.1:19530';

    private static _milvusClient: MilvusClient;

    public static get milvusClient(): MilvusClient | null {
        if (!this._milvusClient) {
            logInfo('MilvusClient sdkInfo: ', MilvusClient.sdkInfo);
            try {
                this._milvusClient = new MilvusClient({
                    database: this.MILVUS_DBNAME,
                    username: this.MILVUS_USERNAME,
                    address: this.MILVUS_ADDRESS,
                    timeout: 120,
                    maxRetries: 5,
                    logLevel: 'warn',
                    pool: {
                        max: 5,
                        min: 1,
                        autostart: true,
                        idleTimeoutMillis: 1000 * 60 * 5, // 5min
                    },
                });
            } catch (error) {
                logError(`Failed to connect milvus with db ${this.MILVUS_DBNAME} and username ${this.MILVUS_USERNAME}`, error);
                return null;
            }
        }
        return this._milvusClient;
    }

    public static async closeConnection(): Promise<void> {
        const res = await this.milvusClient?.closeConnection();
        logWarn('milvusClient closed: ', res);
    }

    public static async checkHealth(): Promise<boolean> {
        const res = await this.milvusClient?.checkHealth();
        if (!res?.isHealthy) {
            logWarn('Checking MilvusDB Health: ', res || 'failed');
            return false;
        }

        const listResp = await this.milvusClient?.listDatabases();
        if (!listResp?.db_names.includes(this.MILVUS_DBNAME)) {
            await this.milvusClient?.createDatabase({ db_name: this.MILVUS_DBNAME });
            await this.milvusClient?.useDatabase({ db_name: this.MILVUS_DBNAME });
            logInfo(`Database ${this.MILVUS_DBNAME} has been created`);
        }
        return true;
    }

    private static async checkCollection(collectionName: string, dim: number): Promise<boolean> {
        try {
            const ret = await this.milvusClient?.hasCollection({
                collection_name: collectionName,
            });
            if (!ret?.value) {
                logInfo(`No collection found, ${collectionName} will be created soon...`);
                const params = {
                    collection_name: collectionName,
                    fields: [
                        {
                            name: 'id',
                            description: 'primary key',
                            data_type: DataType.Int64,
                            is_primary_key: true,
                            autoID: true,
                        },
                        {
                            name: 'number',
                            description: 'tokenizer number in full document',
                            data_type: DataType.Int32,
                        },
                        {
                            name: 'text',
                            description: 'original text',
                            data_type: DataType.VarChar,
                            max_length: 8192,
                        },
                        {
                            name: 'embedding',
                            description: 'sentence embedding vector',
                            data_type: DataType.FloatVector,
                            type_params: {
                                dim,
                            },
                        },
                        {
                            name: 'metadata',
                            data_type: DataType.JSON,
                        },
                    ],
                };

                const res = await this.milvusClient?.createCollection(params);
                if (res?.code !== 0) {
                    logError('Failed to create collection', res?.reason);
                    return false;
                }
            }
            return true;
        } catch (error) {
            logError('checkCollection error', error);
        }
        return false;
    }

    public static async saveCollection(data: any, collectionName: string): Promise<boolean> {
        if (!(await this.checkHealth())) {
            return false;
        }

        const { textItems, dim, metas } = data;
        // one type doc one collection
        logInfo('Using collection: ', collectionName);

        if (!(await this.checkCollection(collectionName, dim))) {
            return false;
        }

        let res: any;
        try {
            // Insert the embedding
            res = await this.milvusClient?.insert({
                collection_name: collectionName,
                fields_data: textItems.map((item: EmbeddingTextItem, index: number) => {
                    return {
                        number: item.number,
                        text: item.text,
                        embedding: item.embedding,
                        metadata: metas[index],
                    };
                }),
            });
            if (res?.status?.code === 0) {
                return true;
            }
        } catch (error) {
            logError('error on saveCollection: ', res, error);
        }
        return false;
    }

    public static async deleteCollection(collectionName: string): Promise<boolean> {
        if (!(await this.checkHealth())) {
            return false;
        }
        try {
            const ret = await this.milvusClient?.dropCollection({
                collection_name: collectionName,
                timeout: 15,
            });
            logWarn(`previous collection ${collectionName} was dropped, error_code: `, ret?.error_code);
            return ret?.code === 0;
        } catch (error) {
            logError('error on deleteCollection: ', error);
        }
        return false;
    }

    public static async searchCollection(searchParams: any) {
        if (!(await this.checkHealth())) {
            return null;
        }

        try {
            logInfo('searchCollection searchParams: ', searchParams);
            const ret = await this.milvusClient?.search(searchParams);
            // const ret1 = await this.milvusClient?.hybridSearch(searchParams)
            return ret;
        } catch (error) {
            logError('error on searchCollection: ', error);
        }
        return null;
    }
}
