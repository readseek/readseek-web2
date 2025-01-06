import type { Document } from './Document';

export interface User {
    id?: number;
    name?: string;
    age?: number;
    email?: string;
    avatar?: string;
    bio?: string;
    posts?: Document[];
    createdAt?: Date;
    updatedAt?: Date;
}
