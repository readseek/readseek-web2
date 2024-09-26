/** @type {import('next').NextConfig} */
import i18next from './next-i18next.config.mjs';

const nextConfig = {
    i18n: i18next.i18n,
    reactStrictMode: true,

    experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node', '@turingscript/tokenizers', '@zilliz/milvus2-sdk-node'],
    },

    outputFileTracingIncludes: {
        // When deploying to Vercel, the following configuration is required
        '/api/**/*': ['node_modules/@zilliz/milvus2-sdk-node/dist/proto/**/*'],
    },
};

export default nextConfig;
