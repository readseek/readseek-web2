export const home = async (): Promise<APIRet> => {
    return { code: 0, data: [], message: 'home success' };
};

export const list = async (): Promise<APIRet> => {
    return { code: 0, data: [], message: 'list success' };
};

export const userLogin = async (): Promise<APIRet> => {
    return { code: 0, data: [], message: 'userLogin success' };
};

export const userUpdate = async (): Promise<APIRet> => {
    return { code: 0, data: [], message: 'userUpdate success' };
};

export const userDelete = async (): Promise<APIRet> => {
    return { code: 0, data: [], message: 'userDelete success' };
};

export const systemConf = async (): Promise<APIRet> => {
    const confs: Record<string, string> = {};
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('__RSN_')) {
            confs[key] = process.env[key] || '';
        }
    });
    return { code: 0, data: confs, message: 'systemConf success' };
};
