/** @type {import('next').NextConfig} */
import i18next from './next-i18next.config.mjs';

const nextConfig = {
    i18n: i18next.i18n,
    reactStrictMode: true,

    experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
};

export default nextConfig;
