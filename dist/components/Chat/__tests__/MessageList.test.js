"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const MessageList_1 = require("../MessageList");
// Mock child components
vitest_1.vi.mock('../Message', () => {
    return ({ content }) => (0, jsx_runtime_1.jsx)("div", { "data-testid": "message", children: content });
});
vitest_1.vi.mock('../LoadingIndicator', () => {
    return () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "loading-indicator", children: "Loading..." });
});
// Mock utilities
vitest_1.vi.mock('@/lib/utils', () => ({
    cn: (...inputs) => inputs.join(' '),
}));
// Mock framer-motion to avoid animation complexity in tests
vitest_1.vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => (0, jsx_runtime_1.jsx)("div", { ...props, children: children }),
    },
    AnimatePresence: ({ children }) => (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children }),
}));
const mockMessages = [
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
(0, vitest_1.describe)('MessageList', () => {
    (0, vitest_1.it)('renders messages correctly', () => {
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: mockMessages, isLoading: false, onRetry: () => { } }));
        const messages = container.querySelectorAll('.message');
        (0, vitest_1.expect)(messages.length).toBe(2);
        (0, vitest_1.expect)(messages[0].textContent).toContain('Hello');
        (0, vitest_1.expect)(messages[1].textContent).toContain('Hi there!');
    });
    (0, vitest_1.it)('shows loading indicator when isLoading is true', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: mockMessages, isLoading: true, onRetry: () => { } }));
        const loadingIndicator = react_1.screen.getByTestId('loading-indicator');
        (0, vitest_1.expect)(loadingIndicator).toBeDefined();
    });
    (0, vitest_1.it)('handles error messages', () => {
        const messagesWithError = [
            ...mockMessages,
            {
                role: 'user',
                content: 'Failed message',
                id: '3',
                timestamp: Date.now(),
                status: 'error',
                error: {
                    message: 'An error occurred',
                    retryable: true
                }
            }
        ];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: messagesWithError, isLoading: false, onRetry: () => { } }));
        const errorMessage = react_1.screen.getByText('An error occurred');
        (0, vitest_1.expect)(errorMessage).toBeDefined();
    });
    (0, vitest_1.it)('handles retry callback', () => {
        const onRetry = vitest_1.vi.fn();
        const messagesWithError = [
            ...mockMessages,
            {
                role: 'user',
                content: 'Failed message',
                id: '3',
                timestamp: Date.now(),
                status: 'error',
                error: {
                    message: 'An error occurred',
                    retryable: true
                }
            }
        ];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: messagesWithError, isLoading: false, onRetry: onRetry }));
        const retryButton = react_1.screen.getByText('Retry');
        retryButton.click();
        (0, vitest_1.expect)(onRetry).toHaveBeenCalledWith(2); // Index of the error message
    });
    (0, vitest_1.it)('applies custom className', () => {
        const customClass = 'test-class';
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: mockMessages, isLoading: false, onRetry: () => { }, className: customClass }));
        const element = container.firstChild;
        (0, vitest_1.expect)(element).toBeDefined();
        (0, vitest_1.expect)(element.className).toContain(customClass);
    });
    (0, vitest_1.it)('renders empty state', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: [], isLoading: false, onRetry: () => { } }));
        const messageContainer = react_1.screen.queryByTestId('message');
        (0, vitest_1.expect)(messageContainer).toBeNull();
    });
});
