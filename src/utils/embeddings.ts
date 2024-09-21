import { getOnnxModel } from '@/constants/OnnxModel';
import { Tokenizer } from '@turingscript/tokenizers';
// @ts-ignore
import { InferenceSession, Tensor } from 'onnxruntime-node';

let session: any;
let tokenizer: Tokenizer;

export const createEmbeddings = async (text: any) => {
    let embeddings = null;
    try {
        if (!session) {
            const { localPath, localTokenizerPath, type } = getOnnxModel();
            session = await InferenceSession.create(localPath);
            if (!tokenizer && localTokenizerPath) {
                tokenizer = Tokenizer.fromFile(localTokenizerPath);
                console.log('preTokenizer and its type', tokenizer.getPreTokenizer(), type);
            }
        }

        // Create the feeds for the model
        const inputs = await tokenizer.encode('Hello World.');
        const Ids = inputs.getIds();
        const attentionMask = inputs.getAttentionMask();

        // Run local inference
        const output = await session.run({
            input_ids: new Tensor('int64', Ids, [1, Ids.length]),
            attention_mask: new Tensor('int64', attentionMask, [1, attentionMask.length]),
        });

        // embeddings = output['last_hidden_state'].data;

        embeddings = output;
    } catch (error) {
        console.error(error);
    }
    return embeddings;
};
