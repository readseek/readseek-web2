'use client';

import Image from 'next/image';
import { useState } from 'react';

interface RemoteImageProps {
    src: string;
    alt?: string;
    fill?: boolean;
}

export function RemoteImage({ src, alt = undefined, fill = false }: RemoteImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    const defaultAlt = alt || src.split('/').pop() || `@${src}`;
    const contentLayouts = fill
        ? { fill: true }
        : {
              style: {
                  width: '100%',
                  height: 'auto',
              },
              width: 1080,
              height: 720,
          };

    return (
        <div className={`h-full w-full ${fill ? 'relative' : ''}`}>
            {isLoading && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
            <Image
                src={src}
                alt={defaultAlt}
                priority={true}
                decoding="auto"
                sizes="(max-width: 768px) 100vw, (max-width: 1440px) 50vw, 33vw"
                className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                {...contentLayouts}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}

export function LocalImage({ file, ext = 'svg' }: { file: string; ext?: string }) {
    return (
        <div className="relative h-full w-full">
            <Image src={`/assets/${file}.${ext}`} alt={file} fill={true} priority={true} unoptimized={true} className="object-scale-down" sizes="(max-width: 768px) 100vw, (max-width: 1440px) 50vw, 33vw" />
        </div>
    );
}

export function AvatarDefault({ male = true }: { male?: boolean }) {
    return <LocalImage file={male ? 'profile_male' : 'profile_female'} />;
}

export function NodataImage({ message = '很抱歉，暂未获取到数据' }: { message?: string }) {
    return (
        <div className="h-64 w-1/6">
            <LocalImage file="no_data" />
            <h3 className="mt-7 w-full text-center text-base leading-10 text-slate-500">{message}</h3>
        </div>
    );
}

export function SuccessImage({ message = '恭喜你，操作成功！' }: { message?: string }) {
    return (
        <div className="h-64 w-1/6">
            <LocalImage file="success" />
            <h3 className="mt-7 w-full text-center text-base leading-10 text-slate-500">{message}</h3>
        </div>
    );
}

export function LoadingImage({ message = '正在准备数据，请稍候...' }: { message?: string }) {
    return (
        <div className="h-64 w-1/6">
            <LocalImage file="loading" />
            <h3 className="mt-7 w-full text-center text-base leading-10 text-slate-500">{message}</h3>
        </div>
    );
}

export function ErrorImage({ message = '很不幸，服务器异常...' }: { message?: string }) {
    return (
        <div className="h-64 w-1/6">
            <LocalImage file="50X" />
            <h3 className="mt-7 w-full text-center text-base leading-10 text-slate-500 underline">{message}</h3>
        </div>
    );
}

export function WarnImage({ message = '请注意，即将有事发生...' }: { message?: string }) {
    return (
        <div className="h-64 w-1/6">
            <LocalImage file="warning" />
            <h3 className="mt-7 w-full text-center text-base leading-10 text-slate-500 underline">{message}</h3>
        </div>
    );
}
