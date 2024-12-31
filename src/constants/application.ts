import { isDevModel } from '@/utils/common';

export const enum GET_URI {
    initChat = 'initChat',
    fileTags = 'fileTags',
    fileCategories = 'fileCategories',
    fileList = 'fileList',
    // user's info
    userFiles = 'userFiles',
    userProfile = 'userProfile',
    // only for dev and admin debug
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
    syncMessage = 'syncMessage',
}

export const API_HOST = 'https://api.readseek.com';

export const LOGIN_URL = isDevModel() ? 'http://localhost:4455' : API_HOST;

export const API_URL = (path: string) => {
    if (typeof path === 'string') {
        return (isDevModel() ? 'http://localhost:4455' : API_HOST) + path;
    }
    return '';
};
