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

export const HOST_URL = 'https://api.readseek.com';

export const LOGIN_URL = isDevModel() ? 'http://localhost:4455' : HOST_URL;

export const API_URL = (path: string) => {
    if (typeof path === 'string') {
        if (isBrowserModel) {
            return path;
        }
        return (isDevModel() ? 'http://localhost:4455' : HOST_URL) + path;
    }
    return '';
};
