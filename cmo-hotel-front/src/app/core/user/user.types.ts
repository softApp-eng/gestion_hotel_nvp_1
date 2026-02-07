export interface User {
    userid: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: boolean;
    roles?: string[];
    permissions?: string[];
    status?: string;
}
