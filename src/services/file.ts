import { v4 as uuidv4 } from "uuid";
import { getDocumentLoader } from "@/utils/langchain/documentLoader";
import { getSplitterDocument } from "@/utils/langchain/splitter";

const testFile = '/Users/tangkunyin/dev-workspace/OpenSource/ruhekandai/public/upload/富甲美国.pdf'

const createEmbeddings = async (data: any) => {

  const loader = getDocumentLoader('pdf', testFile)

  const document = await loader.load();

  return document
};

export const fileUpload = async (data: any) => {
    // const fileName = uuidv4();
    // const fileType = file.name.split(".").pop()!;

    // const formData = new FormData();
    // formData.append("file", file);

    const ret = await createEmbeddings(data);

    return new Response(JSON.stringify({ message: "upload success!", data: ret }), {
      status: 200,
    });
};





