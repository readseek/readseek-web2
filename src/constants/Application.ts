import { isDevModel } from '@/utils/common';

export const API_HOST = 'https://api.readseek.com';

export const LOGIN_URL = isDevModel() ? 'http://localhost:4455' : API_HOST;

export const API_URL = (path: string) => {
    if (typeof path === 'string') {
        return (isDevModel() ? 'http://localhost:4455' : API_HOST) + path;
    }
    return '';
};
