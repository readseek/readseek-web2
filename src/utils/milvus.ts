import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';
import { systemLog } from './common';

let milvusClient: MilvusClient;

function getMilvusClient(): MilvusClient {
    if (!milvusClient) {
        systemLog(0, 'MilvusClient sdkInfo: ', MilvusClient.sdkInfo);
        return new MilvusClient('localhost:19530');
    }
    return milvusClient;
}

async function storeInMilvus(embedding, metadata) {
    const collectionName = 'pdf_embeddings';

    // Ensure the collection exists
    const hasCollection = await milvusClient.hasCollection({
        collection_name: collectionName,
    });

    if (!hasCollection) {
        await milvusClient.createCollection({
            collection_name: collectionName,
            fields: [
                {
                    name: 'id',
                    data_type: DataType.Int64,
                    is_primary_key: true,
                    auto_id: true,
                },
                {
                    name: 'embedding',
                    data_type: DataType.FloatVector,
                    dim: embedding.length,
                },
                {
                    name: 'metadata',
                    data_type: DataType.JSON,
                },
            ],
        });
    }

    // Insert the embedding
    await milvusClient.insert({
        collection_name: collectionName,
        fields_data: [
            {
                embedding: Array.from(embedding), // Convert to regular array if it's not already
                metadata: JSON.stringify(metadata),
            },
        ],
    });
}
