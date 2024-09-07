import { getFileType } from '@/utils';
import { getDocumentLoader } from '@/utils/langchain/documentLoader';
import { getSplitterDocument } from '@/utils/langchain/splitter';
import type { Document } from 'langchain/document';
import type { NextRequest } from 'next/server';
import path from 'node:path';

const createEmbeddings = async (faPath: string) => {
    try {
        console.time('createEmbeddings');

        const { name, ext } = path.parse(faPath);
        const fileType = getFileType(ext);

        const loader = getDocumentLoader(fileType, faPath);
        const document: Document[] = await loader.load();
        const splitDocuments = await getSplitterDocument(
            fileType,
            document.map((doc) => doc.pageContent),
        );

        if (Array.isArray(splitDocuments)) {
            splitDocuments.map((doc) => {
                doc.metadata = { file_name: name };
            });
        }

        console.timeEnd('createEmbeddings');
        return splitDocuments;
    } catch (error) {
        console.warn('createEmbeddings', error);
        return null;
    }
};

export const fileUpload = async (req: NextRequest): Promise<APIRet> => {
    // const fileName = uuidv4();
    // const fileType = file.name.split(".").pop()!;

    // const formData = new FormData();
    // formData.append("file", file);

    const testFile = '/Users/tangkunyin/dev-workspace/OpenSource/ruhekandai/public/upload/富甲美国.pdf';

    const ret = await createEmbeddings(testFile);

    return { code: 0, data: ret, message: 'success' };
};
