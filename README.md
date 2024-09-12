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

### Tokenizer

如果不用xenova开发的`transformers.js`，则需要自己找`tokenizer`的库，官方`@huggingface/inference`包里没有`tokenizer`方法，还有官方Node文档写的比较勉强，这点比较坑！
好在Hugging Face还是提供了[Tokenizer](https://github.com/huggingface/tokenizers/tree/main/bindings/node)的Nodejs解决方案，但是不太容易找到入口、而且有一年没有更新了...

```bash
pnpm add tokenizers@latest
```

## 其他套件

- UI自动生成器：<https://v0.dev/>
