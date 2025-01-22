import { isBrowserModel, isDevModel } from '@/utils/common';

export const enum GET_URI {
    // for conversation
    convHistory = 'convHistory',
    // for document file
    fileTags = 'fileTags',
    fileCategories = 'fileCategories',
    fileList = 'fileList',
    fileQuery = 'fileQuery',
    // user's info
    userFiles = 'userFiles',
    userProfile = 'userProfile',
    // only for dev debug
    __test = '__test',
    __env = '__env',
    __files = '__files',
    ___users = '___users',
}

export const enum POST_URI {
    convInit = 'convInit',
    convChat = 'convChat',
    fileUpload = 'fileUpload',
    fileDelete = 'fileDelete',
    userLogin = 'userLogin',
    userUpdate = 'userUpdate',
    userCancellation = 'userCancellation',
}

export type API_PATH = GET_URI | POST_URI;

export const API_HOST = 'https://api.readseek.com';

export const LOGIN_URL = isDevModel() ? 'http://localhost:4455' : API_HOST;

export const API_URL = (path: API_PATH) => {
    if (isBrowserModel) {
        return `/api/web/${path}`;
    }
    return (isDevModel() ? 'http://localhost:4455' : API_HOST) + `/api/web/${path}`;
};

export function buildUrl(url: string, params?: Record<string, any>) {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }

    const queryString = Object.keys(params)
        .map(key => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        })
        .join('&');

    return `${url}?${queryString}`;
}
