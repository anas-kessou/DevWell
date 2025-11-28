export declare const registerUser: (username: string, email: string, password: string) => Promise<{
    token: string;
    user: {
        id: unknown;
        username: string;
        email: string;
    };
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    token: string;
    user: {
        id: unknown;
        username: string;
        email: string;
    };
}>;
export declare const getUserProfile: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("./auth.model").IUser, {}, {}> & import("./auth.model").IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
//# sourceMappingURL=auth.service.d.ts.map