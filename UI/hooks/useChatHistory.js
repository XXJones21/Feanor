import { useState, useEffect, useCallback } from 'react';
const { ipcRenderer } = window.electron;

const SYSTEM_MESSAGE = {
    role: 'system',
    content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
    id: 'system-message',
    timestamp: new Date().toISOString(),
    status: 'complete'
};

export const useChatHistory = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize new chat
    const initializeChat = useCallback(async (chatId) => {
        const initialMessages = [SYSTEM_MESSAGE];
        setMessages(initialMessages);
        await ipcRenderer.invoke('save-chat', {
            chatId,
            messages: initialMessages
        });
    }, []);

    // Load chat history
    const loadChat = useCallback(async (chatId) => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        setIsLoading(true);
        try {
            const loadedMessages = await ipcRenderer.invoke('load-chat', chatId);
            setMessages(loadedMessages || []);
        } catch (error) {
            console.error('Error loading chat:', error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add a new message
    const addMessage = useCallback(async (chatId, message) => {
        if (!chatId || !message) return;

        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, message];
            
            // Save to disk asynchronously
            ipcRenderer.invoke('save-chat', {
                chatId,
                messages: updatedMessages
            }).catch(error => {
                console.error('Error saving chat:', error);
            });
            
            return updatedMessages;
        });
    }, []);

    // Update an existing message
    const updateMessage = useCallback(async (chatId, messageId, updates) => {
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
            }).catch(error => {
                console.error('Error saving chat:', error);
            });

            return updatedMessages;
        });
    }, []);

    // Delete a message
    const deleteMessage = useCallback(async (chatId, messageId) => {
        if (!chatId || !messageId) return;

        setMessages(prevMessages => {
            const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
            
            // Save to disk asynchronously
            ipcRenderer.invoke('save-chat', {
                chatId,
                messages: updatedMessages
            }).catch(error => {
                console.error('Error saving chat:', error);
            });

            return updatedMessages;
        });
    }, []);

    // Get message by ID
    const getMessage = useCallback((messageId) => {
        return messages.find(msg => msg.id === messageId);
    }, [messages]);

    // Get messages with a specific status
    const getMessagesByStatus = useCallback((status) => {
        return messages.filter(msg => msg.status === status);
    }, [messages]);

    // Clear chat history
    const clearChat = useCallback(async (chatId) => {
        if (!chatId) return;

        setMessages([]);
        try {
            await ipcRenderer.invoke('save-chat', {
                chatId,
                messages: []
            });
        } catch (error) {
            console.error('Error clearing chat:', error);
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

// Message status types for reference
export const MessageStatus = {
    COMPLETE: 'complete',
    STREAMING: 'streaming',
    ERROR: 'error',
    PENDING: 'pending'
}; 