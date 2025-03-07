# Readseek

A magical website, inspired by [this project](https://github.com/guangzhengli/ChatFiles).

## Main Features

- [ ] General text document upload and storage, supporting formats: TXT, PDF, EPUB, DOC, CSV/TSV, MARKDOWN, HTML
- [ ] Data extraction and transcription (Text==>Embeddings)
- [ ] Fuzzy keyword search, supporting text-based conversations
- [ ] Support for content playback in audio format, audio export, and voice chat

## How to Use

> Currently, the large language models run locally, so no online version is provided.

### System Requirements

- CPU: 4+ cores
- Memory: 16GB+
- OS: macOS preferred

### Dependencies

1. Milvus: Requires local installation or remote service, recommended [docker-standalone](https://milvus.io/docs/install_standalone-docker-compose.md) method for local setup
2. PostgreSQL: Same as Milvus

**All database configuration information is in the .env file**

### Local Development

> As model files need to be downloaded from HuggingFace, ensure proper internet access. Otherwise, the project won't run!

1. Download source code, install all dependencies using pnpm
2. Run `pnpm run dev`, see commands in `scripts` for details

## Technical Implementation

[Readseek (Webapp) Overview](https://mn.tangkunyin.com/docs/strategic/%E8%87%AA%E7%A0%94%E4%BA%A7%E5%93%81/%E8%BF%AD%E4%BB%A3%E8%AE%B0%E5%BD%95/ReadseekNext)
