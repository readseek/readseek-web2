import { logError } from '@/utils/logger';

import PipelineManager from './pipeline';

export type GeneratorOptions = {
    topK?: number;
    maxTime?: number; // computation timeout in seconds
    maxLength?: number;
    minTokens?: number;
    maxTokens?: number;
    outputScores?: boolean;
    removeInvalidValues?: boolean;
    generationArgs?: Record<string, any>; //Additional generation kwargs will be forwarded to the `generate` function of the model.
};

export async function generateSummarization(text: string, options?: GeneratorOptions): Promise<string> {
    try {
        const task = await PipelineManager.getTaskLine('summarizer');
        const results = await task(text, {
            max_time: options?.maxTime ?? 120,
            max_length: options?.maxLength ?? 20,
            output_scores: options?.outputScores ?? true,
            min_new_tokens: options?.minTokens ?? null,
            max_new_tokens: options?.maxTokens ?? null,
            remove_invalid_values: options?.removeInvalidValues ?? true,
        });
        if (Array.isArray(results)) {
            const response: string = results?.map((item: any) => item.summary_text).join('');
            return response.trimStart();
        }
    } catch (error) {
        logError(error);
    }
    return '';
}

export async function generateText(question: string | string[], context: string | string[], options?: GeneratorOptions): Promise<string[]> {
    try {
        // QuestionAnsweringPipeline
        const task = await PipelineManager.getTaskLine('qa');
        const results = await task(question, context, {
            top_k: options?.topK ?? 1,
        });
        return results;
    } catch (error) {
        logError(error);
    }
    return [];
}

export async function generateTextFromImage(img: string | URL, question: string | string[], options?: GeneratorOptions): Promise<string[]> {
    try {
        // DocumentQuestionAnsweringPipeline
        const task = await PipelineManager.getTaskLine('dqa');
        const results = await task(img, question, {
            max_time: options?.maxTime ?? 120,
            max_length: options?.maxLength ?? 20,
            output_scores: options?.outputScores ?? true,
            min_new_tokens: options?.minTokens ?? null,
            max_new_tokens: options?.maxTokens ?? null,
            remove_invalid_values: options?.removeInvalidValues ?? true,
        });
        return results;
    } catch (error) {
        logError(error);
    }
    return [];
}
