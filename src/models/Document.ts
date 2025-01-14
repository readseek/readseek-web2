import type { Tag } from './Tag';

// UpperCase File Type and its Extension(LowerCase)
export enum DocumentType {
    TXT = 'txt',
    PDF = 'pdf',
    EPUB = 'epub',
    DOC = 'doc',
    DOCX = 'docx',
    CSV = 'csv',
    TSV = 'tsv',
    MARKDOWN = 'md',
    HTML = 'html',
    UNKNOWN = 'unknown',
}

// https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
export enum DocumentLang {
    ENG = 'ENG',
    CHI = 'CHI',
    ZHO = 'ZHO',
    JPN = 'JPN',
}

export enum DocumentState {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
}

export interface Document {
    id: string;
    title: string;
    description: string;
    categoryId: number;
    userId: number;
    tags: Tag[];
    type: DocumentType;
    lang: DocumentLang;
    keywords?: string[];
    authors?: string[];
    visible?: boolean;
    coverUrl?: string;
    viewCount?: number;
    state?: DocumentState;
    createdAt?: Date;
    updatedAt?: Date;
}
