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
        code: number;
        message: string;
        data?: any;
    };
}

export {};
