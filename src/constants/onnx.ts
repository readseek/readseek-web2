/**
 *  Onnx model {name: task}
 */
export const OnnxModel = {
    'all-MiniLM-L6-v2': 'feature-extraction',

    'bloomz-560m': 'text-generation',

    'distilbart-cnn-6-6': 'summarization',

    'donut-base-finetuned-docvqa': 'document-question-answering',

    'distilbert-base-uncased-distilled-squad': 'question-answering',

    speecht5_tts: 'text-to-speech',

    't5-small': 'translation',

    't5-summary-enruzh-base-2048': 'summarization',

    'whisper-tiny.en': 'automatic-speech-recognition',
};

export const OnnxSessionOptions = {
    enableCpuMemArena: true,
    enableMemPattern: true,
    executionMode: 'parallel',
    enableGraphCapture: true,
    graphOptimizationLevel: 'all',
    // 0 means use all available threads
    interOpNumThreads: 0,
    intraOpNumThreads: 0,
    logSeverityLevel: 3,
};

export const HuggingFacePath = (name: keyof typeof OnnxModel): string => {
    if (name === 'all-MiniLM-L6-v2') {
        return 'sentence-transformers/all-MiniLM-L6-v2';
    }
    if (name === 't5-summary-enruzh-base-2048') {
        return 'utrobinmv/t5_summary_en_ru_zh_base_2048';
    }
    if (name === 'bloomz-560m') {
        return 'bigscience/bloomz-560m';
    }
    if (name === 'distilbart-cnn-6-6') {
        return 'Xenova/distilbart-cnn-6-6';
    }
    if (name === 'donut-base-finetuned-docvqa') {
        return 'Xenova/donut-base-finetuned-docvqa';
    }
    if (name === 'distilbert-base-uncased-distilled-squad') {
        return 'Xenova/distilbert-base-uncased-distilled-squad';
    }
    if (name === 't5-small') {
        return 'Xenova/t5-small';
    }
    if (name === 'whisper-tiny.en') {
        return 'Xenova/whisper-tiny.en';
    }
    if (name === 'speecht5_tts') {
        return 'Xenova/speecht5_tts';
    }
    throw new Error('Illegal model name');
};
