import { useState, useEffect, useCallback } from 'react';
import { Message, ChatError } from '../types/chat';
import { ElectronBridge, IpcChannels } from '../types/electron';

export type MessageStatus = 'complete' | 'streaming' | 'error' | 'pending';

export interface ChatMessage extends Message {
    chatId?: string;
}

const electron = window.electron;

const SYSTEM_MESSAGE: ChatMessage = {
    role: 'system',
    content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
    id: 'system-message',
    timestamp: Date.now(),
    status: 'complete'
};

export interface UseChatHistoryReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    loadChat: (chatId: string) => Promise<void>;
    addMessage: (chatId: string, message: Message) => Promise<void>;
    updateMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => Promise<void>;
    deleteMessage: (chatId: string, messageId: string) => Promise<void>;
    getMessage: (messageId: string) => ChatMessage | undefined;
    getMessagesByStatus: (status: MessageStatus) => ChatMessage[];
    clearChat: (chatId: string) => Promise<void>;
    initializeChat: (chatId: string) => Promise<void>;
}

export const useChatHistory = (): UseChatHistoryReturn => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Initialize new chat
    const initializeChat = useCallback(async (chatId: string): Promise<void> => {
        const initialMessages = [SYSTEM_MESSAGE];
        setMessages(initialMessages);
        try {
            await electron.invoke(IpcChannels.SAVE_CHAT, {
                chatId,
                messages: initialMessages
            });
        } catch (error) {
            throw new ChatError(
                'Failed to initialize chat',
                'INIT_ERROR',
                { chatId, error }
            );
        }
    }, []);

    // Load chat history
    const loadChat = useCallback(async (chatId: string): Promise<void> => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        setIsLoading(true);
        try {
            const loadedMessages = await electron.invoke(IpcChannels.LOAD_CHAT, chatId) as Message[];
            setMessages(loadedMessages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp || Date.now()
            })));
        } catch (error) {
            console.error('Error loading chat:', error);
            setMessages([]);
            throw new ChatError(
                'Failed to load chat history',
                'LOAD_ERROR',
                { chatId, error }
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add a new message
    const addMessage = useCallback(async (chatId: string, message: Message): Promise<void> => {
        if (!chatId || !message) return;

        const newMessage: ChatMessage = {
            ...message,
            id: message.id || crypto.randomUUID(),
            timestamp: message.timestamp || Date.now(),
            status: 'complete'
        };

        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, newMessage];
            
            // Save to disk asynchronously
            electron.invoke(IpcChannels.SAVE_CHAT, {
                chatId,
                messages: updatedMessages
            }).catch((error: Error) => {
                console.error('Error saving chat:', error);
                throw new ChatError(
                    'Failed to save chat',
                    'SAVE_ERROR',
                    { chatId, error: error.message }
                );
            });
            
            return updatedMessages;
        });
    }, []);

    // Update an existing message
    const updateMessage = useCallback(async (
        chatId: string,
        messageId: string,
        updates: Partial<ChatMessage>
    ): Promise<void> => {
        if (!chatId || !messageId) return;

        setMessages(prevMessages => {
            const messageIndex = prevMessages.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1) return prevMessages;

            const updatedMessages = [...prevMessages];
            updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                ...updates,
                timestamp: Date.now()
            };

            // Save to disk asynchronously
            electron.invoke(IpcChannels.SAVE_CHAT, {
                chatId,
                messages: updatedMessages
            }).catch((error: Error) => {
                console.error('Error saving chat:', error);
                throw new ChatError(
                    'Failed to update message',
                    'UPDATE_ERROR',
                    { chatId, messageId, error: error.message }
                );
            });

            return updatedMessages;
        });
    }, []);

    // Delete a message
    const deleteMessage = useCallback(async (chatId: string, messageId: string): Promise<void> => {
        if (!chatId || !messageId) return;

        setMessages(prevMessages => {
            const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
            
            // Save to disk asynchronously
            electron.invoke(IpcChannels.SAVE_CHAT, {
                chatId,
                messages: updatedMessages
            }).catch((error: Error) => {
                console.error('Error saving chat:', error);
                throw new ChatError(
                    'Failed to delete message',
                    'DELETE_ERROR',
                    { chatId, messageId, error: error.message }
                );
            });

            return updatedMessages;
        });
    }, []);

    // Get message by ID
    const getMessage = useCallback((messageId: string): ChatMessage | undefined => {
        return messages.find(msg => msg.id === messageId);
    }, [messages]);

    // Get messages with a specific status
    const getMessagesByStatus = useCallback((status: MessageStatus): ChatMessage[] => {
        return messages.filter(msg => msg.status === status);
    }, [messages]);

    // Clear chat history
    const clearChat = useCallback(async (chatId: string): Promise<void> => {
        if (!chatId) return;

        setMessages([]);
        try {
            await electron.invoke(IpcChannels.SAVE_CHAT, {
                chatId,
                messages: []
            });
        } catch (error) {
            console.error('Error clearing chat:', error);
            throw new ChatError(
                'Failed to clear chat',
                'CLEAR_ERROR',
                { chatId, error }
            );
        }
    }, []);

    // Auto-save messages when component unmounts
    useEffect(() => {
        return () => {
            if (messages.length > 0) {
                const chatId = messages[0]?.chatId;
                if (chatId) {
                    electron.invoke(IpcChannels.SAVE_CHAT, {
                        chatId,
                        messages
                    }).catch(error => {
                        console.error('Error saving chat on unmount:', error);
                    });
                }
            }
        };
    }, [messages]);

    return {
        messages,
        isLoading,
        loadChat,
        addMessage,
        updateMessage,
        deleteMessage,
        getMessage,
        getMessagesByStatus,
        clearChat,
        initializeChat
    };
}; 