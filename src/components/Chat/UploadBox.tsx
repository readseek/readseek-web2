'use client';

import type { FormState, FieldValues } from 'react-hook-form';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import { validFileSize } from '@/utils/common';
import { logInfo, logWarn } from '@/utils/logger';

interface Props {
    field?: any;
    formState?: FormState<FieldValues>;
    disabled?: boolean;
}

const supportFileType = ['txt', 'md', 'pdf', 'epub', 'csv', 'tsv', 'doc', 'docx'];

export const UploadBox = ({ field, formState, disabled = false }: Props) => {
    const [uploadFile, setUploadFile] = useState<File>();

    useEffect(() => {
        if (!formState?.dirtyFields?.file) {
            setUploadFile(undefined);
        }
    }, [formState]);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (Array.isArray(acceptedFiles) && acceptedFiles.length > 0) {
                const file: File = acceptedFiles[0];

                if (uploadFile?.size === file.size && uploadFile?.lastModified === file.lastModified) {
                    logInfo('与上次选择的文件一致', uploadFile.name, file.name);
                    return false;
                }

                const sizeUnits = validFileSize(file.size);
                logInfo(`所选文件大小为: ${sizeUnits}`);

                if (file.size / 1000 / 1024 > 100) {
                    logWarn(`文件体积${sizeUnits}，已超过最大限额100MB，请重新选择...`);
                    return false;
                }

                if (!supportFileType.includes(file.name.split('.').pop()!)) {
                    logWarn(`请上传支持的文件类型：${supportFileType.join(' ,')}`);
                    return false;
                }

                setUploadFile(file);

                field?.onChange(file);
            }
        },
        [field, uploadFile],
    );

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'text/*': ['.txt', '.md', '.csv', '.tsv'],
            'application/pdf': [],
            'application/epub+zip': [],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        autoFocus: false,
        maxFiles: 1,
        minSize: 1024,
        maxSize: 1024 * 1024 * 100, // 最大限额100MB
        noClick: true,
        onDrop,
    });

    return (
        <div {...getRootProps()} className="center w-full">
            <label
                htmlFor="dropzone-file"
                className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg aria-hidden="true" className="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{'点击上传'}</span> {'或者 把文件拖到此处放下'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{`支持的文件类型: ${supportFileType.join(',')}`}</p>
                </div>
                {uploadFile ? <p className="text-md italic text-gray-600">{`File: ${uploadFile.name}, lastModified: ${new Date(uploadFile.lastModified).toLocaleString()}`}</p> : null}
                <input id="dropzone-file" name={field?.name || 'file'} type="file" className="hidden" {...getInputProps()} disabled={disabled} />
            </label>
        </div>
    );
};
