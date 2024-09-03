export declare global {
  declare type Callback = (...args: any[]) => any | undefined;

  /**
   * The next Router Handler second parameter type
   */
  declare type RouteContext = {
    params: {
      [key: string]: any;
    };
  };
}
