'use client';

import Image from 'next/image';
import { useState } from 'react';

import { logWarn } from '@/utils/logger';

export function LocalImage(name: string, ext = 'svg') {
    return <Image src={`assets/${name}.${ext}`} alt={name} priority={false} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" fill className="block" />;
}

/**
 * Image with loading state
 * @param src url | file path
 * @param alt image alt
 * @returns LoadingImage
 */
export function RemoteImage(src: string, alt?: string) {
    const [isLoading, setIsLoading] = useState(true);

    let defaultAlt = `@${src}`;
    try {
        defaultAlt = src.split('/').reverse()[0];
    } catch (e) {
        logWarn(e);
    }

    return (
        <div className="relative">
            {isLoading && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
            <Image src={src} alt={defaultAlt} priority={true} loading={'lazy'} width={1200} height={800} className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} onLoadingComplete={() => setIsLoading(false)} />
        </div>
    );
}

export function LoadingImage() {
    return LocalImage('loading');
}

export function NodataImage() {
    return (
        <div className="h-1/3 w-1/6">
            <div className="relative h-full w-full">{LocalImage('no_data')}</div>
            <h3 className="w-full text-center text-lg italic leading-10 text-slate-500">no data found...</h3>
        </div>
    );
}

export function SuccessImage() {
    return LocalImage('success');
}

export function WarnImage() {
    return LocalImage('warning');
}

export function ErrorImage() {
    return LocalImage('50X');
}

export function AvatarDefault(male = true) {
    return LocalImage(male ? 'profile_male' : 'profile_female');
}
