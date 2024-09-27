import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';
import { DocumentType } from '../types';
import { systemLog } from './common';

const CollectionNameWithFileType = (type: DocumentType) => {
    return `RS_DOC_${type.toLocaleUpperCase()}_Embeddings`;
};

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
                    logLevel: 'warn',
                    pool: {
                        max: 5,
                        min: 1,
                        autostart: true,
                        idleTimeoutMillis: 1000 * 60 * 5,
                    },
                });
            } catch (error) {
                systemLog(-1, `Failed to connect Milvus with address ${this.MILVUS_ADDRESS} and username ${this.MILVUS_USERNAME}`, error);
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

    private static async checkCollection(collectionName: string, dim: number) {
        const ret = await this.milvusClient?.hasCollection({
            collection_name: collectionName,
        });
        if (!ret?.value) {
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
            if (res?.code !== 0) {
                systemLog(-1, 'Failed to create collection', res?.reason);
                return false;
            }
        }
        return true;
    }

    public static async saveDocument(embeddings: Array<number>, { metadata, dim }: { metadata: any; dim: number }) {
        if (!(await this.checkHealth())) {
            return false;
        }

        // 一类文件，一个collection
        const collectionName = CollectionNameWithFileType(metadata.fileType);
        systemLog(0, 'Using collection: ', collectionName);

        if (!(await this.checkCollection(collectionName, dim))) {
            return false;
        }

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
        if (res?.status?.code === 0) {
            return true;
        }

        return false;
    }

    public static async searchDocument(embeddings: Array<number>, metadata: any) {
        if (!(await this.checkHealth())) {
            return false;
        }

        const collectionName = CollectionNameWithFileType(metadata.fileType);
        systemLog(0, `searchingDocument ${collectionName}, metadata is: `, metadata);

        return true;
    }

    public static async deleteDocument(embeddings: Array<number>, metadata: any) {
        if (!(await this.checkHealth())) {
            return false;
        }

        const collectionName = CollectionNameWithFileType(metadata.fileType);
        systemLog(0, `deletingDocument ${collectionName}, metadata is: `, metadata);

        return true;
    }

    public static async closeConnection() {
        const res = await this.milvusClient?.closeConnection();
        systemLog(1, 'milvusClient closed: ', res);
    }
}
