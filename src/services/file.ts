import { KeyConfiguration, LlamaIndex } from "@/types";
import { CHAT_FILES_MAX_SIZE } from "@/utils/app/const";
import { validFileSize } from "@/utils/app/files";
import { v4 as uuidv4 } from "uuid";


const uploadFile = async (file: File) => {
    const fileName = uuidv4();
    const fileType = file.name.split(".").pop()!;

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`/api/files?fileName=${fileName}.${fileType}`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          console.log("save file failed:", fileName);
          throw new Error(`save file failed:, ${fileName}`);
        }
      })
      .then(async (data: any) => {
        console.log("save file success:", fileName);
        await saveEmbeddings(fileName, fileType);
        onIndexChange({
          indexName: fileName,
          indexType: fileType.split(".").pop()!,
        });
      });
  };

  const saveEmbeddings = async (fileName: string, fileType: string) => {
    await fetch("/api/embedding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-type": keyConfiguration.apiType ?? "",
        "x-api-key": keyConfiguration.apiKey ?? "",
        "x-api-model": keyConfiguration.apiModel ?? "",
        "x-azure-api-key": keyConfiguration.azureApiKey ?? "",
        "x-azure-instance-name": keyConfiguration.azureInstanceName ?? "",
        "x-azure-api-version": keyConfiguration.azureApiVersion ?? "",
        "x-azure-deployment-name": keyConfiguration.azureDeploymentName ?? "",
        "x-azure-embedding-deployment-name":
          keyConfiguration.azureEmbeddingDeploymentName ?? "",
      },
      body: JSON.stringify({
        fileName: fileName,
        fileType: fileType,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const message = await res.text();
        console.log("save embedding failed: ", message);
        throw new Error(`save embedding failed: ' ${message}`);
      }
    });
  };

  const deleteFile = async (fileTempName: string) => {
    await fetch(`/api/files?fileName=${fileTempName}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data: any) => {
        // onIndexChange({indexName: data.indexName, indexType: data.indexType});
        console.log("import file index json name:", data);
      });
  };