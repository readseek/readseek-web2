import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';
import { systemLog } from './common';

export default class MilvusDB {
    private static readonly MILVUS_ADDRESS = process.env.__RSN_MILVUS_ADDRESS || '127.0.0.1:19530';
    private static readonly MILVUS_USERNAME = process.env.__RSN_MILVUS_USERNAME || 'root';

    private static _milvusClient: MilvusClient;

    public static get milvusClient(): MilvusClient | null {
        if (!this._milvusClient) {
            systemLog(0, 'MilvusClient sdkInfo: ', MilvusClient.sdkInfo);
            try {
                this._milvusClient = new MilvusClient({
                    address: this.MILVUS_ADDRESS,
                    username: this.MILVUS_USERNAME,
                    timeout: 180,
                    logLevel: 'debug',
                    pool: {
                        max: 5,
                        min: 1,
                        autostart: true,
                        idleTimeoutMillis: 1000 * 60 * 5,
                    },
                });
            } catch (error) {
                systemLog(-1, `Failed to connect to Milvus with address ${this.MILVUS_ADDRESS} and username ${this.MILVUS_USERNAME}`);
                return null;
            }
        }
        return this._milvusClient;
    }

    public static async checkHealth() {
        const res = await this.milvusClient?.checkHealth();
        systemLog(res ? 0 : 1, 'Checking MilvusDB Health: ', res || 'failed');
        return res?.isHealthy;
    }

    private static async createCollection(collectionName: string, dim: number) {
        const hasCollection = await this.milvusClient?.hasCollection({
            collection_name: collectionName,
        });
        if (!hasCollection) {
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
                        name: 'metadata',
                        data_type: DataType.JSON,
                    },
                    {
                        name: 'embedding',
                        description: 'sentence embedding vector',
                        data_type: DataType.FloatVector,
                        type_params: {
                            dim,
                        },
                    },
                ],
            };

            const res = await this.milvusClient?.createCollection(params);
            systemLog(0, 'createCollection res: ', res);
            if (res?.code == 0) {
                systemLog(-1, 'Failed to create collection', res);
                return false;
            }
            return true;
        }
    }

    public static async saveDocument(embeddings: Array<number>, { metadata, dim }: { metadata: any; dim: number }) {
        if (!(await this.checkHealth())) {
            return false;
        }

        const collectionName = `${metadata.fileName}_embeddings`;
        await this.createCollection(collectionName, dim);

        // Insert the embedding
        const res = await this.milvusClient?.insert({
            collection_name: collectionName,
            fields_data: [
                {
                    embedding: embeddings,
                    metadata: JSON.stringify(metadata),
                },
            ],
        });
        systemLog(0, 'saveDocument res: ', res);
        return true;
    }
}
