'use server';

import type { EmbeddingTextItem } from '../embeddings';

import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';

import { logError, logInfo, logWarn } from '@/utils/logger';

/**
 * https://milvus.io/docs/manage-collections.md
 * Collection and entity are similar to tables and records in relational databases.
 * In this project, every stand-alone file has its own Collection.
 */
const CollectionWithFileName = (name: string): string => {
    return `RS_DOC_${name.toLocaleUpperCase()}`;
};

export default class MilvusDB {
    private static readonly MILVUS_ADDRESS = process.env.__RSN_MILVUS_ADDRESS || '127.0.0.1:19530';
    private static readonly MILVUS_USERNAME = process.env.__RSN_MILVUS_USERNAME || 'root';

    private static _milvusClient: MilvusClient;

    public static get milvusClient(): MilvusClient | null {
        if (!this._milvusClient) {
            logInfo('MilvusClient sdkInfo: ', MilvusClient.sdkInfo);
            try {
                this._milvusClient = new MilvusClient({
                    address: this.MILVUS_ADDRESS,
                    username: this.MILVUS_USERNAME,
                    timeout: 120,
                    logLevel: 'warn',
                    pool: {
                        max: 10,
                        min: 2,
                        autostart: true,
                        idleTimeoutMillis: 1000 * 60 * 5,
                    },
                });
            } catch (error) {
                logError(`Failed to connect Milvus with address ${this.MILVUS_ADDRESS} and username ${this.MILVUS_USERNAME}`, error);
                return null;
            }
        }
        return this._milvusClient;
    }

    public static async closeConnection(): Promise<void> {
        const res = await this.milvusClient?.closeConnection();
        logWarn('milvusClient closed: ', res);
    }

    public static async checkHealth(): Promise<boolean | undefined> {
        const res = await this.milvusClient?.checkHealth();
        logWarn('Checking MilvusDB Health: ', res || 'failed');
        return res?.isHealthy;
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

    public static async saveDocument(data: any): Promise<boolean> {
        if (!(await this.checkHealth())) {
            return false;
        }

        const { textItems, fileName, dim, metas } = data;

        // one type doc one collection
        const collectionName = CollectionWithFileName(fileName);
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
            logError('error on saveDocument: ', res, error);
        }
        return false;
    }

    public static async deleteDocument(fileName: string): Promise<boolean> {
        if (!(await this.checkHealth())) {
            return false;
        }
        try {
            const collectionName = CollectionWithFileName(fileName);

            const ret = await this.milvusClient?.dropCollection({
                collection_name: collectionName,
                timeout: 15,
            });
            logWarn(`previous collection ${collectionName} was dropped, error_code: `, ret?.error_code);
            return ret?.code === 0;
        } catch (error) {
            logError('error on deleteDocument: ', error);
        }
        return false;
    }

    public static async searchDocument(embeddings: Array<number>, fileName: string) {
        if (!(await this.checkHealth())) {
            return false;
        }

        const collectionName = CollectionWithFileName(fileName);
        logInfo(`searchingDocument ${collectionName}, fileName is: `, fileName);

        return true;
    }
}
