'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from './Sidebar'
import { MessageList } from './Chat/MessageList'
import { InputArea } from './Chat/InputArea'
import TitleBar from './Common/TitleBar'
import ErrorBoundary from './Common/ErrorBoundary'
import { ResumeAnalyzer } from './ResumeAnalyzer'
import { Message, User } from '@/types/chat'
import { IpcChannels } from '@/types/electron'
import { ToolsProvider, useToolsContext } from '@/contexts/ToolsProvider'

// Default system user
const SYSTEM_USER: User = {
    id: 'system',
    name: 'System',
    isBot: true
};

// Assistant user
const ASSISTANT_USER: User = {
    id: 'assistant',
    name: 'AI Assistant',
    isBot: true
};

// Current user
const CURRENT_USER: User = {
    id: 'user',
    name: 'You',
    isBot: false
};

interface ChatInterfaceContentProps {
    currentChatId: string;
}

function ChatInterfaceContent({ currentChatId }: ChatInterfaceContentProps) {
    const { selectedTool, clearSelectedTool } = useToolsContext();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    // Initialize chat with system message
    React.useEffect(() => {
        if (messages.length === 0) {
            const systemMessage: Message = {
                id: crypto.randomUUID(),
                role: 'system',
                content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
                timestamp: Date.now(),
                status: 'sent',
                sender: SYSTEM_USER
            };
            setMessages([systemMessage]);
        }
    }, [messages.length]);

    const handleNewChat = React.useCallback(() => {
        clearSelectedTool();
        const systemMessage: Message = {
            id: crypto.randomUUID(),
            role: 'system',
            content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
            timestamp: Date.now(),
            status: 'sent',
            sender: SYSTEM_USER
        };
        setMessages([systemMessage]);
    }, [clearSelectedTool]);

    const handleSendMessage = async (content: string) => {
        if (!currentChatId) return;
        
        setIsLoading(true);
        try {
            // Create user message
            const newMessage: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                content,
                timestamp: Date.now(),
                status: 'sending',
                sender: CURRENT_USER
            };
            
            // Update messages state with new message
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);

            // Prepare request messages
            const requestMessages = updatedMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

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

                // Update user message status
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === newMessage.id 
                            ? { ...msg, status: 'sent' } 
                            : msg
                    )
                );

                // Add assistant's response
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.choices[0].message.content,
                    timestamp: Date.now(),
                    status: 'sent',
                    sender: ASSISTANT_USER
                };
                setMessages(prev => [...prev, assistantMessage]);

            } catch (error) {
                console.error('Error in chat completion:', error);
                // Update user message status to error
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === newMessage.id 
                            ? { 
                                ...msg, 
                                status: 'error',
                                error: {
                                    message: 'Failed to send message. Please try again.',
                                    retryable: true,
                                    code: 'SEND_ERROR'
                                }
                            } 
                            : msg
                    )
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = async (messageId: string) => {
        const messageToRetry = messages.find(msg => msg.id === messageId);
        if (!messageToRetry) return;

        // Remove the failed message and any subsequent messages
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        const updatedMessages = messages.slice(0, messageIndex);
        setMessages(updatedMessages);

        // Resend the message
        await handleSendMessage(messageToRetry.content);
    };

    const handleDelete = (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const renderContent = () => {
        if (selectedTool?.component === 'ResumeAnalyzer') {
            return <ResumeAnalyzer />;
        }

        return (
            <>
                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    onRetry={handleRetry}
                    onDelete={handleDelete}
                />
                <InputArea
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                />
            </>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <TitleBar />
            {renderContent()}
        </div>
    );
}

const ChatInterface: React.FC = () => {
    const [currentChatId, setCurrentChatId] = React.useState<string>(Date.now().toString());

    const handleNewChat = React.useCallback(() => {
        setCurrentChatId(Date.now().toString());
    }, []);

    return (
        <ErrorBoundary>
            <ToolsProvider>
                <div className="grid grid-cols-[250px,1fr] h-screen bg-background">
                    <Sidebar
                        currentChatId={currentChatId}
                        onChatSelect={setCurrentChatId}
                        onNewChat={handleNewChat}
                    />
                    <ChatInterfaceContent currentChatId={currentChatId} />
                </div>
            </ToolsProvider>
        </ErrorBoundary>
    );
};

export default ChatInterface; 