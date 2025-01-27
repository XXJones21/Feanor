import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ChatListContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
`;

const ChatItem = styled(motion.div)`
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    border-radius: 8px;
    cursor: pointer;
    background: ${props => props.isActive ? props.theme.colors.primaryLight : 'transparent'};
    color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.text};
    
    &:hover {
        background: ${props => props.isActive ? props.theme.colors.primaryLight : props.theme.colors.backgroundLight};
    }

    .chat-title {
        font-weight: ${props => props.isActive ? '600' : '400'};
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }

    .chat-preview {
        font-size: 0.8rem;
        color: ${props => props.theme.colors.textLight};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: ${props => props.theme.colors.textLight};
`;

const ChatList = ({ chats, currentChatId, onChatSelect }) => {
    if (!chats || chats.length === 0) {
        return (
            <EmptyState>
                No chats yet. Start a new conversation!
            </EmptyState>
        );
    }

    return (
        <ChatListContainer>
            <AnimatePresence>
                {chats.map(chat => (
                    <ChatItem
                        key={chat.id}
                        isActive={chat.id === currentChatId}
                        onClick={() => onChatSelect(chat.id)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="chat-title">
                            {chat.title || `Chat ${new Date(parseInt(chat.id)).toLocaleDateString()}`}
                        </div>
                        <div className="chat-preview">
                            {chat.lastMessage || 'No messages yet'}
                        </div>
                    </ChatItem>
                ))}
            </AnimatePresence>
        </ChatListContainer>
    );
};

export default ChatList; 