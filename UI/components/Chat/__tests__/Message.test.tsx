import React from 'react';
import { render, screen } from '@testing-library/react';
import Message from '../Message';

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
    cn: (...inputs: string[]) => inputs.join(' '),
}));

// Mock react-markdown to avoid complex markdown rendering in tests
jest.mock('react-markdown', () => {
    return ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>;
});

describe('Message', () => {
    const defaultProps = {
        role: 'assistant' as const,
        content: 'Hello, how can I help you?'
    };

    it('renders message content correctly', () => {
        render(<Message {...defaultProps} />);
        expect(screen.getByTestId('markdown')).toHaveTextContent(defaultProps.content);
    });

    it('applies correct styling for user messages', () => {
        const { container } = render(<Message {...defaultProps} role="user" />);
        const messageWrapper = container.firstChild as HTMLElement;
        expect(messageWrapper.className).toContain('ml-auto');
        expect(messageWrapper.querySelector('div:nth-child(2)')).toHaveClass('bg-primary');
    });

    it('applies correct styling for assistant messages', () => {
        const { container } = render(<Message {...defaultProps} />);
        const messageWrapper = container.firstChild as HTMLElement;
        expect(messageWrapper.className).toContain('mr-auto');
        expect(messageWrapper.querySelector('div:nth-child(2)')).toHaveClass('bg-card');
    });

    it('shows streaming indicator when isStreaming is true', () => {
        const { container } = render(<Message {...defaultProps} isStreaming />);
        const streamingIndicator = container.querySelector('.animate-blink');
        expect(streamingIndicator).toBeInTheDocument();
    });

    it('processes think tags correctly', () => {
        const content = '<think>Processing query...</think>Here is your answer';
        render(<Message {...defaultProps} content={content} />);
        expect(screen.getByTestId('markdown')).toHaveTextContent('Here is your answer');
        expect(screen.getByTestId('markdown')).not.toHaveTextContent('Processing query...');
    });

    it('applies custom className when provided', () => {
        const customClass = 'custom-test-class';
        const { container } = render(<Message {...defaultProps} className={customClass} />);
        expect(container.firstChild).toHaveClass(customClass);
    });

    it('handles empty content gracefully', () => {
        render(<Message {...defaultProps} content="" />);
        expect(screen.getByTestId('markdown')).toHaveTextContent('');
    });

    it('applies animation classes', () => {
        const { container } = render(<Message {...defaultProps} />);
        expect(container.firstChild).toHaveClass('animate-fade-in');
    });
}); 