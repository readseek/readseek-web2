import path from 'node:path';
import * as ort from 'onnxruntime-node';
import { Tokenizer } from 'tokenizers';
import { absolutePath } from './index';
// @ts-ignore
import { Tensor } from 'onnxruntime-node';

const MODEL_LOCAL_ROOT_PATH = '~/.onnx_models';
const enum ModelType {
    BGE_M3 = 'bge-m3/model.onnx',
    ALL_MiniLM_L6_V2 = 'all-MiniLM-L6-v2/model.onnx',
}

export const loadOnnxModel = async (type: ModelType) => {
    const modelPath = absolutePath(path.join(MODEL_LOCAL_ROOT_PATH, type));
    // @ts-ignore
    const session = await ort.InferenceSession.create(modelPath);
    return session;
};

export const createEmbeddings = async (text: any) => {
    const session: any = loadOnnxModel(ModelType.BGE_M3);

    // Use Hugging Face tokenizer to tokenize the input text
    const tokenizer = new Tokenizer({ model: 'sentence-transformers/all-mpnet-base-v2' });
    const inputs = tokenizer.encode(text);

    const inputIds = new Tensor('int64', inputs.input_ids, [1, inputs.input_ids.length]);
    const attentionMask = new Tensor('int64', inputs.attention_mask, [1, inputs.attention_mask.length]);

    // Create the feeds for the model
    const feeds = {
        input_ids: inputIds,
        attention_mask: attentionMask,
    };

    // Run inference
    const output = await session.run(feeds);

    // Extract and return the embeddings (usually the output is the 'pooler_output' or 'last_hidden_state')
    const embeddings = output['last_hidden_state'].data;
    return embeddings;
};
