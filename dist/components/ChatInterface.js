'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const Sidebar_1 = require("./Sidebar");
const MessageList_1 = require("./Chat/MessageList");
const InputArea_1 = require("./Chat/InputArea");
const TitleBar_1 = __importDefault(require("./Common/TitleBar"));
const ErrorBoundary_1 = __importDefault(require("./Common/ErrorBoundary"));
const ResumeAnalyzer_1 = require("./ResumeAnalyzer");
const electron_1 = require("@/types/electron");
const ToolsProvider_1 = require("@/contexts/ToolsProvider");
// Default system user
const SYSTEM_USER = {
    id: 'system',
    name: 'System',
    isBot: true
};
// Assistant user
const ASSISTANT_USER = {
    id: 'assistant',
    name: 'AI Assistant',
    isBot: true
};
// Current user
const CURRENT_USER = {
    id: 'user',
    name: 'You',
    isBot: false
};
function ChatInterfaceContent({ currentChatId }) {
    const { selectedTool, clearSelectedTool } = (0, ToolsProvider_1.useToolsContext)();
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    // Initialize chat with system message
    React.useEffect(() => {
        if (messages.length === 0) {
            const systemMessage = {
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
        const systemMessage = {
            id: crypto.randomUUID(),
            role: 'system',
            content: 'You are a helpful AI assistant. Provide direct, concise answers without showing your thinking process. Focus on accuracy and clarity.',
            timestamp: Date.now(),
            status: 'sent',
            sender: SYSTEM_USER
        };
        setMessages([systemMessage]);
    }, [clearSelectedTool]);
    const handleSendMessage = async (content) => {
        if (!currentChatId)
            return;
        setIsLoading(true);
        try {
            // Create user message
            const newMessage = {
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
                // Update user message status
                setMessages(prev => prev.map(msg => msg.id === newMessage.id
                    ? { ...msg, status: 'sent' }
                    : msg));
                // Add assistant's response
                const assistantMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.choices[0].message.content,
                    timestamp: Date.now(),
                    status: 'sent',
                    sender: ASSISTANT_USER
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
            catch (error) {
                console.error('Error in chat completion:', error);
                // Update user message status to error
                setMessages(prev => prev.map(msg => msg.id === newMessage.id
                    ? {
                        ...msg,
                        status: 'error',
                        error: {
                            message: 'Failed to send message. Please try again.',
                            retryable: true,
                            code: 'SEND_ERROR'
                        }
                    }
                    : msg));
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRetry = async (messageId) => {
        const messageToRetry = messages.find(msg => msg.id === messageId);
        if (!messageToRetry)
            return;
        // Remove the failed message and any subsequent messages
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        const updatedMessages = messages.slice(0, messageIndex);
        setMessages(updatedMessages);
        // Resend the message
        await handleSendMessage(messageToRetry.content);
    };
    const handleDelete = (messageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };
    const renderContent = () => {
        if (selectedTool?.component === 'ResumeAnalyzer') {
            return (0, jsx_runtime_1.jsx)(ResumeAnalyzer_1.ResumeAnalyzer, {});
        }
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: messages, isLoading: isLoading, onRetry: handleRetry, onDelete: handleDelete }), (0, jsx_runtime_1.jsx)(InputArea_1.InputArea, { onSend: handleSendMessage, isLoading: isLoading })] }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)(TitleBar_1.default, {}), renderContent()] }));
}
const ChatInterface = () => {
    const [currentChatId, setCurrentChatId] = React.useState(Date.now().toString());
    const handleNewChat = React.useCallback(() => {
        setCurrentChatId(Date.now().toString());
    }, []);
    return ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsx)(ToolsProvider_1.ToolsProvider, { children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[250px,1fr] h-screen bg-background", children: [(0, jsx_runtime_1.jsx)(Sidebar_1.Sidebar, { currentChatId: currentChatId, onChatSelect: setCurrentChatId, onNewChat: handleNewChat }), (0, jsx_runtime_1.jsx)(ChatInterfaceContent, { currentChatId: currentChatId })] }) }) }));
};
exports.default = ChatInterface;
