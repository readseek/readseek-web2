'use server';

import path from 'node:path';

import { absolutePath } from '@/utils/common';

export const UPLOAD_PATH = path.join(process.cwd(), process.env.__RSN_UPLOAD_PATH ?? 'public/uploads');

export const MODEL_ROOT_PATH = absolutePath(process.env.__RSN_LOCAL_MODEL_ROOT_PATH ?? '~/.llm_onnx');
