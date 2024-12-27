import { isDevModel } from '@/utils/common';

export const enum GET_URI {
    fileCategories = 'fileCategories',
    fileTags = 'fileTags',
    fileList = 'fileList',
    prepareChat = 'prepareChat',
    // user's info
    userFiles = 'userFiles',
    userProfile = 'userProfile',
    // only for dev and admin debug
    sys_env = 'sys_env',
    sys_files = 'sys_files',
    sys_users = 'sys_users',
}

export const enum POST_URI {
    fileUpload = 'fileUpload',
    fileDelete = 'fileDelete',
    fileChat = 'fileChat',
    userLogin = 'userLogin',
    userUpdate = 'userUpdate',
    userCancellation = 'userCancellation',
}

export const API_HOST = 'https://api.readseek.com';

export const LOGIN_URL = isDevModel() ? 'http://localhost:4455' : API_HOST;

export const API_URL = (path: string) => {
    if (typeof path === 'string') {
        return (isDevModel() ? 'http://localhost:4455' : API_HOST) + path;
    }
    return '';
};
