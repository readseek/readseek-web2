## 搜读

一个神奇的网站！

## 功能说明

> TODO...

-   [ ] 文档上传
-   [ ] 数据提取、转录
-   [ ] 基于语义的关键词搜索
-   [ ] 在线聊天（基于现有知识库）

## 技术栈

-   nextjs: https://nextjs.org/learn/dashboard-app/getting-started
-   shadcnUI: https://ui.shadcn.com/docs
-   预训练模型：
    -   BGE-M3：https://huggingface.co/BAAI/bge-m3
    -   all-MiniLM-L6-v2：https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    -   text-embedding-ada-002：https://huggingface.co/Xenova/text-embedding-ada-002

## AI模型

通过**optimum-cli**导出并存放在本地，作为项目公共库

1. ~/.onnx_models/all-MiniLM-L6-v2/model.onnx
2. ~/.onnx_models/bge-m3/model.onnx

## 其他

-   UI自动生成器：https://v0.dev/
