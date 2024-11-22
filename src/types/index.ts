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
    name: string;
    alias?: string;
};

export type Tag = {
    id?: number;
    name: string;
    alias?: string;
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
    visible?: boolean;
    coverUrl?: string;
    viewCount?: number;
    state?: DocumentState;
    createdAt?: Date;
    updatedAt?: Date;
};

export type User = {
    id?: number;
    name?: string;
    age?: number;
    email?: string;
    avatar?: string;
    bio?: string;
    posts?: Document[];
    createdAt?: Date;
    updatedAt?: Date;
};
