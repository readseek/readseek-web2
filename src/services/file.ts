import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { getDocumentLoader } from "@/utils/langchain/documentLoader";
import { getSplitterDocument } from "@/utils/langchain/splitter";
import { getFileType } from "@/utils";


const createEmbeddings = async (faPath: string) => {
  try {
    console.time('createEmbeddings')

    const { name, ext } = path.parse(faPath);
    const fileType = getFileType(ext)

    const loader = getDocumentLoader(fileType, faPath)
    const document = await loader.load();
    

    const splitDocuments = await getSplitterDocument(fileType, document);
    if (Array.isArray(splitDocuments)) {
      splitDocuments.map((doc) => {
        doc.metadata = { file_name: name };
      });
    }

    console.timeEnd('createEmbeddings')

    return splitDocuments
  } catch (error) {
    console.warn('createEmbeddings',error)
    return null
  }  
};

export const fileUpload = async (data: any) => {
    // const fileName = uuidv4();
    // const fileType = file.name.split(".").pop()!;

    // const formData = new FormData();
    // formData.append("file", file);

    const testFile = '/Users/tangkunyin/dev-workspace/OpenSource/ruhekandai/public/upload/富甲美国.pdf';

    const ret = await createEmbeddings(testFile);

    return new Response(JSON.stringify({ message: "upload success!", data: ret }), {
      status: 200,
    });
};





