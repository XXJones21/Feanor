import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageList from './Chat/MessageList';
import InputArea from './Chat/InputArea';
import Sidebar from './Sidebar';
import TitleBar from './Common/TitleBar';
import { useTools } from '../hooks/useTools';
import { useChatHistory } from '../hooks/useChatHistory';
import ErrorBoundary from './Common/ErrorBoundary';
import { Message, FileAttachment, ChatError } from '../types/chat';

const ChatInterface: React.FC = () => {
    const [currentChatId, setCurrentChatId] = useState<string>(Date.now().toString());
    const { messages, addMessage, loadChat, initializeChat } = useChatHistory();
    const { tools, executeToolByName } = useTools();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Initialize chat when component mounts or when currentChatId changes
    useEffect(() => {
        if (currentChatId) {
            loadChat(currentChatId);
        }
    }, [currentChatId, loadChat]);

    const handleNewChat = useCallback(() => {
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        initializeChat(newId);
    }, [initializeChat]);

    const retryMessage = async (messageIndex: number): Promise<void> => {
        if (messageIndex >= 0 && messageIndex < messages.length) {
            const messagesToRetry = messages.slice(0, messageIndex + 1);
            const messageToRetry = messagesToRetry[messageIndex];
            if (messageToRetry) {
                await handleSendMessage(messageToRetry.content);
            }
        }
    };

    const handleSendMessage = async (content: string, attachment: FileAttachment | null = null): Promise<void> => {
        if (!content.trim() && !attachment) return;
        
        setIsLoading(true);
        
        try {
            // Handle file attachment if present
            let attachmentResult: unknown = null;
            if (attachment) {
                attachmentResult = await executeToolByName('analyze_file', {
                    file_path: attachment.path
                });
            }

            // Add user message
            const userMessage: Message = {
                role: 'user',
                content: attachment 
                    ? `${content} [Attached: ${attachment.name}]`
                    : content,
                timestamp: Date.now(),
                id: crypto.randomUUID()
            };
            await addMessage(currentChatId, userMessage);

            // Add attachment result if present
            if (attachmentResult) {
                await addMessage(currentChatId, {
                    role: 'system',
                    content: `File analysis result:\n${JSON.stringify(attachmentResult, null, 2)}`,
                    timestamp: Date.now(),
                    id: crypto.randomUUID()
                });
            }

            // Get AI response without streaming
            const allMessages: Message[] = [...messages, userMessage];
            const response = await window.electron.invoke('chat-completion', {
                messages: allMessages,
                functions: tools,
                temperature: 0.7,
                stream: false,
                function_call: "auto",
                model: 'local-model'
            });

            // Process assistant's response
            let assistantContent = response.choices[0].message.content;
            
            // Filter out thinking process
            if (assistantContent.includes('<think>') && assistantContent.includes('</think>')) {
                assistantContent = assistantContent.split('</think>')[1].trim();
            }

            // Add assistant's response
            await addMessage(currentChatId, {
                role: 'assistant',
                content: assistantContent,
                timestamp: Date.now(),
                id: crypto.randomUUID()
            });

        } catch (error) {
            console.error('Error sending message:', error);
            const chatError = error instanceof ChatError 
                ? error 
                : new ChatError(
                    error instanceof Error ? error.message : 'Unknown error occurred',
                    'CHAT_ERROR'
                  );
            
            await addMessage(currentChatId, {
                role: 'system',
                content: `Error: ${chatError.message}`,
                timestamp: Date.now(),
                id: crypto.randomUUID()
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ErrorBoundary>
            <div className="grid grid-cols-[250px,1fr] h-screen bg-background">
                <Sidebar
                    currentChatId={currentChatId}
                    onChatSelect={setCurrentChatId}
                    onNewChat={handleNewChat}
                    tools={tools}
                    onToolSelect={executeToolByName}
                />
                
                <div className="flex flex-col h-full">
                    <TitleBar />
                    
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        onRetry={retryMessage}
                    />
                    
                    <InputArea
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ChatInterface; 