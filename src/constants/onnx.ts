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
