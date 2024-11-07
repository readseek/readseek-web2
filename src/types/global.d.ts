declare global {
    type Callback = (...args: any[]) => any | undefined;

    /**
     * The next Router Handler second parameter type
     */
    type RouteContext = {
        params: {
            [key: string]: any;
        };
    };

    /**
     * Service returned
     */
    type APIRet = {
        // biz error | auth error | biz success
        code: -1 | 1 | 0;
        message: string;
        data?: any;
    };
}

export {};
