# 搜读

一个神奇的网站！

## 主要功能

- [ ] 通用文本文档上传和存储，支持格式有：TXT、PDF、EPUB、DOC、DOCX、CSV、TSV、MARKDOWN、HTML；
- [ ] 数据提取、转录(Text==>Embeddings)；
- [ ] 关键字模糊检索，支持基于文本内容的对聊；
- [ ] 支持内容以音频形式播放、导出音频及语音对聊；

## 如何使用

> 由于目前大模型均在本地运行，因此暂不提供线上版本。

### 依赖情况

1. Milvus：需本地安装或使用远程服务，本机推荐[docker-standalone](https://milvus.io/docs/install_standalone-docker-compose.md)方式；
2. PostgreSQL：同Milvus；

**数据库配置信息均在.env文件中**

### 本地运行

> 由于模型文件需要从HuggingFace处下载，因此本地要保证科学联网。否则项目将无法运行！

1. 下载源码，通过pnpm安装所有依赖；
2. 执行`pnpm run dev`，详见`scripts`内的命令；

## 技术实现

[搜读（Webapp）概述](https://mn.tangkunyin.com/docs/strategic/%E8%87%AA%E7%A0%94%E4%BA%A7%E5%93%81/%E8%BF%AD%E4%BB%A3%E8%AE%B0%E5%BD%95/ReadseekNext)
