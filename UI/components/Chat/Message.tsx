import React, { lazy, Suspense } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { type MessageRole } from '@/types/chat';
import { processMarkdown, formatCodeBlock, processInlineCode } from '@/lib/chat/markdown';

const ReactMarkdown = lazy(() => import('react-markdown'));

/**
 * Message component displays a chat message with support for markdown content,
 * code syntax highlighting, and streaming indicators.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Message
 *   role="assistant"
 *   content="Hello, how can I help you?"
 * />
 * 
 * // With streaming indicator
 * <Message
 *   role="assistant"
 *   content="Processing your request..."
 *   isStreaming={true}
 * />
 * 
 * // With markdown content
 * <Message
 *   role="assistant"
 *   content="Here's some code: \`\`\`js\nconsole.log('hello');\n\`\`\`"
 * />
 * ```
 */
interface MessageProps {
    /**
     * The role of the message sender
     */
    role: MessageRole;
    /**
     * The content of the message. Supports markdown formatting.
     * Special tags like <think></think> will be filtered out.
     */
    content: string;
    /**
     * Whether the message is currently streaming.
     * When true, shows a blinking indicator and reduces opacity.
     * @default false
     */
    isStreaming?: boolean;
    /**
     * Optional className for custom styling
     */
    className?: string;
}

/**
 * Props for the code block component used in markdown rendering
 */
interface CodeBlockProps {
    /**
     * AST node from markdown parsing
     */
    node?: any;
    /**
     * Whether the code is inline or a block
     */
    inline?: boolean;
    /**
     * CSS classes including language specification
     */
    className?: string;
    /**
     * The code content
     */
    children: React.ReactNode;
    /**
     * Additional props passed from markdown renderer
     */
    [key: string]: any;
}

/**
 * Renders code blocks with syntax highlighting
 */
const CodeBlock: React.FC<CodeBlockProps> = ({
    inline,
    className,
    children,
    ...props
}) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
        <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            {...props}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    ) : (
        <code className={cn('font-mono text-sm', className)} {...props}>
            {children}
        </code>
    );
};

/**
 * Message component for displaying chat messages with markdown support
 */
const Message: React.FC<MessageProps> = ({
    role,
    content,
    isStreaming = false,
    className
}) => {
    const processContent = (text: string): string => {
        if (text && typeof text === 'string') {
            if (text.includes('<think>') && text.includes('</think>')) {
                return text.split('</think>')[1].trim();
            }
            return text;
        }
        return '';
    };

    const processedContent = processContent(content);
    const renderedContent = processMarkdown(processedContent, {
        sanitize: true,
        highlight: true,
        breaks: true
    });

    return (
        <div className={cn(
            'relative max-w-[80%] animate-fade-in',
            role === 'user' ? 'ml-auto' : 'mr-auto',
            'my-4',
            className
        )}>
            {isStreaming && (
                <div className="absolute -top-5 left-0 flex items-center gap-1 text-xs text-primary animate-blink">
                    <span>▋</span>
                </div>
            )}
            <div className={cn(
                'p-4 rounded-2xl shadow-sm transition-opacity duration-300',
                role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : role === 'assistant'
                    ? 'bg-card text-card-foreground'
                    : 'bg-muted text-muted-foreground',
                isStreaming && 'opacity-80'
            )}>
                <Suspense fallback={<div>Loading...</div>}>
                    <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                </Suspense>
            </div>
        </div>
    );
};

export default Message; 