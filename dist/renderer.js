"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = require("marked");
const highlight_js_1 = __importDefault(require("highlight.js"));
const electron_1 = require("./types/electron");
// Configure markdown renderer
marked_1.marked.setOptions({
    highlight: (code, lang) => {
        if (lang && highlight_js_1.default.getLanguage(lang)) {
            return highlight_js_1.default.highlight(lang, code).value;
        }
        return highlight_js_1.default.highlightAuto(code).value;
    }
});
// State management
let currentChatId = null;
let currentAttachment = null;
let toolsConfig = null;
// Tool patterns for automatic detection
const TOOL_PATTERNS = {
    'scrape_webpage': {
        patterns: [
            /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/, // URL pattern
            /scrape|fetch|get content|read from url|get links|get page/i // Intent patterns for full scraping
        ]
    },
    'extract_text': {
        patterns: [
            /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/, // URL pattern
            /extract text|get text|show text|read text/i // Intent patterns for text-only
        ]
    },
    'analyze_file': {
        patterns: [
            /analyze file|read file|open file|show me file|what's in file/i,
            /\.(docx|pdf|txt|md|rtf|json|yaml|xml)$/i
        ]
    },
    'read_file': {
        patterns: [
            /read|show|display|content of file/i,
            /\.(docx|pdf|txt|md|rtf|json|yaml|xml)$/i
        ]
    }
};
// Get DOM elements
const elements = {
    messageList: document.getElementById('messageList'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    chatList: document.getElementById('chatList'),
    attachmentPreview: document.getElementById('attachmentPreview'),
    toolsList: document.getElementById('toolsList'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    maximizeBtn: document.getElementById('maximizeBtn'),
    closeBtn: document.getElementById('closeBtn'),
    deleteChatBtn: document.getElementById('deleteChatBtn')
};
// Initialize tools
async function initializeTools() {
    try {
        toolsConfig = await window.electron.invoke(electron_1.IpcChannels.GET_TOOLS);
        if (toolsConfig?.tools) {
            renderToolsList();
            return true;
        }
        console.error('Invalid tools config:', toolsConfig);
        return false;
    }
    catch (error) {
        console.error('Error initializing tools:', error);
        return false;
    }
}
function renderToolsList() {
    if (!toolsConfig?.tools)
        return;
    elements.toolsList.innerHTML = `
        <div class="tools-header">Available Tools</div>
        ${toolsConfig.tools.map(tool => `
            <div class="tool-item" onclick="executeTool('${tool.name}')">
                <div class="tool-name">${tool.name}</div>
                <div class="tool-description">${tool.description}</div>
            </div>
        `).join('')}
    `;
}
// Message handling
async function handleMessage(message) {
    try {
        // First check for URLs and scraping intent
        const urlMatch = message.match(/https?:\/\/[^\s<>"]+/);
        if (urlMatch) {
            const url = urlMatch[0];
            // Add user's message first
            const userMessage = {
                role: 'user',
                content: message,
                id: Date.now().toString(),
                timestamp: Date.now(),
                status: 'complete'
            };
            appendMessage(userMessage);
            // Check if it's a known protected site
            const isProtectedSite = url.includes('workday.com') ||
                url.includes('greenhouse.io') ||
                url.includes('lever.co') ||
                url.includes('recruitingbypaycor.com');
            // Show loading indicator
            elements.loadingIndicator.style.display = 'block';
            try {
                if (!isProtectedSite) {
                    // Try to scrape content first
                    const result = await window.electron.invoke(electron_1.IpcChannels.EXECUTE_TOOL, {
                        tool: 'scrape_webpage',
                        params: { url }
                    });
                    if (result?.text && result.text.trim() !== '') {
                        // If we got content, use it
                        const scrapedContent = {
                            title: result?.title || 'No title found',
                            text: result?.text || 'No content found',
                            links: result?.links && Array.isArray(result.links) ? result.links : []
                        };
                        const messages = [
                            ...getAllMessages() || [],
                            {
                                role: 'system',
                                content: 'You are analyzing content from a webpage. Use the provided content to answer the user\'s query.',
                                id: Date.now().toString(),
                                timestamp: Date.now(),
                                status: 'complete'
                            },
                            {
                                role: 'system',
                                content: JSON.stringify(scrapedContent),
                                id: (Date.now() + 1).toString(),
                                timestamp: Date.now(),
                                status: 'complete'
                            },
                            {
                                role: 'user',
                                content: `Please analyze this webpage and ${message}`,
                                id: (Date.now() + 2).toString(),
                                timestamp: Date.now(),
                                status: 'complete'
                            }
                        ];
                        const aiResponse = await window.electron.invoke(electron_1.IpcChannels.CHAT_COMPLETION, {
                            messages,
                            functions: toolsConfig?.tools || []
                        });
                        const assistantMessage = {
                            role: 'assistant',
                            content: aiResponse.choices[0].message.content,
                            id: Date.now().toString(),
                            timestamp: Date.now(),
                            status: 'complete'
                        };
                        appendMessage(assistantMessage);
                        return;
                    }
                }
                // If content couldn't be accessed or it's a protected site, let AI make educated guesses
                const messages = [
                    ...getAllMessages() || [],
                    {
                        role: 'system',
                        content: `The user has shared a URL (${url}) that cannot be directly accessed. Based on the URL and your knowledge, provide a helpful response. If making assumptions, clearly indicate them.`,
                        id: Date.now().toString(),
                        timestamp: Date.now(),
                        status: 'complete'
                    },
                    {
                        role: 'user',
                        content: message,
                        id: (Date.now() + 1).toString(),
                        timestamp: Date.now(),
                        status: 'complete'
                    }
                ];
                const aiResponse = await window.electron.invoke(electron_1.IpcChannels.CHAT_COMPLETION, {
                    messages,
                    functions: toolsConfig?.tools || []
                });
                const assistantMessage = {
                    role: 'assistant',
                    content: aiResponse.choices[0].message.content,
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    status: 'complete'
                };
                appendMessage(assistantMessage);
            }
            catch (error) {
                console.error('Error handling URL:', error);
                handleError(error);
            }
            finally {
                elements.loadingIndicator.style.display = 'none';
            }
            return;
        }
        // If no URL is found, process as normal message
        const userMessage = {
            role: 'user',
            content: message,
            id: Date.now().toString(),
            timestamp: Date.now(),
            status: 'complete'
        };
        appendMessage(userMessage);
        const result = await window.electron.invoke(electron_1.IpcChannels.CHAT_COMPLETION, {
            messages: [
                ...getAllMessages() || [],
                userMessage
            ],
            functions: toolsConfig?.tools || []
        });
        const assistantMessage = {
            role: 'assistant',
            content: result.choices[0].message.content,
            id: Date.now().toString(),
            timestamp: Date.now(),
            status: 'complete'
        };
        appendMessage(assistantMessage);
    }
    catch (error) {
        console.error('Error handling message:', error);
        handleError(error);
    }
}
// Error handling
function handleError(error) {
    appendMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message.',
        id: Date.now().toString(),
        timestamp: Date.now(),
        status: 'error',
        error: {
            message: error.message || 'Unknown error occurred',
            code: 'PROCESSING_ERROR',
            retryable: true
        }
    });
}
// Message display
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}${message.status === 'error' ? ' error' : ''}`;
    const content = (0, marked_1.marked)(message.content);
    messageElement.innerHTML = content;
    if (message.error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'message-error';
        errorElement.textContent = message.error.message;
        messageElement.appendChild(errorElement);
    }
    elements.messageList.appendChild(messageElement);
    elements.messageList.scrollTop = elements.messageList.scrollHeight;
    // Save chat if we have a chat ID
    if (currentChatId) {
        void window.electron.invoke(electron_1.IpcChannels.SAVE_CHAT, {
            chatId: currentChatId,
            messages: getAllMessages() || []
        });
    }
}
// Message retrieval
function getAllMessages() {
    const messageElements = elements.messageList.getElementsByClassName('message');
    if (!messageElements.length)
        return null;
    return Array.from(messageElements).map((el, index) => {
        const isError = el.classList.contains('error');
        return {
            role: el.classList.contains('user') ? 'user' : 'assistant',
            content: el.textContent || '',
            id: `msg-${index}`,
            timestamp: Date.now(),
            status: isError ? 'error' : 'complete',
            error: isError ? {
                message: 'Error processing message',
                code: 'DISPLAY_ERROR',
                retryable: true
            } : undefined
        };
    });
}
// Tool execution
async function executeTool(toolName, params = {}) {
    try {
        elements.loadingIndicator.style.display = 'block';
        return await window.electron.invoke(electron_1.IpcChannels.EXECUTE_TOOL, { tool: toolName, params });
    }
    catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        throw error;
    }
    finally {
        elements.loadingIndicator.style.display = 'none';
    }
}
// Chat management
async function createNewChat() {
    currentChatId = Date.now().toString();
    elements.messageList.innerHTML = '';
    elements.deleteChatBtn.style.display = 'none';
    await updateChatList();
}
async function updateChatList() {
    const chats = await window.electron.invoke(electron_1.IpcChannels.GET_CHAT_HISTORY);
    elements.chatList.innerHTML = '';
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (chat.id === currentChatId)
            chatItem.classList.add('active');
        chatItem.textContent = `Chat ${new Date(parseInt(chat.id)).toLocaleTimeString()}`;
        chatItem.onclick = () => void loadChat(chat.id);
        elements.chatList.appendChild(chatItem);
    });
}
async function loadChat(chatId) {
    try {
        const messages = await window.electron.invoke(electron_1.IpcChannels.LOAD_CHAT, chatId);
        currentChatId = chatId;
        elements.messageList.innerHTML = '';
        messages.forEach(message => appendMessage(message));
        // Update active state in chat list and show delete button
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.onclick?.toString().includes(chatId));
        });
        elements.deleteChatBtn.style.display = 'block';
    }
    catch (error) {
        console.error('Error loading chat:', error);
        handleError(error);
    }
}
async function deleteCurrentChat() {
    if (!currentChatId)
        return;
    try {
        const confirmDelete = await window.electron.invoke(electron_1.IpcChannels.SHOW_CONFIRM_DIALOG, {
            title: 'Delete Chat',
            message: 'Are you sure you want to delete this chat?',
            detail: 'This action cannot be undone.',
            buttons: ['Yes', 'No'],
            defaultId: 1,
            type: 'question'
        });
        if (confirmDelete.response !== 0)
            return;
        await window.electron.invoke(electron_1.IpcChannels.DELETE_CHAT, currentChatId);
        // Remove from UI
        const chatItem = Array.from(document.querySelectorAll('.chat-item'))
            .find(item => item.onclick?.toString().includes(currentChatId || ''));
        chatItem?.remove();
        // Clear current chat
        elements.messageList.innerHTML = '';
        currentChatId = null;
        elements.deleteChatBtn.style.display = 'none';
        // Create new chat if no chats left
        const remainingChats = await window.electron.invoke(electron_1.IpcChannels.GET_CHAT_HISTORY);
        if (remainingChats.length === 0) {
            await createNewChat();
        }
        else {
            await loadChat(remainingChats[0].id);
        }
    }
    catch (error) {
        console.error('Error deleting chat:', error);
        handleError(error);
    }
}
// Initialization
async function initialize() {
    try {
        // Initialize tools first
        const toolsInitialized = await initializeTools();
        if (!toolsInitialized) {
            console.warn('Tools failed to initialize. Some features may be unavailable.');
        }
        // Load existing chats
        await updateChatList();
        // Set current chat ID without creating a message
        if (!currentChatId) {
            currentChatId = Date.now().toString();
            await updateChatList();
        }
        // Set up event listeners
        elements.sendBtn.onclick = () => {
            const message = elements.messageInput.value.trim();
            if (message) {
                void handleMessage(message);
                elements.messageInput.value = '';
            }
        };
        elements.messageInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                elements.sendBtn.click();
            }
        };
        elements.newChatBtn.onclick = () => void createNewChat();
        elements.deleteChatBtn.onclick = () => void deleteCurrentChat();
        elements.minimizeBtn.onclick = () => window.electron.invoke(electron_1.IpcChannels.WINDOW_MINIMIZE);
        elements.maximizeBtn.onclick = () => window.electron.invoke(electron_1.IpcChannels.WINDOW_MAXIMIZE);
        elements.closeBtn.onclick = () => window.electron.invoke(electron_1.IpcChannels.WINDOW_CLOSE);
    }
    catch (error) {
        console.error('Initialization error:', error);
        handleError(error);
    }
}
// Start initialization
void initialize();
