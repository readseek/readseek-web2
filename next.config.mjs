/** @type {import('next').NextConfig} */
import i18next from './next-i18next.config.mjs';

const isDev = process.env.__RSN_ENV === 'dev' ? true : false;

const nextConfig = {
    swcMinify: true,
    i18n: i18next.i18n,
    reactStrictMode: true,

    productionBrowserSourceMaps: isDev,

    // transpilePackages: ['@turingscript/tokenizers'],

    experimental: {
        serverSourceMaps: isDev,
        serverComponentsExternalPackages: ['level', 'onnxruntime-node', '@turingscript/tokenizers', '@zilliz/milvus2-sdk-node'],
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.tangkunyin.com',
                pathname: '/assets/**',
                port: '',
            },
            {
                protocol: 'https',
                hostname: '*.readseek.com',
                pathname: '/assets/**',
                port: '',
            },
        ],
        // for development
        unoptimized: isDev,
        formats: ['image/avif', 'image/webp'],
    },

    // 这项配置还有点问题：https://github.com/payloadcms/payload/issues/7501
    // outputFileTracingIncludes: {
    //     // When deploying to Vercel, the following configuration is required
    //     '/api/**/*': ['node_modules/@zilliz/milvus2-sdk-node/dist/proto/**/*'],
    // },
};

export default nextConfig;
