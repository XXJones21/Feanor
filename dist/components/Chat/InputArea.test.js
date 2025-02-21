import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import InputArea from './InputArea';
// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => (_jsx("div", { ...props, children: children })),
        button: ({ children, ...props }) => (_jsx("button", { ...props, children: children })),
    },
    AnimatePresence: ({ children }) => _jsx(_Fragment, { children: children }),
}));
// Mock the cn utility
vi.mock('@/lib/utils', () => ({
    cn: (...inputs) => inputs.filter(Boolean).join(' '),
}));
describe('InputArea', () => {
    let user;
    const mockOnSendMessage = vi.fn();
    const defaultProps = {
        onSendMessage: mockOnSendMessage,
    };
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });
    it('renders correctly', () => {
        render(_jsx(InputArea, { ...defaultProps }));
        expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
        expect(screen.getByText('Send')).toBeInTheDocument();
    });
    it('handles text input correctly', async () => {
        render(_jsx(InputArea, { ...defaultProps }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        await user.type(textarea, 'Hello, world!');
        expect(textarea).toHaveValue('Hello, world!');
    });
    it('sends message on button click', async () => {
        render(_jsx(InputArea, { ...defaultProps }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        const sendButton = screen.getByText('Send');
        await user.type(textarea, 'Test message');
        await user.click(sendButton);
        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
        expect(textarea).toHaveValue('');
    });
    it('sends message on Enter key', async () => {
        render(_jsx(InputArea, { ...defaultProps }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        await user.type(textarea, 'Test message{enter}');
        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
        expect(textarea).toHaveValue('');
    });
    it('does not send empty messages', async () => {
        render(_jsx(InputArea, { ...defaultProps }));
        const sendButton = screen.getByText('Send');
        await user.click(sendButton);
        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
    it('handles loading state correctly', () => {
        render(_jsx(InputArea, { ...defaultProps, isLoading: true }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        const sendButton = screen.getByText('Sending...');
        expect(textarea).toBeDisabled();
        expect(sendButton).toBeDisabled();
    });
    it('handles file paste', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const clipboardData = {
            items: [
                { type: 'image/png', getAsFile: () => file }
            ]
        };
        render(_jsx(InputArea, { ...defaultProps }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        fireEvent.paste(textarea, { clipboardData });
        await waitFor(() => {
            expect(screen.getByText('📎 test.png')).toBeInTheDocument();
        });
    });
    it('handles file drop', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        render(_jsx(InputArea, { ...defaultProps }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        fireEvent.drop(textarea, {
            dataTransfer: {
                files: [file]
            }
        });
        await waitFor(() => {
            expect(screen.getByText('📎 test.png')).toBeInTheDocument();
        });
    });
    it('allows removing attachments', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        render(_jsx(InputArea, { ...defaultProps }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        fireEvent.drop(textarea, {
            dataTransfer: {
                files: [file]
            }
        });
        await waitFor(() => {
            const removeButton = screen.getByLabelText('Remove attachment');
            fireEvent.click(removeButton);
            expect(screen.queryByText('📎 test.png')).not.toBeInTheDocument();
        });
    });
    it('handles error during message send', async () => {
        const mockError = new Error('Failed to send');
        const mockOnSendMessageWithError = vi.fn().mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        render(_jsx(InputArea, { onSendMessage: mockOnSendMessageWithError }));
        const textarea = screen.getByPlaceholderText('Type a message...');
        await user.type(textarea, 'Test message');
        await user.click(screen.getByText('Send'));
        expect(consoleSpy).toHaveBeenCalledWith('Failed to send message:', mockError);
        consoleSpy.mockRestore();
    });
});
