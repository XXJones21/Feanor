"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatHistory = void 0;
const react_1 = require("react");
const chat_1 = require("../types/chat");
const electron_1 = require("../types/electron");
const electron = window.electron;
const SYSTEM_MESSAGE = {
    role: 'system',
    content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
    id: 'system-message',
    timestamp: Date.now(),
    status: 'complete'
};
const useChatHistory = () => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    // Initialize new chat
    const initializeChat = (0, react_1.useCallback)(async (chatId) => {
        const initialMessages = [SYSTEM_MESSAGE];
        setMessages(initialMessages);
        try {
            await electron.invoke(electron_1.IpcChannels.SAVE_CHAT, {
                chatId,
                messages: initialMessages
            });
        }
        catch (error) {
            throw new chat_1.ChatError('Failed to initialize chat', 'INIT_ERROR', { chatId, error });
        }
    }, []);
    // Load chat history
    const loadChat = (0, react_1.useCallback)(async (chatId) => {
        if (!chatId) {
            setMessages([]);
            return;
        }
        setIsLoading(true);
        try {
            const loadedMessages = await electron.invoke(electron_1.IpcChannels.LOAD_CHAT, chatId);
            setMessages(loadedMessages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp || Date.now()
            })));
        }
        catch (error) {
            console.error('Error loading chat:', error);
            setMessages([]);
            throw new chat_1.ChatError('Failed to load chat history', 'LOAD_ERROR', { chatId, error });
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Add a new message
    const addMessage = (0, react_1.useCallback)(async (chatId, message) => {
        if (!chatId || !message)
            return;
        const newMessage = {
            ...message,
            id: message.id || crypto.randomUUID(),
            timestamp: message.timestamp || Date.now(),
            status: 'complete'
        };
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, newMessage];
            // Save to disk asynchronously
            electron.invoke(electron_1.IpcChannels.SAVE_CHAT, {
                chatId,
                messages: updatedMessages
            }).catch((error) => {
                console.error('Error saving chat:', error);
                throw new chat_1.ChatError('Failed to save chat', 'SAVE_ERROR', { chatId, error: error.message });
            });
            return updatedMessages;
        });
    }, []);
    // Update an existing message
    const updateMessage = (0, react_1.useCallback)(async (chatId, messageId, updates) => {
        if (!chatId || !messageId)
            return;
        setMessages(prevMessages => {
            const messageIndex = prevMessages.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1)
                return prevMessages;
            const updatedMessages = [...prevMessages];
            updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                ...updates,
                timestamp: Date.now()
            };
            // Save to disk asynchronously
            electron.invoke(electron_1.IpcChannels.SAVE_CHAT, {
                chatId,
                messages: updatedMessages
            }).catch((error) => {
                console.error('Error saving chat:', error);
                throw new chat_1.ChatError('Failed to update message', 'UPDATE_ERROR', { chatId, messageId, error: error.message });
            });
            return updatedMessages;
        });
    }, []);
    // Delete a message
    const deleteMessage = (0, react_1.useCallback)(async (chatId, messageId) => {
        if (!chatId || !messageId)
            return;
        setMessages(prevMessages => {
            const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
            // Save to disk asynchronously
            electron.invoke(electron_1.IpcChannels.SAVE_CHAT, {
                chatId,
                messages: updatedMessages
            }).catch((error) => {
                console.error('Error saving chat:', error);
                throw new chat_1.ChatError('Failed to delete message', 'DELETE_ERROR', { chatId, messageId, error: error.message });
            });
            return updatedMessages;
        });
    }, []);
    // Get message by ID
    const getMessage = (0, react_1.useCallback)((messageId) => {
        return messages.find(msg => msg.id === messageId);
    }, [messages]);
    // Get messages with a specific status
    const getMessagesByStatus = (0, react_1.useCallback)((status) => {
        return messages.filter(msg => msg.status === status);
    }, [messages]);
    // Clear chat history
    const clearChat = (0, react_1.useCallback)(async (chatId) => {
        if (!chatId)
            return;
        setMessages([]);
        try {
            await electron.invoke(electron_1.IpcChannels.SAVE_CHAT, {
                chatId,
                messages: []
            });
        }
        catch (error) {
            console.error('Error clearing chat:', error);
            throw new chat_1.ChatError('Failed to clear chat', 'CLEAR_ERROR', { chatId, error });
        }
    }, []);
    // Auto-save messages when component unmounts
    (0, react_1.useEffect)(() => {
        return () => {
            if (messages.length > 0) {
                const chatId = messages[0]?.chatId;
                if (chatId) {
                    electron.invoke(electron_1.IpcChannels.SAVE_CHAT, {
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
exports.useChatHistory = useChatHistory;
