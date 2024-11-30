'use server';

import { headers } from 'next/headers';
import { Response } from 'node-fetch';

import { LOGIN_URL, API_URL } from '@/constants/Application';

import { isDevModel } from '../common';
import { logError } from '../logger';

async function respDataHandler(res: Response) {
    try {
        if (res.status === 401) {
            // jump to login
            Response.redirect(LOGIN_URL || '', 302);
            return false;
        }

        if (res.status === 200) {
            const ret: any = await res.json();
            if (ret && ret.code === 0) {
                return ret.data || {};
            }
            return ret;
        }
    } catch (error) {
        logError(error);
    }
    return false;
}

export async function getServerData(path: string) {
    const url = API_URL(path);
    try {
        const res: any = await fetch(url, {
            headers: headers(),
            method: 'GET',
            next: {
                revalidate: isDevModel() ? 10 : 60 * 60 * 2,
            },
        });
        return respDataHandler(res);
    } catch (error) {
        logError(error, url);
    }
    return null;
}

export async function postServerJson(path: string, data: Record<string, any>) {
    const url = API_URL(path);
    try {
        const res: any = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers(),
            },
            body: JSON.stringify(data),
        });
        return respDataHandler(res);
    } catch (error) {
        logError(error, url);
    }
    return null;
}
