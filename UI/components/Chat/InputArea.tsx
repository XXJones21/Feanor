import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FileAttachment } from '@/types/chat';
import { formatMessage } from '@/lib/chat/message';

interface InputAreaProps {
    /**
     * Callback function when a message is sent
     * @param content The message content
     * @param attachment Optional file attachment
     */
    onSendMessage: (content: string, attachment?: FileAttachment | null) => Promise<void>;
    /**
     * Whether the input is in loading state
     */
    isLoading?: boolean;
    /**
     * Optional className for custom styling
     */
    className?: string;
    /**
     * Maximum number of characters allowed
     * @default undefined
     */
    maxLength?: number;
}

/**
 * InputArea component for sending messages and handling file attachments
 */
const InputArea: React.FC<InputAreaProps> = ({
    onSendMessage,
    isLoading = false,
    className,
    maxLength
}) => {
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<FileAttachment | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    const adjustTextAreaHeight = useCallback(() => {
        const textarea = textAreaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, []);

    useEffect(() => {
        adjustTextAreaHeight();
    }, [message, adjustTextAreaHeight]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (maxLength && value.length > maxLength) return;
        setMessage(value);
    }, [maxLength]);

    const handleSend = useCallback(async () => {
        const trimmedMessage = formatMessage({ 
            content: message, 
            role: 'user', 
            id: '', 
            timestamp: Date.now(),
            status: 'complete' as const
        }, {
            formatNewlines: false,
            stripMarkdown: false
        });

        if (trimmedMessage || attachment) {
            try {
                await onSendMessage(trimmedMessage, attachment);
                setMessage('');
                setAttachment(null);
                if (textAreaRef.current) {
                    textAreaRef.current.style.height = 'auto';
                }
            } catch (error) {
                console.error('Failed to send message:', error);
                // You might want to show an error toast here
            }
        }
    }, [message, attachment, onSendMessage]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    setAttachment({
                        name: file.name,
                        path: URL.createObjectURL(file),
                        type: file.type,
                        size: file.size
                    });
                }
                break;
            }
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setAttachment({
                name: file.name,
                path: URL.createObjectURL(file),
                type: file.type,
                size: file.size
            });
        }
    }, []);

    const handleRemoveAttachment = useCallback(() => {
        if (attachment?.path) {
            URL.revokeObjectURL(attachment.path);
        }
        setAttachment(null);
    }, [attachment]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (attachment?.path) {
                URL.revokeObjectURL(attachment.path);
            }
        };
    }, [attachment]);

    const charCount = message.length;
    const isOverLimit = maxLength ? charCount > maxLength : false;

    return (
        <div className={cn(
            "border-t border-border bg-background p-4",
            className
        )}>
            <div className="max-w-[1200px] mx-auto">
                <AnimatePresence>
                    {attachment && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center gap-2 p-2 mb-2 bg-muted rounded-lg"
                        >
                            <span className="text-sm text-muted-foreground">
                                📎 {attachment.name}
                            </span>
                            <button
                                onClick={handleRemoveAttachment}
                                className="p-1 hover:bg-background rounded-full transition-colors"
                                aria-label="Remove attachment"
                            >
                                ×
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex flex-col gap-2">
                    <div className="flex items-end gap-4">
                        <textarea
                            ref={textAreaRef}
                            value={message}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            onPaste={handlePaste}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            placeholder="Type a message..."
                            rows={1}
                            disabled={isLoading}
                            className={cn(
                                "flex-1 min-h-[24px] max-h-[200px] p-3",
                                "rounded-xl border bg-background",
                                "text-sm leading-relaxed resize-none",
                                "transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-primary",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                isOverLimit && "border-error focus:ring-error"
                            )}
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading || (!message.trim() && !attachment) || isOverLimit}
                            onClick={() => void handleSend()}
                            className={cn(
                                "px-6 py-3 rounded-xl",
                                "bg-primary text-primary-foreground",
                                "font-semibold text-sm",
                                "transition-colors duration-200",
                                "hover:bg-primary/90",
                                "disabled:bg-muted disabled:cursor-not-allowed"
                            )}
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </motion.button>
                    </div>
                    {maxLength && (
                        <div className={cn(
                            "text-xs text-right",
                            isOverLimit ? "text-error" : "text-muted-foreground"
                        )}>
                            {charCount}/{maxLength} characters
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InputArea; 