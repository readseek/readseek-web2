export const enum DocumentType {
    TXT = 'txt',
    PDF = 'pdf',
    EPUB = 'epub',
    DOC = 'doc',
    DOCX = 'docx',
    CSV = 'csv',
    TSV = 'tsv',
    Markdown = 'md',
    HTML = 'html',
    UNKNOWN = 'UnKnown',
}

export const enum DocumentState {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
}

export type Category = {
    id?: number;
    key?: string;
    value?: number;
};

export type Tag = {
    id?: number;
    key?: string;
    value?: number;
};

export type Document = {
    id: string;
    title: string;
    description: string;
    categoryId: number;
    userId: number;
    tags: Tag[];
    keywords?: string[];
    authors?: string[];
    visiable?: boolean;
    coverUrl?: string;
    viewCount?: number;
    state?: DocumentState;
    createdAt?: Date;
    updatedAt?: Date;
};

export type User = {
    id?: number;
    name: string;
    age: number;
    email: string;
    avatarUrl?: string;
    bio?: string;
    posts?: Document[];
    createdAt?: Date;
    updatedAt?: Date;
};
