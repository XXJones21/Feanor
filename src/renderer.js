const { ipcRenderer } = require('electron');
const marked = require('marked');
const hljs = require('highlight.js');
const StatusManager = require('./status-manager');
const ParameterDialog = require('./components/ParameterDialog');

// Configure markdown renderer
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

// State management
let currentChatId = null;
let currentAttachment = null;
let toolsConfig = null;
let statusManager = null;

// DOM Elements
const messageList = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const attachmentPreview = document.getElementById('attachmentPreview');
const toolsList = document.getElementById('toolsList');
const loadingIndicator = document.getElementById('loadingIndicator');
const minimizeBtn = document.getElementById('minimizeBtn');
const maximizeBtn = document.getElementById('maximizeBtn');
const closeBtn = document.getElementById('closeBtn');
const deleteChatBtn = document.getElementById('deleteChatBtn');

// Tool patterns for automatic detection
const TOOL_PATTERNS = {
    'scrape_webpage': {
        patterns: [
            /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/,  // URL pattern
            /scrape|fetch|get content|read from url|get links|get page/i  // Intent patterns for full scraping
        ]
    },
    'extract_text': {
        patterns: [
            /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/,  // URL pattern
            /extract text|get text|show text|read text/i  // Intent patterns for text-only
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
        toolsConfig = await ipcRenderer.invoke('get-tools-config');
        if (toolsConfig && toolsConfig.tools) {
            renderToolsList();
            return true;
        }
        console.error('Invalid tools config:', toolsConfig);
        return false;
    } catch (error) {
        console.error('Error initializing tools:', error);
        return false;
    }
}

function renderToolsList() {
    toolsList.innerHTML = `
        <div class="tools-header">Available Tools</div>
        ${toolsConfig.tools.map(tool => `
            <div class="tool-item" onclick="executeTool('${tool.function.name}')">
                <div class="tool-name">${tool.function.name}</div>
                <div class="tool-description">${tool.function.description}</div>
            </div>
        `).join('')}
    `;
}

// Add message processing
async function handleMessage(message) {
    try {
        // First check for URLs and scraping intent
        const urlMatch = message.match(/https?:\/\/[^\s<>"]+/);
        if (urlMatch) {
            const url = urlMatch[0];
            
            // Add user's message first
            appendMessage({
                role: 'user',
                content: message
            });

            // Check if it's a known protected site
            const isProtectedSite = url.includes('workday.com') || 
                                  url.includes('greenhouse.io') || 
                                  url.includes('lever.co') ||
                                  url.includes('recruitingbypaycor.com');
            
            // Show loading indicator
            loadingIndicator.style.display = 'block';
            
            try {
                if (!isProtectedSite) {
                    // Try to scrape content first
                    const result = await executeTool('scrape_webpage', { url });
                    
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
                                content: 'You are analyzing content from a webpage. Use the provided content to answer the user\'s query.'
                            },
                            {
                                role: 'system',
                                content: JSON.stringify(scrapedContent)
                            },
                            {
                                role: 'user',
                                content: `Please analyze this webpage and ${message}`
                            }
                        ];

                        const aiResponse = await ipcRenderer.invoke('chat-completion', {
                            messages,
                            functions: toolsConfig.tools
                        });

                        appendMessage({
                            role: 'assistant',
                            content: aiResponse.choices[0].message.content
                        });
                        return;
                    }
                }

                // If content couldn't be accessed or it's a protected site, let AI make educated guesses
                const messages = [
                    ...getAllMessages() || [],
                    {
                        role: 'system',
                        content: `The user has shared a URL (${url}) that cannot be directly accessed. Based on the URL and your knowledge, provide a helpful response. If making assumptions, clearly indicate them.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ];

                const aiResponse = await ipcRenderer.invoke('chat-completion', {
                    messages,
                    functions: toolsConfig.tools
                });

                appendMessage({
                    role: 'assistant',
                    content: aiResponse.choices[0].message.content
                });

                // Add a follow-up message about content access
                appendMessage({
                    role: 'assistant',
                    content: `Note: I couldn't directly access the content of this webpage. My response is based on the URL and general knowledge. To provide more specific insights, you could:

1. Copy and paste the relevant content directly into our chat
2. Share a screenshot of the page
3. Let me know if you'd like me to focus on particular aspects`,
                    error: true
                });

            } catch (error) {
                console.error('Error handling URL:', error);
                // Let AI respond even on error
                const messages = [
                    ...getAllMessages() || [],
                    {
                        role: 'system',
                        content: `The user has shared a URL (${url}) that cannot be directly accessed. Based on the URL and your knowledge, provide a helpful response. If making assumptions, clearly indicate them.`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ];

                const aiResponse = await ipcRenderer.invoke('chat-completion', {
                    messages,
                    functions: toolsConfig.tools
                });

                appendMessage({
                    role: 'assistant',
                    content: aiResponse.choices[0].message.content
                });
            } finally {
                loadingIndicator.style.display = 'none';
            }
            return;
        }

        // If no URL is found, process as normal message
        appendMessage({
            role: 'user',
            content: message
        });

        const result = await ipcRenderer.invoke('chat-completion', {
            messages: [
                ...getAllMessages() || [],
                { role: 'user', content: message }
            ],
            functions: toolsConfig.tools
        });

        appendMessage({
            role: 'assistant',
            content: result.choices[0].message.content
        });

    } catch (error) {
        console.error('Error handling message:', error);
        appendMessage({
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your message.',
            error: true
        });
    }
}

// Update sendMessage function
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    appendMessage({
        role: 'user',
        content: message
    });

    messageInput.value = '';
    messageInput.style.height = 'auto';

    await handleMessage(message);
}

