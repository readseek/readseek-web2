import { v4 as uuidv4 } from "uuid";

const createEmbeddings = async (data: any) => {

  return {
    id: 123,
    name: 'createEmbeddings'
  }
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


export const fileDelete = async (file: File) => {
  return new Response(JSON.stringify({ message: "file delete success!" }), {
    status: 200,
  });
};


