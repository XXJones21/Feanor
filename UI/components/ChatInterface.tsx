'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import TitleBar from './Common/TitleBar';
import MessageList from './Chat/MessageList';
import InputArea from './Chat/InputArea';
import ErrorBoundary from './Common/ErrorBoundary';
import { ResumeAnalyzer } from './ResumeAnalyzer';
import { Message } from '../types/chat';
import { IpcChannels } from '../types/electron';

const ChatInterface: React.FC = () => {
    const [currentChatId, setCurrentChatId] = useState<string>(Date.now().toString());
    const [currentTool, setCurrentTool] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tools] = useState([
        {
            name: 'Resume Analyzer',
            description: 'Analyze and improve your resume based on job postings',
            component: 'ResumeAnalyzer',
            icon: '📄'
        }
    ]);

    // Initialize chat with system message
    useEffect(() => {
        if (messages.length === 0) {
            const systemMessage: Message = {
                id: crypto.randomUUID(),
                role: 'system',
                content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
                timestamp: Date.now(),
                status: 'complete' as const
            };
            setMessages([systemMessage]);
        }
    }, []);

    const handleNewChat = useCallback(() => {
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        setCurrentTool(null);
        // Reset messages with system message
        const systemMessage: Message = {
            id: crypto.randomUUID(),
            role: 'system',
            content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
            timestamp: Date.now(),
            status: 'complete' as const
        };
        setMessages([systemMessage]);
    }, []);

    const handleToolSelect = (toolName: string) => {
        setCurrentTool(toolName);
    };

    const handleSendMessage = async (content: string) => {
        if (!currentChatId) return;
        
        setIsLoading(true);
        try {
            // Create user message
            const newMessage: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                content: content,
                timestamp: Date.now(),
                status: 'pending' as const
            };
            
            // Update messages state with new message
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);

            // Prepare request messages (only role and content needed for API)
            const requestMessages = updatedMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Send request through IPC
            try {
                const response = await window.electron.invoke(IpcChannels.CHAT_COMPLETION, {
                    messages: requestMessages,
                    functions: [],
                    temperature: 0.7,
                    stream: false,
                    function_call: 'auto'
                });

                if (!response?.choices?.[0]?.message?.content) {
                    throw new Error('Invalid response from server');
                }

                // Add assistant's response
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.choices[0].message.content,
                    timestamp: Date.now(),
                    status: 'complete' as const
                };
                setMessages(prev => [...prev, assistantMessage]);

            } catch (error) {
                console.error('Error in chat completion:', error);
                // Add error message to the chat
                const errorMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'system',
                    content: 'Failed to send message. Please try again.',
                    timestamp: Date.now(),
                    status: 'error' as const,
                    error: {
                        message: 'Failed to send message. Please try again.',
                        retryable: true
                    }
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (currentTool === 'Resume Analyzer') {
            return <ResumeAnalyzer />;
        }

        return (
            <>
                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    onRetry={async () => {}}
                />
                <InputArea
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
            </>
        );
    };

    return (
        <ErrorBoundary>
            <div className="grid grid-cols-[250px,1fr] h-screen bg-background">
                <Sidebar
                    currentChatId={currentChatId}
                    onChatSelect={setCurrentChatId}
                    onNewChat={handleNewChat}
                    tools={tools}
                    onToolSelect={handleToolSelect}
                />
                
                <div className="flex flex-col h-full">
                    <TitleBar />
                    {renderContent()}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ChatInterface; 