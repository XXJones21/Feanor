import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import { type Message as MessageType } from '@/types/chat';
import { 
    scrollToBottom,
    isScrolledToBottom,
    handleStreamingScroll,
    createInfiniteScroll 
} from '@/lib/chat/scroll';
import { groupMessagesByDate } from '@/lib/chat/message';

interface MessageListProps {
    messages: MessageType[];
    isLoading?: boolean;
    onRetry?: (index: number) => void;
    className?: string;
    onLoadMore?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    isLoading = false,
    onRetry,
    className,
    onLoadMore
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // Set up infinite scroll if onLoadMore is provided
    useEffect(() => {
        if (onLoadMore && containerRef.current) {
            const observer = createInfiniteScroll(
                containerRef.current,
                onLoadMore,
                { rootMargin: '200px' }
            );
            return () => observer.disconnect();
        }
    }, [onLoadMore]);

    // Handle auto-scrolling for new messages
    useEffect(() => {
        if (containerRef.current && lastMessageRef.current) {
            const cleanup = handleStreamingScroll(
                containerRef.current,
                lastMessageRef.current
            );
            return cleanup;
        }
    }, [messages]);

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    const renderMessage = (message: MessageType, index: number) => {
        const hasError = message.status === 'error';
        const isLast = index === messages.length - 1;

        return (
            <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                ref={isLast ? lastMessageRef : undefined}
            >
                <Message {...message} />
                {hasError && message.error?.retryable && onRetry && (
                    <div className="flex flex-col items-end gap-2 mt-2">
                        <div className="text-sm text-error bg-error/10 px-4 py-2 rounded-lg">
                            Failed to send message
                        </div>
                        <button
                            onClick={() => onRetry(index)}
                            className={cn(
                                "px-4 py-2 rounded-lg",
                                "bg-primary text-primary-foreground",
                                "text-sm font-medium",
                                "hover:bg-primary/90 transition-colors"
                            )}
                        >
                            Retry
                        </button>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex-1 overflow-y-auto p-4 scroll-smooth",
                className
            )}
        >
            <AnimatePresence>
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date} className="mb-6">
                        <div className="sticky top-0 z-10 flex justify-center mb-4">
                            <span className="px-3 py-1 text-xs bg-muted rounded-full">
                                {date}
                            </span>
                        </div>
                        {dateMessages.map((message, index) => renderMessage(message, index))}
                    </div>
                ))}
            </AnimatePresence>
            {isLoading && <LoadingIndicator />}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList; 