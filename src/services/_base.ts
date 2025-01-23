'use server';

export default class BaseService {
    protected renderError(msg: string) {
        return { code: -1, data: false, message: msg } as APIRet;
    }

    // TODO: Get from cookies later
    protected getSharedUid(): number {
        return 1;
    }
}
