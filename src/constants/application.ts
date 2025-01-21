import { isBrowserModel, isDevModel } from '@/utils/common';

export const enum GET_URI {
    initChat = 'initChat',
    fileTags = 'fileTags',
    fileCategories = 'fileCategories',
    fileList = 'fileList',
    // user's info
    userFiles = 'userFiles',
    userProfile = 'userProfile',
    // only for dev and admin debug
    test = 'test',
    sys_env = 'sys_env',
    sys_files = 'sys_files',
    sys_users = 'sys_users',
    // for conversation
    historyList = 'historyList',
}

export const enum POST_URI {
    fileUpload = 'fileUpload',
    fileDelete = 'fileDelete',
    fileSearch = 'fileSearch',
    fileQuery = 'fileQuery',
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
