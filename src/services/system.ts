export async function home(): Promise<APIRet> {
    return { code: 0, data: [], message: 'home success' };
}

export async function list(): Promise<APIRet> {
    return { code: 0, data: [], message: 'list success' };
}

export async function userLogin(): Promise<APIRet> {
    return { code: 0, data: [], message: 'userLogin success' };
}

export async function userUpdate(): Promise<APIRet> {
    return { code: 0, data: [], message: 'userUpdate success' };
}

export async function userDelete(): Promise<APIRet> {
    return { code: 0, data: [], message: 'userDelete success' };
}

export async function systemConf(): Promise<APIRet> {
    const confs: Record<string, string> = {};
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('__RSN_')) {
            confs[key] = process.env[key] || '';
        }
    });
    return { code: 0, data: confs, message: 'systemConf success' };
}
