import { useState, useEffect, useCallback } from 'react';
import { Message, ChatError, ElectronBridge } from '../types/chat';

export type MessageStatus = 'complete' | 'streaming' | 'error' | 'pending';

export interface ChatMessage extends Omit<Message, 'timestamp'> {
    id: string;
    timestamp: string;
    status?: MessageStatus;
    chatId?: string;
}

declare global {
    interface Window {
        electron: ElectronBridge;
    }
}

const { ipcRenderer } = window.electron;

const SYSTEM_MESSAGE: ChatMessage = {
    role: 'system',
    content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
    id: 'system-message',
    timestamp: new Date().toISOString(),
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
            await ipcRenderer.invoke('save-chat', {
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
            const loadedMessages = await ipcRenderer.invoke('load-chat', chatId) as (Message & { id: string })[];
            setMessages(loadedMessages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp || new Date().toISOString()
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
            timestamp: message.timestamp || new Date().toISOString(),
            status: 'complete'
        };

        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, newMessage];
            
            // Save to disk asynchronously
            ipcRenderer.invoke('save-chat', {
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
                timestamp: new Date().toISOString()
            };

            // Save to disk asynchronously
            ipcRenderer.invoke('save-chat', {
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
            ipcRenderer.invoke('save-chat', {
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
            await ipcRenderer.invoke('save-chat', {
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
                    ipcRenderer.invoke('save-chat', {
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