export async function sys_users(): Promise<APIRet> {
    return { code: 0, data: [], message: 'home success' };
}

export async function sys_files(): Promise<APIRet> {
    return { code: 0, data: [], message: 'list success' };
}

export async function sys_env(): Promise<APIRet> {
    const confs: Record<string, string> = {};
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('__RSN_')) {
            confs[key] = process.env[key] || '';
        }
    });
    return { code: 0, data: confs, message: 'systemConf success' };
}
