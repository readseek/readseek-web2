import path from 'node:path';
// @ts-ignore
import { InferenceSession, Tensor } from 'onnxruntime-node';
import { Tokenizer } from 'tokenizers';
import { absolutePath } from './index';

const LOCAL_MODEL_ROOT_PATH = '~/.onnx_models';

const loadOnnxModel = async (modelPath: string) => {
    return InferenceSession.create(modelPath);
};

export const enum ModelType {
    BGE_M3 = 'bge-m3',
    ALL_MiniLM_L6_V2 = 'all-MiniLM-L6-v2',
}

export const createEmbeddings = async (text: any, type?: ModelType) => {
    const modelPath = absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, type ? `${type}/model.onnx` : `${ModelType.BGE_M3}/model.onnx`));
    const tokenizerPath = absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, type ? `${type}/tokenizer.json` : `${ModelType.BGE_M3}/tokenizer.json`));

    const session: any = await loadOnnxModel(modelPath);

    const tokenizer = await Tokenizer.fromFile(tokenizerPath);
    const inputs = await tokenizer.encode(text);

    const Ids = inputs.getIds();
    const attentionMask = inputs.getAttentionMask();

    // Create the feeds for the model
    const feeds = {
        input_ids: new Tensor(Ids, [1, Ids.length]),
        attention_mask: new Tensor(attentionMask, [1, attentionMask.length]),
    };

    // Run inference
    const output = await session.run(feeds);

    // Extract and return the embeddings (usually the output is the 'pooler_output' or 'last_hidden_state')
    const embeddings = output['last_hidden_state'].data;
    return embeddings;
};
