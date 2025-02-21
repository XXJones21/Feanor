"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const user_event_1 = require("@testing-library/user-event");
const InputArea_1 = __importDefault(require("../InputArea"));
// Mock framer-motion to avoid animation issues in tests
vitest_1.vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => ((0, jsx_runtime_1.jsx)("div", { ...props, children: children })),
        button: ({ children, ...props }) => ((0, jsx_runtime_1.jsx)("button", { ...props, children: children })),
    },
    AnimatePresence: ({ children }) => (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children }),
}));
// Mock the cn utility
vitest_1.vi.mock('@/lib/utils', () => ({
    cn: (...inputs) => inputs.filter(Boolean).join(' '),
}));
(0, vitest_1.describe)('InputArea', () => {
    const mockOnSendMessage = vitest_1.vi.fn();
    const defaultProps = {
        onSendMessage: mockOnSendMessage,
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('renders correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        (0, vitest_1.expect)(react_1.screen.getByPlaceholderText('Type a message...')).toBeDefined();
        (0, vitest_1.expect)(react_1.screen.getByText('Send')).toBeDefined();
    });
    (0, vitest_1.it)('handles text input correctly', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        await user_event_1.userEvent.type(textarea, 'Hello, world!');
        (0, vitest_1.expect)(textarea.value).toBe('Hello, world!');
    });
    (0, vitest_1.it)('sends message on button click', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        const sendButton = react_1.screen.getByText('Send');
        await user_event_1.userEvent.type(textarea, 'Test message');
        await user_event_1.userEvent.click(sendButton);
        (0, vitest_1.expect)(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
        (0, vitest_1.expect)(textarea.value).toBe('');
    });
    (0, vitest_1.it)('sends message on Enter key', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        await user_event_1.userEvent.type(textarea, 'Test message');
        await user_event_1.userEvent.keyboard('{Enter}');
        (0, vitest_1.expect)(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
        (0, vitest_1.expect)(textarea.value).toBe('');
    });
    (0, vitest_1.it)('does not send empty messages', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        const sendButton = react_1.screen.getByText('Send');
        await user_event_1.userEvent.click(sendButton);
        (0, vitest_1.expect)(mockOnSendMessage).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('handles loading state correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps, isLoading: true }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        const sendButton = react_1.screen.getByText('Sending...');
        (0, vitest_1.expect)(textarea.disabled).toBe(true);
        (0, vitest_1.expect)(sendButton.disabled).toBe(true);
    });
    (0, vitest_1.it)('handles file paste', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const clipboardData = {
            items: [
                { type: 'image/png', getAsFile: () => file }
            ]
        };
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        react_1.fireEvent.paste(textarea, { clipboardData });
        const attachmentText = await react_1.screen.findByText('📎 test.png');
        (0, vitest_1.expect)(attachmentText).toBeDefined();
    });
    (0, vitest_1.it)('handles file drop', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        react_1.fireEvent.drop(textarea, {
            dataTransfer: {
                files: [file]
            }
        });
        const attachmentText = await react_1.screen.findByText('📎 test.png');
        (0, vitest_1.expect)(attachmentText).toBeDefined();
    });
    (0, vitest_1.it)('allows removing attachments', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { ...defaultProps }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        react_1.fireEvent.drop(textarea, {
            dataTransfer: {
                files: [file]
            }
        });
        const attachmentText = await react_1.screen.findByText('📎 test.png');
        (0, vitest_1.expect)(attachmentText).toBeDefined();
        const removeButton = react_1.screen.getByLabelText('Remove attachment');
        await user_event_1.userEvent.click(removeButton);
        (0, vitest_1.expect)(react_1.screen.queryByText('📎 test.png')).toBeNull();
    });
    (0, vitest_1.it)('handles error during message send', async () => {
        const mockError = new Error('Failed to send');
        const mockOnSendMessageWithError = vitest_1.vi.fn().mockRejectedValue(mockError);
        const consoleSpy = vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(InputArea_1.default, { onSendMessage: mockOnSendMessageWithError }));
        const textarea = react_1.screen.getByPlaceholderText('Type a message...');
        await user_event_1.userEvent.type(textarea, 'Test message');
        await user_event_1.userEvent.click(react_1.screen.getByText('Send'));
        (0, vitest_1.expect)(consoleSpy).toHaveBeenCalledWith('Failed to send message:', mockError);
        consoleSpy.mockRestore();
    });
});
