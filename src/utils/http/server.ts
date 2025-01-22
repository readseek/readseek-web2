'use server';

import { headers } from 'next/headers';
import { Response } from 'node-fetch';

import { isDevModel } from '../common';
import { logError } from '../logger';

import { LOGIN_URL, API_URL, API_PATH, buildUrl } from './index';

async function respDataHandler(res: Response) {
    try {
        if (res.status === 401) {
            // jump to login
            Response.redirect(LOGIN_URL || '', 302);
            return false;
        }

        if (res.status === 200) {
            return await res.json();
        }
        return null;
    } catch (error) {
        logError(error);
        throw error;
    }
}

export async function getServerData(path: API_PATH, parameters?: Record<string, any>) {
    const url = API_URL(path);
    try {
        const res: any = await fetch(buildUrl(url, parameters), {
            headers: headers(),
            method: 'GET',
            next: {
                revalidate: isDevModel() ? 5 : 1800, // 5sec in dev and 30min in prod
            },
        });
        return respDataHandler(res);
    } catch (error) {
        logError(error, url);
        throw error;
    }
}

export async function postServerJson(path: API_PATH, data: Record<string, any>) {
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
        throw error;
    }
}
