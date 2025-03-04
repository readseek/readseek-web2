'use client';

import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import { useEffect, useState, useCallback, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

// Register commonly used languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

type CodeBlockProps = {
    node: any;
    inline: boolean;
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
};

interface CopyButtonProps {
    code: string;
}

export const CopyButton = ({ code }: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button onClick={handleCopy} className="absolute right-2 top-2 rounded bg-gray-700 px-2 py-1 text-xs text-gray-200 opacity-0 transition-opacity hover:bg-gray-600 group-hover:opacity-100" aria-label="Copy code">
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

export interface MarkdownContentProps {
    content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
    const highlightCode = useCallback(() => {
        document.querySelectorAll('pre code').forEach(block => {
            if (!block.hasAttribute('data-highlighted')) {
                hljs.highlightElement(block as HTMLElement);
            }
        });
    }, []);

    useEffect(() => {
        highlightCode();

        return () => {
            // Cleanup: remove highlighting from all code blocks when component unmounts
        };
    }, [content, highlightCode]);

    const markdownComponents = useMemo(
        () => ({
            code({ node, inline, className, children, ...props }: CodeBlockProps) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';

                if (!inline) {
                    return (
                        <pre className="group relative !my-2 overflow-hidden rounded-md">
                            <CopyButton code={String(children)} />
                            <code className={language ? `language-${language} block w-full` : 'block w-full'} {...props}>
                                {String(children).replace(/\n$/, '')}
                            </code>
                        </pre>
                    );
                }
                return (
                    <code className="rounded bg-gray-200 px-1 py-0.5 text-sm" {...props}>
                        {children}
                    </code>
                );
            },
            p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
            },
            ul({ children }) {
                return <ul className="mb-2 list-disc pl-4">{children}</ul>;
            },
            ol({ children }) {
                return <ol className="mb-2 list-decimal pl-4">{children}</ol>;
            },
            li({ children }) {
                return <li className="mb-1">{children}</li>;
            },
            blockquote({ children }) {
                return <blockquote className="my-2 border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>;
            },
            a({ children, href }) {
                return (
                    <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                );
            },
        }),
        [],
    );

    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents as Components}>
            {content}
        </ReactMarkdown>
    );
};
