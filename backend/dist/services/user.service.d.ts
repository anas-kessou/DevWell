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
export declare const getUserProfile: (userId: string) => Promise<{
    id: unknown;
    username: string;
    email: string;
}>;
//# sourceMappingURL=user.service.d.ts.map