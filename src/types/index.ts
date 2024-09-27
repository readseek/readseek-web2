export enum DocumentType {
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

export interface EmbeddingCreateRequest {
    fileName: string;
    fileType: string;
}
