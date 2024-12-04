'use client';

import Image from 'next/image';
import { useState } from 'react';

export function LocalImage(name: string, ext = 'svg') {
    return (
        <div className="relative h-full w-full">
            <Image src={`assets/${name}.${ext}`} alt={name} sizes="100vw" fill className="object-contain" />
        </div>
    );
}

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
                loading="lazy"
                decoding="auto"
                sizes="(max-width: 1200px) 100vw, (max-width: 1920px) 50vw, 33vw"
                className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                {...contentLayouts}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}

export function LoadingImage() {
    return LocalImage('loading');
}

export function NodataImage() {
    return (
        <div className="h-1/3 w-1/6">
            {LocalImage('no_data')}
            <h3 className="mt-7 w-full text-center text-lg italic leading-10 text-slate-500">NO DATA FOUND</h3>
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
