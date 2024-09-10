import * as ort from 'onnxruntime-node';

export const loadOnnxModel = async (modelPath: string) => {
    const session = await ort.InferenceSession.create(modelPath);
};
