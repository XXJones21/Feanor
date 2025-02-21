import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Message from '../Message';
import { Message as MessageType } from '../../../types/chat';

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
    cn: (...inputs: string[]) => inputs.join(' '),
}));

// Mock react-markdown to avoid complex markdown rendering in tests
vi.mock('react-markdown', () => {
    return ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>;
});

const defaultProps: MessageType = {
    content: 'Test message',
    role: 'user',
    id: '1',
    timestamp: Date.now(),
    status: 'complete'
};

describe('Message', () => {
    it('renders message content', () => {
        render(<Message {...defaultProps} />);
        const content = screen.getByTestId('markdown');
        expect(content).toBeDefined();
        expect(content.textContent).toBe(defaultProps.content);
    });

    it('applies primary background for user messages', () => {
        const { container } = render(<Message {...defaultProps} role="user" />);
        const messageWrapper = container.firstChild as HTMLElement;
        const messageContent = messageWrapper.querySelector('div:nth-child(2)') as HTMLElement;
        expect(messageContent).toBeDefined();
        expect(messageContent.className).toContain('bg-primary');
    });

    it('applies secondary background for assistant messages', () => {
        const { container } = render(<Message {...defaultProps} role="assistant" />);
        const messageWrapper = container.firstChild as HTMLElement;
        const messageContent = messageWrapper.querySelector('div:nth-child(2)') as HTMLElement;
        expect(messageContent).toBeDefined();
        expect(messageContent.className).toContain('bg-card');
    });

    it('shows streaming indicator when isStreaming is true', () => {
        render(<Message {...defaultProps} isStreaming={true} />);
        const streamingIndicator = screen.queryByTestId('streaming-indicator');
        expect(streamingIndicator).toBeDefined();
    });

    it('updates content while streaming', () => {
        const { rerender } = render(<Message {...defaultProps} isStreaming={true} content="Processing query..." />);
        expect(screen.getByTestId('markdown').textContent).toBe('Processing query...');

        rerender(<Message {...defaultProps} isStreaming={false} content="Here is your answer" />);
        expect(screen.getByTestId('markdown').textContent).toBe('Here is your answer');
    });

    it('applies custom className', () => {
        const customClass = 'test-class';
        const { container } = render(<Message {...defaultProps} className={customClass} />);
        const element = container.firstChild as HTMLElement;
        expect(element).toBeDefined();
        expect(element.className).toContain(customClass);
    });

    it('handles empty content', () => {
        render(<Message {...defaultProps} content="" />);
        expect(screen.getByTestId('markdown').textContent).toBe('');
    });

    it('applies animation class', () => {
        const { container } = render(<Message {...defaultProps} />);
        const element = container.firstChild as HTMLElement;
        expect(element).toBeDefined();
        expect(element.className).toContain('animate-fade-in');
    });
}); 