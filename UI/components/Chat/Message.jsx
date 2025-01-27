import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const blink = keyframes`
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
`;

const MessageWrapper = styled.div`
    margin: ${props => props.role === 'user' ? '1rem 0 1rem auto' : '1rem auto 1rem 0'};
    max-width: 80%;
    animation: fadeIn 0.3s ease-in;
    position: relative;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const MessageContent = styled.div`
    padding: 1rem;
    border-radius: 1rem;
    background: ${props => {
        switch(props.role) {
            case 'user': return props.theme.colors.userMessage;
            case 'assistant': return props.theme.colors.assistantMessage;
            default: return props.theme.colors.systemMessage;
        }
    }};
    color: ${props => props.role === 'user' ? '#FFFFFF' : '#000000'};
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    opacity: ${props => props.isStreaming ? 0.8 : 1};
    transition: opacity 0.3s ease;

    img {
        max-width: 100%;
        border-radius: 0.5rem;
    }

    a {
        color: ${props => props.role === 'user' ? '#FFFFFF' : props.theme.colors.link};
        text-decoration: underline;
    }

    pre {
        margin: 1rem 0;
        border-radius: 0.5rem;
        overflow: hidden;
    }

    code {
        font-family: 'Fira Code', monospace;
    }
`;

const StreamingIndicator = styled.div`
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 0.8rem;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 4px;

    &::after {
        content: '▋';
        animation: ${blink} 1s infinite;
    }
`;

const Message = ({ role, content, status }) => {
    // Filter out think tags and only show actual response
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

    return (
        <MessageWrapper role={role}>
            <MessageContent role={role}>
                <ReactMarkdown
                    components={{
                        code({ node, inline, className, children, ...props }) {
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
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                >
                    {processedContent}
                </ReactMarkdown>
            </MessageContent>
        </MessageWrapper>
    );
};

export default Message; 