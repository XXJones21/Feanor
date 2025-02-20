import { marked } from 'marked';
import * as DOMPurify from 'dompurify';
import hljs from 'highlight.js';

interface MarkdownOptions {
  sanitize?: boolean;
  highlight?: boolean;
  breaks?: boolean;
}

interface CodeBlockOptions {
  language?: string;
  showLineNumbers?: boolean;
}

/**
 * Processes markdown text with optional syntax highlighting and sanitization
 */
export function processMarkdown(text: string, options: MarkdownOptions = {}) {
  const { sanitize = true, highlight = true, breaks = true } = options;

  // Configure marked options
  marked.setOptions({
    breaks,
    highlight: highlight ? (code: string, lang: string | undefined) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          console.error('Error highlighting code:', err);
        }
      }
      return code;
    } : undefined
  });

  // Process markdown
  let html = marked(text);

  // Sanitize if enabled
  if (sanitize) {
    html = DOMPurify.sanitize(html);
  }

  return html;
}

/**
 * Formats a code block with optional line numbers and language
 */
export function formatCodeBlock(code: string, options: CodeBlockOptions = {}) {
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
export function extractCodeBlocks(markdown: string): Array<{ code: string; language?: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ code: string; language?: string }> = [];
  
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
export function processInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
} 