function appendMessage(message) {
    if (message.role === 'thought') {
        const thoughtsSection = document.createElement('div');
        thoughtsSection.className = 'thoughts-section';
        
        const header = document.createElement('div');
        header.className = 'thoughts-header collapsed';
        
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toggle-icon';
        toggleIcon.textContent = '▶';
        
        const label = document.createElement('span');
        label.className = 'thoughts-label';
        label.textContent = 'Thoughts';
        
        const time = document.createElement('span');
        time.className = 'thoughts-time';
        time.textContent = `Thought for ${message.time || '7.67'} seconds`;
        
        header.appendChild(toggleIcon);
        header.appendChild(label);
        header.appendChild(time);
        
        const content = document.createElement('div');
        content.className = 'thoughts-content collapsed';
        content.textContent = message.content;
        
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
            toggleIcon.textContent = header.classList.contains('collapsed') ? '▶' : '▼';
        });
        
        thoughtsSection.appendChild(header);
        thoughtsSection.appendChild(content);
        messageList.appendChild(thoughtsSection);
    } else {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;
        messageElement.innerHTML = marked.parse(message.content);
        messageList.appendChild(messageElement);
    }
    
    messageList.scrollTop = messageList.scrollHeight;
}

// File handling
messageInput.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
        setAttachment(file);
    }
});

messageInput.addEventListener('dragover', (e) => {
    e.preventDefault();
});

function setAttachment(file) {
    currentAttachment = file;
    attachmentPreview.innerHTML = `
        <div class="attachment">
            <span>📎 ${file.name}</span>
            <button onclick="clearAttachment()">×</button>
        </div>
    `;
    attachmentPreview.style.display = 'block';
}

function clearAttachment() {
    currentAttachment = null;
    attachmentPreview.innerHTML = '';
    attachmentPreview.style.display = 'none';
}

// Tool detection
function detectTool(message) {
    for (const [toolName, patterns] of Object.entries(TOOL_PATTERNS)) {
        const tool = toolsConfig.tools.find(t => t.function.name === toolName);
        if (!tool) continue;

        const matches = patterns.patterns.some(pattern => 
            pattern.test(message.toLowerCase())
        );

        if (matches) return tool;
    }
    return null;
}

