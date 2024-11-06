'use client';

import { useState } from 'react';

import { useToast } from '@/components/ui/use-toast';
import { validFileSize } from '@/utils/common';
import { logError, logInfo, logWarn } from '@/utils/logger';

interface Props {
    onFileSelected: (file: File) => void;
}

const supportFileType = ['pdf', 'epub', 'docx', 'txt', 'md'];
const supportFileExts = supportFileType.map(item => `.${item}`);

export const UploadBox = ({ onFileSelected }: Props) => {
    const { toast } = useToast();
    const [uploadFile, setUploadFile] = useState<string>();

    const handleFile = async (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const file: File = e.target.files[0];
            const sizeUnits = validFileSize(file.size);
            logInfo(`上传文件大小为: ${sizeUnits}`);

            if (file.size / 1000 / 1024 > 200) {
                toast({
                    title: '温馨提醒',
                    description: `要发布的文件体积${sizeUnits}，已超过最大限额200MB，请重新选择...`,
                });
                return false;
            }

            if (!supportFileType.includes(file.name.split('.').pop()!)) {
                toast({
                    title: '温馨提醒',
                    description: `请上传支持的文件类型：${supportFileType.join(' ,')}`,
                });
                return false;
            }

            setUploadFile(`${file.name}, ${sizeUnits}, 将被发布`);

            if (onFileSelected) {
                onFileSelected(file);
            }
        }
    };

    return (
        <div className="center w-full">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">{'支持的文件类型：TXT, PDF, EPUB, Markdown, DOCX'}</p>
                </div>
                {uploadFile ? <p className="text-md text-gray-600 underline">{uploadFile}</p> : undefined}
                <input id="dropzone-file" type="file" className="hidden" accept={supportFileExts.join(',')} multiple={false} required={true} onChange={handleFile} />
            </label>
        </div>
    );
};
