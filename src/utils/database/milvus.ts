'use server';

import type { EmbeddingTextItem } from '../embeddings';

import { DataType, MilvusClient, QueryReq, SearchSimpleReq, LoadState, FieldType, IndexType, MetricType, SearchReq, SearchResults, QueryResults } from '@zilliz/milvus2-sdk-node';

import { logError, logInfo, logWarn } from '@/utils/logger';

type CollectionSearchParams = SearchReq | SearchSimpleReq;

type CollectionQueryParams = QueryReq;

export default class MilvusDB {
    private static readonly MILVUS_DBNAME = process.env.__RSN_MILVUS_DBName || 'default';
    private static readonly MILVUS_USERNAME = process.env.__RSN_MILVUS_USERNAME || 'root';
    private static readonly MILVUS_ADDRESS = process.env.__RSN_MILVUS_ADDRESS || '127.0.0.1:19530';

    private static LoadedCollnections = [];

    private static _milvusClient: MilvusClient;
    private static get milvusClient(): MilvusClient | null {
        if (!this._milvusClient) {
            logInfo('MilvusClient sdkInfo: ', MilvusClient.sdkInfo);
            try {
                this._milvusClient = new MilvusClient({
                    database: this.MILVUS_DBNAME,
                    username: this.MILVUS_USERNAME,
                    address: this.MILVUS_ADDRESS,
                    timeout: 90,
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

    private static async releaseCollection(collectionName?: string): Promise<void> {
        const release = async (name: string) => {
            const resp = await this.milvusClient?.getLoadState({ collection_name: name });
            if (resp?.state === LoadState.LoadStateLoaded) {
                const status = await this.milvusClient?.releaseCollection({ collection_name: name });
                logWarn(`Collection ${name} was release: `, status);
            }
        };
        if (collectionName) {
            release(collectionName);
        } else {
            this.LoadedCollnections.forEach((colName: string) => {
                release(colName);
            });
        }
    }

    private static async loadCollection(name: string): Promise<boolean> {
        try {
            const resp = await this.milvusClient?.getLoadState({ collection_name: name });
            if (resp?.state === LoadState.LoadStateLoaded) {
                return true;
            }
            const loadResp = await this.milvusClient?.loadCollection({ collection_name: name });
            return loadResp?.code === 0;
        } catch (error) {
            logError('Collection load error: ', error);
        }
        return false;
    }

    private static async checkAndCreateDB(): Promise<boolean> {
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

    private static async checkAndCreateCollection(collectionName: string, dim: number): Promise<boolean> {
        try {
            if (await this.checkAndCreateDB()) {
                const ret = await this.milvusClient?.hasCollection({
                    collection_name: collectionName,
                });
                if (!ret?.value) {
                    logInfo(`No collection found, ${collectionName} will be created soon...`);
                    const collectionFields: FieldType[] = [
                        {
                            name: 'id',
                            description: 'segment id',
                            data_type: DataType.Int64,
                            is_primary_key: true,
                            autoID: true,
                        },
                        {
                            name: 'meta',
                            description: 'meta data for current document',
                            data_type: DataType.JSON,
                        },
                        {
                            name: 'text',
                            description: 'segment original text',
                            data_type: DataType.VarChar,
                            max_length: 8192,
                        },
                        {
                            name: 'embedding',
                            description: 'segment embedding vector',
                            data_type: DataType.FloatVector,
                            dim,
                        },
                    ];
                    const indexParams = [
                        {
                            field_name: 'embedding',
                            index_type: IndexType.IVF_FLAT,
                            metric_type: MetricType.COSINE,
                            params: { nlist: 1024 },
                        },
                    ];
                    const res = await this.milvusClient?.createCollection({
                        fields: collectionFields,
                        index_params: indexParams,
                        collection_name: collectionName,
                        description: `Text search with file ${collectionName}`,
                    });
                    if (res?.code !== 0) {
                        logError('Failed to create collection', res?.reason);
                        return false;
                    }
                }
                return true;
            }
        } catch (error) {
            logError('checkAndCreateCollection error', error);
        }
        return false;
    }

    public static async deleteCollection(collectionName: string): Promise<boolean> {
        try {
            const ret = await this.milvusClient?.dropCollection({
                collection_name: collectionName,
            });
            logWarn(`Collection ${collectionName} was dropped, error_code: `, ret?.error_code);
            return ret?.code === 0;
        } catch (error) {
            logError('error on deleteCollection: ', error);
        } finally {
            this.releaseCollection();
        }
        return false;
    }

    public static async saveCollection(data: any, collectionName: string): Promise<boolean> {
        const { textItems, dim, metas } = data;

        if (!textItems || textItems.length === 0 || dim === 0) {
            throw new Error('textItems or dim can not be empty');
        }

        try {
            if (!(await this.checkAndCreateCollection(collectionName, dim))) {
                return false;
            }
            // Batch Insert the embeddings
            const res = await this.milvusClient?.insert({
                collection_name: collectionName,
                fields_data: textItems.map((item: EmbeddingTextItem, index: number) => {
                    return {
                        text: item.text,
                        meta: metas[index],
                        embedding: item.embedding,
                    };
                }),
            });
            return res?.status?.code === 0;
        } catch (error) {
            logError('error on saveCollection: ', error);
        }
        return false;
    }

    /**
     * Find similar vectors based on embeddings.
     * @param {colName, vector, outPuts}
     * @returns {SearchResults}
     */
    public static async searchCollection(params: Record<string, any>): Promise<SearchResults> {
        const { colName, vector, outPuts } = params;
        if (!(await this.loadCollection(colName))) {
            throw new Error('Collection load failed, searching break...');
        }
        return (await this.milvusClient?.search({
            topk: 3,
            limit: 5,
            collection_name: colName,
            metric_type: MetricType.COSINE,
            anns_field: 'embedding',
            output_fields: outPuts,
            vector,
        } as CollectionSearchParams)) as SearchResults;
    }

    /**
     * Retrieve scalar data based on structured filters only.
     * @param {colName, vector, outPuts}
     * @returns {QueryResults}
     */
    public static async queryCollection(params: Record<string, any>): Promise<QueryResults> {
        const { colName, vector, outPuts } = params;
        if (!(await this.loadCollection(colName))) {
            throw new Error('Collection load failed, querying break...');
        }
        // TODO: 没有针对query场景进行适配！
        return (await this.milvusClient?.query({
            topk: 3,
            limit: 5,
            collection_name: colName,
            metric_type: MetricType.COSINE,
            anns_field: 'embedding',
            output_fields: outPuts,
            vector,
        } as CollectionQueryParams)) as QueryResults;
    }
}
