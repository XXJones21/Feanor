"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMarkdown = processMarkdown;
exports.formatCodeBlock = formatCodeBlock;
exports.extractCodeBlocks = extractCodeBlocks;
exports.processInlineCode = processInlineCode;
const marked_1 = require("marked");
const DOMPurify = __importStar(require("dompurify"));
const highlight_js_1 = __importDefault(require("highlight.js"));
/**
 * Processes markdown text with optional syntax highlighting and sanitization
 */
function processMarkdown(text, options = {}) {
    const { sanitize = true, highlight = true, breaks = true } = options;
    // Configure marked options
    marked_1.marked.setOptions({
        breaks,
        highlight: highlight ? (code, lang) => {
            if (lang && highlight_js_1.default.getLanguage(lang)) {
                try {
                    return highlight_js_1.default.highlight(code, { language: lang }).value;
                }
                catch (err) {
                    console.error('Error highlighting code:', err);
                }
            }
            return code;
        } : undefined
    });
    // Process markdown
    let html = (0, marked_1.marked)(text);
    // Sanitize if enabled
    if (sanitize) {
        html = DOMPurify.sanitize(html);
    }
    return html;
}
/**
 * Formats a code block with optional line numbers and language
 */
function formatCodeBlock(code, options = {}) {
    const { language, showLineNumbers = true } = options;
    let formattedCode = code;
    // Add line numbers if enabled
    if (showLineNumbers) {
        const lines = code.split('\n');
        formattedCode = lines
            .map((line, i) => `<span class="line-number">${i + 1}</span>${line}`)
            .join('\n');
    }
    // Wrap in pre and code tags with appropriate classes
    const languageClass = language ? ` language-${language}` : '';
    return `<pre class="code-block${showLineNumbers ? ' with-line-numbers' : ''}">
    <code class="hljs${languageClass}">${formattedCode}</code>
  </pre>`;
}
/**
 * Extracts code blocks from markdown text
 */
function extractCodeBlocks(markdown) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
        blocks.push({
            language: match[1],
            code: match[2].trim()
        });
    }
    return blocks;
}
/**
 * Processes inline code segments
 */
function processInlineCode(text) {
    return text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
}
