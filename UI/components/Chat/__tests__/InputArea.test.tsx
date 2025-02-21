import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import InputArea from '../InputArea';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<any>) => (
            <div {...props}>{children}</div>
        ),
        button: ({ children, ...props }: React.PropsWithChildren<any>) => (
            <button {...props}>{children}</button>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<any>) => <>{children}</>,
}));

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

describe('InputArea', () => {
    const mockOnSendMessage = vi.fn();
    const defaultProps = {
        onSendMessage: mockOnSendMessage,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<InputArea {...defaultProps} />);
        expect(screen.getByPlaceholderText('Type a message...')).toBeDefined();
        expect(screen.getByText('Send')).toBeDefined();
    });

    it('handles text input correctly', async () => {
        render(<InputArea {...defaultProps} />);
        const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
        
        await userEvent.type(textarea, 'Hello, world!');
        expect(textarea.value).toBe('Hello, world!');
    });

    it('sends message on button click', async () => {
        render(<InputArea {...defaultProps} />);
        const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
        const sendButton = screen.getByText('Send');

        await userEvent.type(textarea, 'Test message');
        await userEvent.click(sendButton);

        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
        expect(textarea.value).toBe('');
    });

    it('sends message on Enter key', async () => {
        render(<InputArea {...defaultProps} />);
        const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;

        await userEvent.type(textarea, 'Test message');
        await userEvent.keyboard('{Enter}');

        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', null);
        expect(textarea.value).toBe('');
    });

    it('does not send empty messages', async () => {
        render(<InputArea {...defaultProps} />);
        const sendButton = screen.getByText('Send');

        await userEvent.click(sendButton);
        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it('handles loading state correctly', () => {
        render(<InputArea {...defaultProps} isLoading />);
        
        const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
        const sendButton = screen.getByText('Sending...') as HTMLButtonElement;

        expect(textarea.disabled).toBe(true);
        expect(sendButton.disabled).toBe(true);
    });

    it('handles file paste', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const clipboardData = {
            items: [
                { type: 'image/png', getAsFile: () => file }
            ]
        };

        render(<InputArea {...defaultProps} />);
        const textarea = screen.getByPlaceholderText('Type a message...');

        fireEvent.paste(textarea, { clipboardData });

        const attachmentText = await screen.findByText('📎 test.png');
        expect(attachmentText).toBeDefined();
    });

    it('handles file drop', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        
        render(<InputArea {...defaultProps} />);
        const textarea = screen.getByPlaceholderText('Type a message...');

        fireEvent.drop(textarea, {
            dataTransfer: {
                files: [file]
            }
        });

        const attachmentText = await screen.findByText('📎 test.png');
        expect(attachmentText).toBeDefined();
    });

    it('allows removing attachments', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        
        render(<InputArea {...defaultProps} />);
        const textarea = screen.getByPlaceholderText('Type a message...');

        fireEvent.drop(textarea, {
            dataTransfer: {
                files: [file]
            }
        });

        const attachmentText = await screen.findByText('📎 test.png');
        expect(attachmentText).toBeDefined();

        const removeButton = screen.getByLabelText('Remove attachment');
        await userEvent.click(removeButton);
        
        expect(screen.queryByText('📎 test.png')).toBeNull();
    });

    it('handles error during message send', async () => {
        const mockError = new Error('Failed to send');
        const mockOnSendMessageWithError = vi.fn().mockRejectedValue(mockError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<InputArea onSendMessage={mockOnSendMessageWithError} />);
        const textarea = screen.getByPlaceholderText('Type a message...');
        
        await userEvent.type(textarea, 'Test message');
        await userEvent.click(screen.getByText('Send'));

        expect(consoleSpy).toHaveBeenCalledWith('Failed to send message:', mockError);
        consoleSpy.mockRestore();
    });
}); 