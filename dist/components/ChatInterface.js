'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Sidebar_1 = __importDefault(require("./Sidebar"));
const TitleBar_1 = __importDefault(require("./Common/TitleBar"));
const MessageList_1 = __importDefault(require("./Chat/MessageList"));
const InputArea_1 = __importDefault(require("./Chat/InputArea"));
const ErrorBoundary_1 = __importDefault(require("./Common/ErrorBoundary"));
const ResumeAnalyzer_1 = require("./ResumeAnalyzer");
const electron_1 = require("../types/electron");
const ChatInterface = () => {
    const [currentChatId, setCurrentChatId] = (0, react_1.useState)(Date.now().toString());
    const [currentTool, setCurrentTool] = (0, react_1.useState)(null);
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [tools] = (0, react_1.useState)([
        {
            name: 'Resume Analyzer',
            description: 'Analyze and improve your resume based on job postings',
            component: 'ResumeAnalyzer',
            icon: '📄'
        }
    ]);
    // Initialize chat with system message
    (0, react_1.useEffect)(() => {
        if (messages.length === 0) {
            const systemMessage = {
                id: crypto.randomUUID(),
                role: 'system',
                content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
                timestamp: Date.now(),
                status: 'complete'
            };
            setMessages([systemMessage]);
        }
    }, []);
    const handleNewChat = (0, react_1.useCallback)(() => {
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        setCurrentTool(null);
        // Reset messages with system message
        const systemMessage = {
            id: crypto.randomUUID(),
            role: 'system',
            content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
            timestamp: Date.now(),
            status: 'complete'
        };
        setMessages([systemMessage]);
    }, []);
    const handleToolSelect = (toolName) => {
        setCurrentTool(toolName);
    };
    const handleSendMessage = async (content) => {
        if (!currentChatId)
            return;
        setIsLoading(true);
        try {
            // Create user message
            const newMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: content,
                timestamp: Date.now(),
                status: 'pending'
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
                const response = await window.electron.invoke(electron_1.IpcChannels.CHAT_COMPLETION, {
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
                const assistantMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.choices[0].message.content,
                    timestamp: Date.now(),
                    status: 'complete'
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
            catch (error) {
                console.error('Error in chat completion:', error);
                // Add error message to the chat
                const errorMessage = {
                    id: crypto.randomUUID(),
                    role: 'system',
                    content: 'Failed to send message. Please try again.',
                    timestamp: Date.now(),
                    status: 'error',
                    error: {
                        message: 'Failed to send message. Please try again.',
                        retryable: true
                    }
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const renderContent = () => {
        if (currentTool === 'Resume Analyzer') {
            return (0, jsx_runtime_1.jsx)(ResumeAnalyzer_1.ResumeAnalyzer, {});
        }
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MessageList_1.default, { messages: messages, isLoading: isLoading, onRetry: async () => { } }), (0, jsx_runtime_1.jsx)(InputArea_1.default, { onSendMessage: handleSendMessage, isLoading: isLoading })] }));
    };
    return ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[250px,1fr] h-screen bg-background", children: [(0, jsx_runtime_1.jsx)(Sidebar_1.default, { currentChatId: currentChatId, onChatSelect: setCurrentChatId, onNewChat: handleNewChat, tools: tools, onToolSelect: handleToolSelect }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)(TitleBar_1.default, {}), renderContent()] })] }) }));
};
exports.default = ChatInterface;
