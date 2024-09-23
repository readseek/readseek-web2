import { getFileType, systemLog } from '@/utils/common';
import { createEmbeddings } from '@/utils/embeddings';
import { getUnstructuredLoader } from '@/utils/langchain/documentLoader';
import { getSplitterDocument } from '@/utils/langchain/splitter';
import type { Document } from 'langchain/document';
import type { NextRequest } from 'next/server';
import path from 'node:path';

const saveEmbeddings = async (faPath: string) => {
    try {
        const { name, ext } = path.parse(faPath);
        const fileType = getFileType(ext);

        const loader = getUnstructuredLoader(faPath);
        const documents: Document[] = await loader.load();
        const splitDocuments = await getSplitterDocument(documents);

        if (Array.isArray(splitDocuments)) {
            splitDocuments.map((doc: any) => {
                doc.metadata = { file_name: name, file_type: fileType };
            });
        }

        const docEmbeddings = await createEmbeddings(splitDocuments);

        return docEmbeddings;
    } catch (error) {
        systemLog(1, 'createEmbeddings', error);
        return null;
    }
};

export const fileUpload = async (req: NextRequest): Promise<APIRet> => {
    // const fileName = uuidv4();
    // const fileType = file.name.split(".").pop()!;

    // const formData = new FormData();
    // formData.append("file", file);

    const filePath = path.resolve('public/upload/', 'Milvus.md');

    const ret = await saveEmbeddings(filePath);

    return { code: 0, data: ret, message: 'success' };
};
