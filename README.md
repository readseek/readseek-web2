# 搜读

一个神奇的网站！

## 功能说明

> TODO...

- [ ] 文档上传
- [ ] 数据提取、转录
- [ ] 基于语义的关键词搜索
- [ ] 在线聊天（基于现有知识库）

## 技术栈

- nextjs: <https://nextjs.org/learn/dashboard-app/getting-started>
- shadcnUI: <https://ui.shadcn.com/docs>
- 预训练模型：
  - BGE-M3：<https://huggingface.co/BAAI/bge-m3>
  - all-MiniLM-L6-v2：<https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2>
  - text-embedding-ada-002：<https://huggingface.co/Xenova/text-embedding-ada-002>

## AI相关

### Transformer

> 有两种方式调用来自Hugging Face的模型：

1. 官方：`@huggingface/inference`以及`tokenizers@latest`
2. xenova出品：<https://www.npmjs.com/package/@xenova/transformers>

PS：<u>xenova貌似为Hugging Face的员工，目前有个[@huggingface/transformers](https://www.npmjs.com/package/@huggingface/transformers)的库，不过目前处于`3.0.0-alpha.xx`版本，如果直接调用`transformers`，可能还是需要直接使用：`@xenova/transformers`，这个目前版本是`2.7.12`</u>

### 本地模型

通过**optimum-cli**导出并存放在本地，作为项目公共库

1. ~/.onnx_models/all-MiniLM-L6-v2/model.onnx
2. ~/.onnx_models/bge-m3/model.onnx

#### 关于onnx的文档

[JavaScript版本的onnx](https://onnxruntime.ai/docs/get-started/with-javascript/node.html)可以说没有正式文档，可能官方觉得过于简单了吧，所以基本上只能去github看源码、以及看象征性的[例子](https://github.com/microsoft/onnxruntime-inference-examples/tree/main/js)去使用...

### Tokenizer

如果不用xenova开发的`transformers.js`，则需要自己找`tokenizer`的库！需要注意：

1. HG官方包`@huggingface/inference`里没有`tokenizer`方法，而且Node文档写的也比较勉强；
2. 虽然提供[Tokenizer](https://github.com/huggingface/tokenizers/tree/main/bindings/node)的Nodejs解决方案，但是不太容易找到入口、而且有一年没有更新了，并且官方的示例代码都比较旧；
3. 官方的node工程里没有native modules，这就以为着`Cannot find module 'tokenizers-darwin-arm64'`类似的错都会遇到，详见：[issues](https://github.com/huggingface/tokenizers/issues/1403), [PR-1459](https://github.com/huggingface/tokenizers/pull/1459) 和 [PR-6](https://github.com/turingscript/tokenizers/pull/6)

如果能忍受这些坑点，那就接着起航吧...

```bash
pnpm add tokenizers@latest
```

#### 解决原生模块的错误问题

<u>种种迹象说明，想通过Nodejs愉快的玩，往往会让人血压一路飙升...</u>

## 其他套件

- UI自动生成器：<https://v0.dev/>
