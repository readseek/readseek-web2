import { absolutePath } from '@/utils/common';
import path from 'node:path';

export const enum ModelName {
    ALL_MiniLM_L6_V2 = 'all-MiniLM-L6-v2', // English Prefer
    BGE_M3 = 'bge-m3', // Multilingual
    GTE_MULTILINGUAL_BASE = 'gte-multilingual-base', // Multilingual
}

export type OnnxModel = {
    type: 'Bert' | 'XLMRoberta'; // model_type
    outputDimension: number; // hidden_size
    tokenSize: number; // max_position_embeddings
    vocabSize: number; // vocab_size
    name?: ModelName;
    localPath?: string;
    localTokenizerPath?: string;
};

const LOCAL_MODEL_ROOT_PATH = '~/.onnx_models';

const ModelConfig: Record<ModelName, OnnxModel> = {
    [ModelName.ALL_MiniLM_L6_V2]: {
        type: 'Bert',
        outputDimension: 384,
        tokenSize: 512,
        vocabSize: 30522,
        localPath: absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, `${ModelName.ALL_MiniLM_L6_V2}/model.onnx`)),
        localTokenizerPath: absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, `${ModelName.ALL_MiniLM_L6_V2}/tokenizer.json`)),
    },
    [ModelName.BGE_M3]: {
        type: 'XLMRoberta',
        outputDimension: 1024,
        tokenSize: 8194,
        vocabSize: 250002,
        localPath: absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, `${ModelName.BGE_M3}/model.onnx`)),
        localTokenizerPath: absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, `${ModelName.BGE_M3}/tokenizer.json`)),
    },
    [ModelName.GTE_MULTILINGUAL_BASE]: {
        type: 'XLMRoberta',
        outputDimension: 768,
        tokenSize: 8192,
        vocabSize: 250048,
        localPath: absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, `${ModelName.GTE_MULTILINGUAL_BASE}/model.onnx`)),
        localTokenizerPath: absolutePath(path.join(LOCAL_MODEL_ROOT_PATH, `${ModelName.GTE_MULTILINGUAL_BASE}/tokenizer.json`)),
    },
};

export const getOnnxModel = (name: ModelName = ModelName.ALL_MiniLM_L6_V2): OnnxModel => {
    const model = ModelConfig[name];

    if (!model) {
        throw new Error(`Model ${name} not found`);
    }

    return model;
};
