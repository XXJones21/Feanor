import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import { motion, AnimatePresence } from 'framer-motion';

const MessageContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    scroll-behavior: smooth;
`;

const RetryButton = styled.button`
    padding: 8px 16px;
    margin-top: 8px;
    background: ${props => props.theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background: ${props => props.theme.colors.primaryDark};
    }
`;

const ErrorMessage = styled.div`
    color: ${props => props.theme.colors.error};
    padding: 8px;
    margin: 8px 0;
    border-radius: 4px;
    background: ${props => props.theme.colors.errorBackground};
`;

const MessageList = ({ messages, isLoading, onRetry }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const renderMessage = (message, index) => {
        const hasError = message.status === 'error';

        return (
            <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Message {...message} />
                {hasError && message.retryable && (
                    <div style={{ textAlign: 'right' }}>
                        <ErrorMessage>
                            Failed to send message
                        </ErrorMessage>
                        <RetryButton onClick={() => onRetry(index)}>
                            Retry
                        </RetryButton>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <MessageContainer>
            <AnimatePresence>
                {messages.map((message, index) => renderMessage(message, index))}
            </AnimatePresence>
            {isLoading && <LoadingIndicator />}
            <div ref={bottomRef} />
        </MessageContainer>
    );
};

export default MessageList; 