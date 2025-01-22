'use client';

import { logError } from '../logger';

import { LOGIN_URL, API_URL } from './index';

const ReqHeaders = {
    'client-secret': '123-xyz-321-0000',
};

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

export async function getData(path: string) {
    const url = API_URL(path);
    try {
        const res: any = await fetch(url, {
            method: 'GET',
            mode: 'same-origin',
            cache: 'reload',
            credentials: 'include',
            referrerPolicy: 'strict-origin-when-cross-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'max-age=600',
                ...ReqHeaders,
            },
        });
        return respDataHandler(res);
    } catch (error) {
        logError(error, url);
        throw error;
    }
}

export async function postJson(path: string, data: Record<string, any>) {
    const url = API_URL(path);
    try {
        const res: any = await fetch(url, {
            method: 'POST',
            mode: 'same-origin',
            cache: 'no-cache',
            credentials: 'include',
            referrerPolicy: 'strict-origin-when-cross-origin',
            headers: {
                'Content-Type': 'application/json',
                ...ReqHeaders,
            },
            body: JSON.stringify(data),
        });
        return respDataHandler(res);
    } catch (error) {
        logError(error, url);
        throw error;
    }
}

export async function postForm(path: string, data: Record<string, any>) {
    const url = API_URL(path);
    try {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('category', data.category);
        formData.append('tags', JSON.stringify(data.tags.map((item: any) => item.value)));

        const res: any = await fetch(url, {
            method: 'POST',
            mode: 'same-origin',
            cache: 'no-cache',
            credentials: 'include',
            referrerPolicy: 'strict-origin-when-cross-origin',
            headers: {
                ...ReqHeaders,
            },
            body: formData,
        });
        return respDataHandler(res);
    } catch (error) {
        logError(error, url, 'Error occurred while posting form data');
        throw error;
    }
}
