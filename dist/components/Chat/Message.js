"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
const utils_1 = require("@/lib/utils");
const markdown_1 = require("@/lib/chat/markdown");
const ReactMarkdown = (0, react_1.lazy)(() => import('react-markdown'));
/**
 * Renders code blocks with syntax highlighting
 */
const CodeBlock = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? ((0, jsx_runtime_1.jsx)(react_syntax_highlighter_1.Prism, { style: prism_1.vscDarkPlus, language: match[1], PreTag: "div", ...props, children: String(children).replace(/\n$/, '') })) : ((0, jsx_runtime_1.jsx)("code", { className: (0, utils_1.cn)('font-mono text-sm', className), ...props, children: children }));
};
/**
 * Message component for displaying chat messages with markdown support
 */
const Message = ({ role, content, isStreaming = false, className }) => {
    const processContent = (text) => {
        if (text && typeof text === 'string') {
            if (text.includes('<think>') && text.includes('</think>')) {
                return text.split('</think>')[1].trim();
            }
            return text;
        }
        return '';
    };
    const processedContent = processContent(content);
    const renderedContent = (0, markdown_1.processMarkdown)(processedContent, {
        sanitize: true,
        highlight: true,
        breaks: true
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)('relative max-w-[80%] animate-fade-in', role === 'user' ? 'ml-auto' : 'mr-auto', 'my-4', className), children: [isStreaming && ((0, jsx_runtime_1.jsx)("div", { className: "absolute -top-5 left-0 flex items-center gap-1 text-xs text-primary animate-blink", children: (0, jsx_runtime_1.jsx)("span", { children: "\u258B" }) })), (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)('p-4 rounded-2xl shadow-sm transition-opacity duration-300', role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : role === 'assistant'
                        ? 'bg-card text-card-foreground'
                        : 'bg-muted text-muted-foreground', isStreaming && 'opacity-80'), children: (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { children: "Loading..." }), children: (0, jsx_runtime_1.jsx)("div", { className: "prose dark:prose-invert max-w-none", dangerouslySetInnerHTML: { __html: renderedContent } }) }) })] }));
};
exports.default = Message;
