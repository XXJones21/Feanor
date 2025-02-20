import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageList from '../MessageList';
import type { Message } from '@/types/chat';

// Mock child components
jest.mock('../Message', () => {
    return ({ content }: { content: string }) => <div data-testid="message">{content}</div>;
});

jest.mock('../LoadingIndicator', () => {
    return () => <div data-testid="loading-indicator">Loading...</div>;
});

// Mock utilities
jest.mock('@/lib/utils', () => ({
    cn: (...inputs: string[]) => inputs.join(' '),
}));

// Mock framer-motion to avoid animation complexity in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('MessageList', () => {
    const mockMessages: Message[] = [
        { role: 'user', content: 'Hello', id: '1' },
        { role: 'assistant', content: 'Hi there!', id: '2' },
    ];

    it('renders messages correctly', () => {
        render(<MessageList messages={mockMessages} />);
        const messages = screen.getAllByTestId('message');
        expect(messages).toHaveLength(2);
        expect(messages[0]).toHaveTextContent('Hello');
        expect(messages[1]).toHaveTextContent('Hi there!');
    });

    it('shows loading indicator when isLoading is true', () => {
        render(<MessageList messages={mockMessages} isLoading />);
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('handles retry for failed messages', () => {
        const onRetry = jest.fn();
        const messagesWithError: Message[] = [
            ...mockMessages,
            { role: 'user', content: 'Failed message', id: '3', status: 'error' },
        ];

        render(<MessageList messages={messagesWithError} onRetry={onRetry} />);
        const retryButton = screen.getByText('Retry');
        
        fireEvent.click(retryButton);
        expect(onRetry).toHaveBeenCalledWith(2); // Index of the failed message
    });

    it('renders error message for failed messages', () => {
        const messagesWithError: Message[] = [
            ...mockMessages,
            { role: 'user', content: 'Failed message', id: '3', status: 'error' },
        ];

        render(<MessageList messages={messagesWithError} onRetry={() => Promise.resolve()} />);
        expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        const customClass = 'custom-test-class';
        const { container } = render(
            <MessageList messages={mockMessages} className={customClass} />
        );
        expect(container.firstChild).toHaveClass(customClass);
    });

    it('handles empty message list', () => {
        render(<MessageList messages={[]} />);
        expect(screen.queryByTestId('message')).not.toBeInTheDocument();
    });
}); 