'use server';

import { headers } from 'next/headers';
import { Response } from 'node-fetch';

import { LOGIN_URL, API_URL } from '@/constants/application';

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
            return await res.json();
        }
        return null;
    } catch (error) {
        logError(error);
        throw error;
    }
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
        throw error;
    }
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
        throw error;
    }
}
