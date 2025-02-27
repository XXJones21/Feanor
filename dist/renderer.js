"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = require("marked");
const highlight_js_1 = __importDefault(require("highlight.js"));
// We'll define IPC channels directly to avoid import issues
const IpcChannels = {
    CHAT_COMPLETION: 'chat-completion',
    EXECUTE_TOOL: 'execute-tool',
    GET_TOOLS: 'get-tools-config',
    GET_CHAT_HISTORY: 'get-chat-history',
    LOAD_CHAT: 'load-chat',
    SAVE_CHAT: 'save-chat',
    DELETE_CHAT: 'delete-chat',
    WINDOW_MINIMIZE: 'window-minimize',
    WINDOW_MAXIMIZE: 'window-maximize',
    WINDOW_CLOSE: 'window-close',
    SHOW_CONFIRM_DIALOG: 'show-confirm-dialog'
};
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
// Declare elements variable but don't populate yet
let elements;
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
// Initialize tools
async function initializeTools() {
    try {
        toolsConfig = await window.electron.invoke(IpcChannels.GET_TOOLS);
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
                status: 'sent',
                sender: {
                    id: 'user',
                    name: 'You'
                }
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
                    const result = await window.electron.invoke(IpcChannels.EXECUTE_TOOL, {
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
                                status: 'sent',
                                sender: {
                                    id: 'system',
                                    name: 'System'
                                }
                            },
                            {
                                role: 'system',
                                content: JSON.stringify(scrapedContent),
                                id: (Date.now() + 1).toString(),
                                timestamp: Date.now(),
                                status: 'sent',
                                sender: {
                                    id: 'system',
                                    name: 'System'
                                }
                            },
                            {
                                role: 'user',
                                content: `Please analyze this webpage and ${message}`,
                                id: (Date.now() + 2).toString(),
                                timestamp: Date.now(),
                                status: 'sent',
                                sender: {
                                    id: 'user',
                                    name: 'You'
                                }
                            }
                        ];
                        const aiResponse = await window.electron.invoke(IpcChannels.CHAT_COMPLETION, {
                            messages,
                            functions: toolsConfig?.tools || []
                        });
                        const assistantMessage = {
                            role: 'assistant',
                            content: aiResponse.choices[0].message.content,
                            id: Date.now().toString(),
                            timestamp: Date.now(),
                            status: 'sent',
                            sender: {
                                id: 'assistant',
                                name: 'Assistant'
                            }
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
                        status: 'sent',
                        sender: {
                            id: 'system',
                            name: 'System'
                        }
                    },
                    {
                        role: 'user',
                        content: message,
                        id: (Date.now() + 1).toString(),
                        timestamp: Date.now(),
                        status: 'sent',
                        sender: {
                            id: 'user',
                            name: 'You'
                        }
                    }
                ];
                const aiResponse = await window.electron.invoke(IpcChannels.CHAT_COMPLETION, {
                    messages,
                    functions: toolsConfig?.tools || []
                });
                const assistantMessage = {
                    role: 'assistant',
                    content: aiResponse.choices[0].message.content,
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    status: 'sent',
                    sender: {
                        id: 'assistant',
                        name: 'Assistant'
                    }
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
            status: 'sent',
            sender: {
                id: 'user',
                name: 'You'
            }
        };
        appendMessage(userMessage);
        const result = await window.electron.invoke(IpcChannels.CHAT_COMPLETION, {
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
            status: 'sent',
            sender: {
                id: 'assistant',
                name: 'Assistant'
            }
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
        },
        sender: {
            id: 'assistant',
            name: 'Assistant'
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
        void window.electron.invoke(IpcChannels.SAVE_CHAT, {
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
            status: isError ? 'error' : 'sent',
            error: isError ? {
                message: 'Error processing message',
                code: 'DISPLAY_ERROR',
                retryable: true
            } : undefined,
            sender: {
                id: el.classList.contains('user') ? 'user' : 'assistant',
                name: el.classList.contains('user') ? 'You' : 'Assistant'
            }
        };
    });
}
// Tool execution
async function executeTool(toolName, params = {}) {
    try {
        elements.loadingIndicator.style.display = 'block';
        return await window.electron.invoke(IpcChannels.EXECUTE_TOOL, { tool: toolName, params });
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
    const chats = await window.electron.invoke(IpcChannels.GET_CHAT_HISTORY);
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
        const messages = await window.electron.invoke(IpcChannels.LOAD_CHAT, chatId);
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
        const confirmDelete = await window.electron.invoke(IpcChannels.SHOW_CONFIRM_DIALOG, {
            title: 'Delete Chat',
            message: 'Are you sure you want to delete this chat?',
            detail: 'This action cannot be undone.',
            buttons: ['Yes', 'No'],
            defaultId: 1,
            type: 'question'
        });
        if (confirmDelete.response !== 0)
            return;
        await window.electron.invoke(IpcChannels.DELETE_CHAT, currentChatId);
        // Remove from UI
        const chatItem = Array.from(document.querySelectorAll('.chat-item'))
            .find(item => item.onclick?.toString().includes(currentChatId || ''));
        chatItem?.remove();
        // Clear current chat
        elements.messageList.innerHTML = '';
        currentChatId = null;
        elements.deleteChatBtn.style.display = 'none';
        // Create new chat if no chats left
        const remainingChats = await window.electron.invoke(IpcChannels.GET_CHAT_HISTORY);
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
// Add a safety check function to ensure electron is available
function checkElectronAvailability() {
    if (!window.electron) {
        console.error('window.electron is not available!');
        alert('Electron API not available. This application requires Electron to run properly.');
        return false;
    }
    // Check if invoke method exists
    if (typeof window.electron.invoke !== 'function') {
        console.error('window.electron.invoke is not a function!');
        alert('Electron IPC methods not available. Communication with the main process is not possible.');
        return false;
    }
    console.log('Electron API is available', window.electron);
    return true;
}
// Initialization
async function initialize() {
    try {
        console.log('Initializing application...');
        // Check Electron availability first
        if (!checkElectronAvailability()) {
            throw new Error('Electron API not available');
        }
        // Get DOM elements after DOM is fully loaded
        elements = {
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
        // Debug log each DOM element
        Object.entries(elements).forEach(([key, element]) => {
            console.log(`DOM Element '${key}': ${element ? 'Found' : 'NOT FOUND'}`);
            if (!element) {
                console.error(`DOM Element '${key}' not found. This could cause errors.`);
            }
        });
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
        // Using both onclick and addEventListener for redundancy
        console.log('Setting up event listeners...');
        if (elements.sendBtn) {
            console.log('Attaching click handler to Send button');
            elements.sendBtn.onclick = async () => {
                console.log('Send button clicked');
                const message = elements.messageInput.value.trim();
                if (message) {
                    try {
                        await handleMessage(message);
                        elements.messageInput.value = '';
                    }
                    catch (error) {
                        console.error('Error handling message:', error);
                        handleError(error);
                    }
                }
            };
            // Add a second event listener for redundancy
            elements.sendBtn.addEventListener('click', async () => {
                console.log('Send button clicked (addEventListener)');
                const message = elements.messageInput.value.trim();
                if (message) {
                    try {
                        await handleMessage(message);
                        elements.messageInput.value = '';
                    }
                    catch (error) {
                        console.error('Error handling message (addEventListener):', error);
                        handleError(error);
                    }
                }
            });
        }
        if (elements.messageInput) {
            elements.messageInput.onkeypress = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    console.log('Enter key pressed, clicking send button');
                    elements.sendBtn.click();
                }
            };
        }
        if (elements.newChatBtn) {
            console.log('Attaching click handler to New Chat button');
            elements.newChatBtn.onclick = async () => {
                console.log('New chat button clicked');
                try {
                    await createNewChat();
                }
                catch (error) {
                    console.error('Error creating new chat:', error);
                    handleError(error);
                }
            };
            // Add a second event listener for redundancy
            elements.newChatBtn.addEventListener('click', async () => {
                console.log('New chat button clicked (addEventListener)');
                try {
                    await createNewChat();
                }
                catch (error) {
                    console.error('Error creating new chat (addEventListener):', error);
                    handleError(error);
                }
            });
        }
        if (elements.deleteChatBtn) {
            elements.deleteChatBtn.onclick = async () => {
                console.log('Delete chat button clicked');
                try {
                    await deleteCurrentChat();
                }
                catch (error) {
                    console.error('Error deleting chat:', error);
                    handleError(error);
                }
            };
        }
        if (elements.minimizeBtn) {
            elements.minimizeBtn.onclick = () => window.electron.invoke(IpcChannels.WINDOW_MINIMIZE);
        }
        if (elements.maximizeBtn) {
            elements.maximizeBtn.onclick = () => window.electron.invoke(IpcChannels.WINDOW_MAXIMIZE);
        }
        if (elements.closeBtn) {
            elements.closeBtn.onclick = () => window.electron.invoke(IpcChannels.WINDOW_CLOSE);
        }
        console.log('Initialization complete!');
    }
    catch (error) {
        console.error('Initialization error:', error);
        handleError(error);
    }
}
// Wait for DOMContentLoaded, then initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, starting application initialization...');
    // Add custom event listeners as a third fallback mechanism
    document.addEventListener('app:send_message', async () => {
        console.log('Custom send message event received');
        if (elements?.messageInput && elements?.sendBtn) {
            const message = elements.messageInput.value.trim();
            if (message) {
                try {
                    await handleMessage(message);
                    elements.messageInput.value = '';
                }
                catch (error) {
                    console.error('Error handling message (custom event):', error);
                    handleError(error);
                }
            }
        }
        else {
            console.error('Elements not initialized when custom event fired');
        }
    });
    document.addEventListener('app:new_chat', async () => {
        console.log('Custom new chat event received');
        try {
            await createNewChat();
        }
        catch (error) {
            console.error('Error creating new chat (custom event):', error);
            handleError(error);
        }
    });
    document.addEventListener('app:delete_chat', async () => {
        console.log('Custom delete chat event received');
        try {
            await deleteCurrentChat();
        }
        catch (error) {
            console.error('Error deleting chat (custom event):', error);
            handleError(error);
        }
    });
    initialize().catch(error => {
        console.error('Error during initialization:', error);
        alert('Application initialization failed. Please refresh or restart the application.');
    });
});
// Make certain functions available on window for debugging
window.debugApp = {
    checkElectronAvailability,
    createNewChat,
    sendMessage: async () => {
        const message = elements?.messageInput?.value.trim();
        if (message) {
            try {
                await handleMessage(message);
                if (elements?.messageInput) {
                    elements.messageInput.value = '';
                }
            }
            catch (error) {
                console.error('Debug send error:', error);
            }
        }
    }
};
