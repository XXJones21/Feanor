import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageList from '../MessageList';
import { Message } from '../../../types/chat';

// Mock child components
vi.mock('../Message', () => {
    return ({ content }: { content: string }) => <div data-testid="message">{content}</div>;
});

vi.mock('../LoadingIndicator', () => {
    return () => <div data-testid="loading-indicator">Loading...</div>;
});

// Mock utilities
vi.mock('@/lib/utils', () => ({
    cn: (...inputs: string[]) => inputs.join(' '),
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockMessages: Message[] = [
    {
        role: 'user',
        content: 'Hello',
        id: '1',
        timestamp: Date.now(),
        status: 'complete'
    },
    {
        role: 'assistant',
        content: 'Hi there!',
        id: '2',
        timestamp: Date.now(),
        status: 'complete'
    }
];

describe('MessageList', () => {
    it('renders messages correctly', () => {
        const { container } = render(<MessageList messages={mockMessages} isLoading={false} onRetry={() => {}} />);
        const messages = container.querySelectorAll('.message');
        expect(messages.length).toBe(2);
        expect(messages[0].textContent).toContain('Hello');
        expect(messages[1].textContent).toContain('Hi there!');
    });

    it('shows loading indicator when isLoading is true', () => {
        render(<MessageList messages={mockMessages} isLoading={true} onRetry={() => {}} />);
        const loadingIndicator = screen.getByTestId('loading-indicator');
        expect(loadingIndicator).toBeDefined();
    });

    it('handles error messages', () => {
        const messagesWithError: Message[] = [
            ...mockMessages,
            {
                role: 'user' as const,
                content: 'Failed message',
                id: '3',
                timestamp: Date.now(),
                status: 'error' as const,
                error: {
                    message: 'An error occurred',
                    retryable: true
                }
            }
        ];

        render(<MessageList messages={messagesWithError} isLoading={false} onRetry={() => {}} />);
        const errorMessage = screen.getByText('An error occurred');
        expect(errorMessage).toBeDefined();
    });

    it('handles retry callback', () => {
        const onRetry = vi.fn();
        const messagesWithError: Message[] = [
            ...mockMessages,
            {
                role: 'user' as const,
                content: 'Failed message',
                id: '3',
                timestamp: Date.now(),
                status: 'error' as const,
                error: {
                    message: 'An error occurred',
                    retryable: true
                }
            }
        ];

        render(<MessageList messages={messagesWithError} isLoading={false} onRetry={onRetry} />);
        const retryButton = screen.getByText('Retry');
        retryButton.click();
        expect(onRetry).toHaveBeenCalledWith(2); // Index of the error message
    });

    it('applies custom className', () => {
        const customClass = 'test-class';
        const { container } = render(
            <MessageList 
                messages={mockMessages} 
                isLoading={false} 
                onRetry={() => {}} 
                className={customClass}
            />
        );
        const element = container.firstChild as HTMLElement;
        expect(element).toBeDefined();
        expect(element.className).toContain(customClass);
    });

    it('renders empty state', () => {
        render(<MessageList messages={[]} isLoading={false} onRetry={() => {}} />);
        const messageContainer = screen.queryByTestId('message');
        expect(messageContainer).toBeNull();
    });
}); 