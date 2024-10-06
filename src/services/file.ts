import { getFileType, systemLog } from '@/utils/common';
import { deleteEmbeddings, saveEmbeddings } from '@/utils/embeddings';
import { getUnstructuredLoader } from '@/utils/langchain/documentLoader';
import { getSplitterDocument } from '@/utils/langchain/splitter';
import type { Document } from 'langchain/document';
import type { NextRequest } from 'next/server';
import path from 'node:path';

async function parseFileContent(faPath: string) {
    try {
        const { name, ext } = path.parse(faPath);
        const fileType = getFileType(ext);

        const loader = getUnstructuredLoader(faPath);
        const documents: Document[] = await loader.load();
        const splitDocuments = await getSplitterDocument(documents);

        if (Array.isArray(splitDocuments) && splitDocuments.length > 0) {
            const content = {
                metadata: {
                    fileName: name,
                    fileType: fileType,
                    title: splitDocuments[0].pageContent || splitDocuments[0].metadata.filename,
                },
                sentences: splitDocuments.map(doc => doc.pageContent),
            };
            return await saveEmbeddings(content);
        }
    } catch (error) {
        systemLog(-1, 'parseFileContent error: ', error);
    }
    return false;
}

export async function fileUpload(req: NextRequest): Promise<APIRet> {
    // const fileName = uuidv4();
    // const fileType = file.name.split(".").pop()!;

    // const formData = new FormData();
    // formData.append("file", file);

    const filePath = path.resolve('public/upload/', 'Milvus.md');

    const ret = await parseFileContent(filePath);

    return { code: 0, data: ret, message: 'success' };
}

export async function fileDelete(req: NextRequest): Promise<APIRet> {
    const ret = await deleteEmbeddings('Milvus.md');
    return { code: 0, data: ret, message: 'success' };
}
