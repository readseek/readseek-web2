'use server';

import path from 'node:path';

import { Agent } from 'undici';

import { absolutePath } from '@/utils/common';

export const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH ?? 'public/uploads');

export const MODEL_ROOT_PATH = absolutePath(process.env.__RSN_LOCAL_MODEL_ROOT_PATH ?? '~/.llm_onnx');

/**
 * 以下hack解决：
 * 1、UND_ERR_HEADERS_TIMEOUT: https://github.com/langchain-ai/langchainjs/issues/1856
 * 2、对于较大文件，仍然有响应超时的问题（TODO:）
 code: 'UND_ERR_SOCKET',
    socket: {
      localAddress: '127.0.0.1',
      localPort: 64589,
      remoteAddress: '127.0.0.1',
      remotePort: 8000,
      remoteFamily: 'IPv4',
      timeout: undefined,
      bytesWritten: 58178047,
      bytesRead: 0
} 
 */
const __timeout = 1000 * 60 * 60 * 12; // 12h
globalThis[Symbol.for('undici.globalDispatcher.1')] = new Agent({
    allowH2: true,
    headersTimeout: __timeout,
    bodyTimeout: 0,
    keepAliveMaxTimeout: __timeout,
});
