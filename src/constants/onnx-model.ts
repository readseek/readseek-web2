'use server';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { absolutePath } from '@/utils/common';
import { logError, logInfo } from '@/utils/logger';

export type ModelType = 'similarity' | 'summarization' | 'text-generation' | 'image-generation';

/**
 * Value is the same as its location dir-name where onnx file it is.
 */
export const enum ModelName {
    allMiniLML6v2 = 'all-MiniLM-L6-v2', // default for embeddings
    gteMultilingualBase = 'gte-multilingual-base',
    t5Summary = 't5-summary-enruzh-base-2048',
    bloomz560m = 'bloomz-560m',
}

export interface OnnxModel {
    name: ModelName;
    type: ModelType;
    path: string;
    tokenizerPath: string;
    maxContextLength: number; // max text input length
    outputDimension: number; // hidden_size
    tokenSize: number; // max_position_embeddings
    vocabSize: number; // vocab_size
}

export function getModelConfig(name: string, rootPath: string): any {
    try {
        const basePath = absolutePath(path.join(rootPath, name));
        if (!existsSync(basePath || '')) {
            logError('Base path for onnx llm model is not exists.');
            return null;
        }

        const { hidden_size, max_position_embeddings, vocab_size } = JSON.parse(readFileSync(path.join(basePath, '/config.json'), 'utf8'));
        return {
            name,
            onnx: path.join(basePath, '/model.onnx'),
            tokenizer: path.join(basePath, '/tokenizer.json'),
            outputDimension: hidden_size,
            tokenSize: max_position_embeddings,
            vocabSize: vocab_size,
        };
    } catch (error) {
        logError(error);
    }
    return null;
}

export function onnxModelWith(type: ModelType, name?: ModelName): OnnxModel {
    const rootPath = process.env.__RSN_LOCAL_MODEL_ROOT_PATH as string;
    if (!rootPath) {
        throw new Error('__RSN_LOCAL_MODEL_ROOT_PATH is not defined, check .env file');
    }

    let model_name = '';
    switch (type) {
        case 'similarity':
            model_name = name ? name : ModelName.allMiniLML6v2;
            break;
        case 'summarization':
            model_name = name ? name : ModelName.t5Summary;
            break;
        case 'text-generation':
            model_name = name ? name : ModelName.bloomz560m;
            break;
        case 'image-generation':
            model_name = name ? name : ModelName.bloomz560m;
            break;
        default:
            throw new Error(`Illegal model type ${type}`);
    }

    const config = getModelConfig(model_name, rootPath);
    if (config) {
        const { name, onnx, tokenizer, outputDimension, tokenSize, vocabSize } = config;
        logInfo(`Using LLM Model: ${name}, tokenSize: ${tokenSize}`);
        return {
            name,
            type,
            path: onnx,
            tokenizerPath: tokenizer,
            outputDimension,
            tokenSize,
            vocabSize,
            maxContextLength: 1000,
        };
    }

    throw new Error(`Illegal onnx model config`, config);
}