// Tool execution
async function executeTool(toolName, params) {
    const result = await ipcRenderer.invoke('execute-tool', {
        tool: toolName,
        params
    });
    return result;
}

// Initialize
async function initialize() {
    try {
        // Initialize status manager
        statusManager = new StatusManager();
        
        // Start monitoring connection status
        statusManager.startMonitoring();
        
        // Initialize tools first
        const toolsInitialized = await initializeTools();
        if (!toolsInitialized) {
            console.warn('Tools failed to initialize. Some features may be unavailable.');
        }

        // Load existing chats
        await loadChats();

        // Set current chat ID without creating a message
        if (!currentChatId) {
            currentChatId = Date.now().toString();
            updateChatList();
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', initialize);
newChatBtn.addEventListener('click', createNewChat);
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
deleteChatBtn.addEventListener('click', deleteCurrentChat);

// Add cleanup on window unload
window.addEventListener('beforeunload', () => {
    statusManager.stopMonitoring();
});

// Chat management
function createNewChat() {
    currentChatId = Date.now().toString();
    messageList.innerHTML = '';
    updateChatList();
    deleteChatBtn.style.display = 'none';
}

function updateChatList() {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item' + (currentChatId ? ' active' : '');
    chatItem.textContent = `Chat ${new Date().toLocaleTimeString()}`;
    chatItem.onclick = () => loadChat(currentChatId);
    chatList.insertBefore(chatItem, chatList.firstChild);
}

async function loadChats() {
    try {
        const chats = await ipcRenderer.invoke('load-chats');
        chatList.innerHTML = '';
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.textContent = `Chat ${new Date(parseInt(chat.id)).toLocaleTimeString()}`;
            chatItem.onclick = () => loadChat(chat.id);
            chatList.appendChild(chatItem);
        });
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

async function loadChat(chatId) {
    try {
        const messages = await ipcRenderer.invoke('load-chat', chatId);
        currentChatId = chatId;
        messageList.innerHTML = '';
        messages.forEach(message => appendMessage(message));
        
        // Update active state in chat list and show delete button
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.onclick.toString().includes(chatId));
        });
        deleteChatBtn.style.display = 'block';
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

async function deleteCurrentChat() {
    if (!currentChatId) return;

    try {
        // Show confirmation dialog
        const confirmDelete = await ipcRenderer.invoke('show-confirm-dialog', {
            title: 'Delete Chat',
            message: 'Are you sure you want to delete this chat?',
            detail: 'This action cannot be undone.'
        });

        if (!confirmDelete) return;

        // Delete the chat
        await ipcRenderer.invoke('delete-chat', currentChatId);
        
        // Remove from UI
        const chatItem = Array.from(document.querySelectorAll('.chat-item'))
            .find(item => item.onclick.toString().includes(currentChatId));
        if (chatItem) {
            chatItem.remove();
        }

        // Clear current chat
        messageList.innerHTML = '';
        currentChatId = null;
        deleteChatBtn.style.display = 'none';

        // Create new chat if no chats left
        const remainingChats = await ipcRenderer.invoke('load-chats');
        if (remainingChats.length === 0) {
            createNewChat();
        } else {
            // Load the most recent chat
            loadChat(remainingChats[0].id);
        }
    } catch (error) {
        console.error('Error deleting chat:', error);
    }
}

function getAllMessages() {
    const messages = [];
    const messageElements = document.querySelectorAll('.message');
    
    // Don't return empty messages array to prevent unnecessary API calls
    if (messageElements.length === 0) {
        return null;
    }
    
    messageElements.forEach(el => {
        const role = Array.from(el.classList).find(c => c !== 'message');
        messages.push({
            role,
            content: el.textContent
        });
    });
    return messages;
}

// Window controls
minimizeBtn.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

maximizeBtn.addEventListener('click', () => {
    ipcRenderer.send('maximize-window');
});

closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});