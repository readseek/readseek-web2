# 搜读技术架构及说明

> 声明：

1. 基于Nodejs
2. 能在本地跑的，都在本地

## 技术栈

- nextjs: <https://nextjs.org/learn/dashboard-app/getting-started>
- shadcnUI: <https://ui.shadcn.com/docs>
- 预训练模型：
  - BGE-M3：<https://huggingface.co/BAAI/bge-m3>
  - all-MiniLM-L6-v2：<https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2>
  - text-embedding-ada-002：<https://huggingface.co/Xenova/text-embedding-ada-002>

## 各AI套件作用和依赖关系

> 本章节主要以搜读所用到的技术点来说明，不表示所述套件的全部功能和用途。

### Milvus

提供向量数据库应有的能力，不过一切都是本地化服务。搜读使用本地Docker化环境开发...

### Langchian

**加载本地文档，并分割其内容**

由于`langchain.js`本地库对于非结构化数据处理不太理想，所以用到了[unstructured](https://unstructured.io)

### ONNX Runtime

> 使用转换为 ONNX 的HG模型创建嵌入模型(createEmbeddings)

主包`onnxruntime-node`，其官方文档稀烂，特别是没有`typings`定义。在引用依赖时需要自己定义`.d.ts`文件

1. 通过`InferenceSession`加载本地模型
2. 通过`Tensor`构建特征数据

#### 本地模型

通过**optimum-cli**导出并存放在本地，作为项目公共库

1. ~/.onnx_models/all-MiniLM-L6-v2/model.onnx
2. ~/.onnx_models/bge-m3/model.onnx

#### 关于onnx的文档

[JavaScript版本的onnx](https://onnxruntime.ai/docs/get-started/with-javascript/node.html)可以说没有正式文档，可能官方觉得过于简单了吧，所以基本上只能去github看源码、以及看象征性的[例子](https://github.com/microsoft/onnxruntime-inference-examples/tree/main/js)去使用...

### Hugging Face LLMs

分为`@huggingface/inference`和`@turingscript/tokenizers`两个包，其中后者为基于官方的升级包（主要解决原生模块引用的问题）

1. inference：通过APIKey加载远程模型，通过模型创建Embeddings并调用模型的推理能力。**若不直接使用HG Hub的模型，这个包可以不用**

- <https://huggingface.co/docs/huggingface.js/index>

2. tokenizer：负责将`langchian split`的结果转化为大模型能直接处理的数据。**若本地化运行，一定需要这个**

- <https://huggingface.co/docs/tokenizers/pipeline>

#### Transformer

有两种方式调用来自Hugging Face的模型：

1. 官方：`@huggingface/inference`，直接通过API Key调用；
2. xenova出品：<https://www.npmjs.com/package/@xenova/transformers>

PS：<u>目前有个[@huggingface/transformers](https://www.npmjs.com/package/@huggingface/transformers)的库，不过目前处于`3.0.0-alpha.xx`版本，如果直接调用`transformers`，可能还是需要直接使用：`@xenova/transformers`，这个目前版本是`2.7.12`</u>

#### Tokenizer

> 如果不用官方的API调用，也不使用xenova开发的`transformers.js`，则需要自己处理`tokenizer`。注意事项：

1. HG官包`@huggingface/xxx`系列并不包括`tokenizers`，它是一个看似独立的包`tokenizers@latest`；
2. 虽然提供[Tokenizer](https://github.com/huggingface/tokenizers/tree/main/bindings/node)的Nodejs解决方案，但是不太容易找到入口、而且有一年没有更新了，并且官方的示例代码都比较旧；
3. 官仓构建后**缺失native modules**，这就会导致`Cannot find module 'tokenizers-darwin-arm64'`类似的错误，详见：[issues](https://github.com/huggingface/tokenizers/issues/1403), [PR-1459](https://github.com/huggingface/tokenizers/pull/1459) 和 [PR-6](https://github.com/turingscript/tokenizers/pull/6)
4. 官方示例（走投无路时可以参考）：<https://github.com/huggingface/tokenizers/blob/main/bindings/node/examples/documentation/pipeline.test.ts>

如果能忍受这些坑点，那就接着起航吧...

```bash
# 前文提过，通过这个方式安装的依赖，运行时会出现：Cannot find module
pnpm add tokenizers@latest

# 因此需要换成这个
pnpm add @turingscript/tokenizers
```

基于Nextjs的项目，还需要额外配置：

```javascript
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node', '@turingscript/tokenizers'],
    },
};
```

<u>种种迹象说明，想通过Nodejs愉快的玩，往往会让人血压一路飙升...</u>
