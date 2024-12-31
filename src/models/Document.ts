import type { Tag } from './Tag';

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
    UNKNOWN = 'UnKnown',
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
    keywords?: string[];
    authors?: string[];
    visible?: boolean;
    coverUrl?: string;
    viewCount?: number;
    state?: DocumentState;
    createdAt?: Date;
    updatedAt?: Date;
}
