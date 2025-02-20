const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { ErrorHandler } = require('./error-handler');

let mainWindow;

// Process message
async function processMessage(message) {
    try {
        return {
            type: 'message',
            content: message
        };
    } catch (error) {
        console.error('Error processing message:', error);
        throw error;
    }
}

// Add message handling IPC
ipcMain.handle('process-message', async (event, message) => {
    return processMessage(message);
});

// Update these constants at the top of the file
const PROXY_PORT = 4892;
const PROXY_URL = `http://127.0.0.1:${PROXY_PORT}`;
const LM_STUDIO_PORT = 4891;
const LM_STUDIO_URL = `http://127.0.0.1:${LM_STUDIO_PORT}`;
const DEFAULT_MODEL = 'qwen2.5-7b-instruct';  // Using one of the available models

// Add cache for model information
let modelCache = {
    activeModel: null,
    availableModels: null,
    lastCheck: 0
};

// Add protocol registration
function registerProxyProtocol() {
    protocol.handle('proxy', async (request) => {
        try {
            const targetUrl = request.url.replace('proxy://', '');
            const proxyUrl = `${PROXY_URL}/${targetUrl}`;
            
            console.log('Proxying request:', {
                originalUrl: request.url,
                targetUrl: proxyUrl,
                method: request.method,
                headers: request.headers
            });

            // Only allow POST requests to chat completions endpoint
            if (targetUrl.includes('chat/completions') && request.method !== 'POST') {
                console.warn('Rejected non-POST request to chat completions endpoint');
                return new Response(JSON.stringify({ 
                    error: 'Only POST method is allowed for chat completions' 
                }), {
                    status: 405,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': 'app://',
                        'Access-Control-Allow-Methods': 'POST',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                });
            }

            const response = await fetch(proxyUrl, {
                method: request.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'app://',
                    'Access-Control-Request-Method': request.method,
                    'Access-Control-Request-Headers': 'Content-Type'
                },
                credentials: 'include',
                body: request.method !== 'GET' ? request.body : undefined
            });

            // Add CORS headers to response
            const headers = new Headers(response.headers);
            headers.set('Access-Control-Allow-Origin', 'app://');
            headers.set('Access-Control-Allow-Methods', 'POST');
            headers.set('Access-Control-Allow-Headers', 'Content-Type');

            return new Response(response.body, {
                status: response.status,
                headers
            });
        } catch (error) {
            console.error('Proxy protocol error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'app://',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }
    });
}

// Add function to get the active model from LM Studio
async function getActiveModel(forceRefresh = false) {
    const CACHE_DURATION = 30000; // 30 seconds
    const now = Date.now();

    // Use cached model if available and cache isn't expired
    if (!forceRefresh && 
        modelCache.activeModel && 
        modelCache.lastCheck && 
        (now - modelCache.lastCheck) < CACHE_DURATION) {
        return modelCache.activeModel;
    }

    try {
        // First get all available models if not cached
        if (!modelCache.availableModels || forceRefresh) {
            const modelsResponse = await fetch(`${LM_STUDIO_URL}/v1/models`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!modelsResponse.ok) {
                throw new Error(`Failed to get models: ${modelsResponse.statusText}`);
            }

            const modelsData = await modelsResponse.json();
            modelCache.availableModels = modelsData.data.map(m => m.id);
            console.log('Available models:', modelCache.availableModels);
        }

        // Make a test request to see which model responds
        const testResponse = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'system', content: 'model_check' }],
                model: modelCache.availableModels[0],
                max_tokens: 1
            })
        });

        if (!testResponse.ok) {
            throw new Error(`Test request failed: ${testResponse.statusText}`);
        }

        const testData = await testResponse.json();
        if (testData.model) {
            console.log('Active model detected:', testData.model);
            modelCache.activeModel = testData.model;
            modelCache.lastCheck = now;
            return modelCache.activeModel;
        }

        // If no model info in response, use first available
        console.log('Using first available model:', modelCache.availableModels[0]);
        modelCache.activeModel = modelCache.availableModels[0];
        modelCache.lastCheck = now;
        return modelCache.activeModel;
    } catch (error) {
        console.error('Error getting active model:', {
            message: error.message,
            stack: error.stack
        });
        // Clear cache on error
        modelCache = {
            activeModel: null,
            availableModels: null,
            lastCheck: 0
        };
        throw error;
    }
}

// Add a function to check both proxy and LM Studio
async function checkConnections() {
    console.log('Checking connections...');
    
    try {
        // Get the active model (this will also check LM Studio connection)
        const activeModel = await getActiveModel(true); // Force refresh on startup
        console.log(`Active model: ${activeModel}`);

        // Check proxy server with active model using proxy protocol
        console.log('Checking proxy server connection...');
        const proxyResponse = await fetch('proxy://v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'system', content: 'connection_test' }],
                model: activeModel,
                max_tokens: 1
            })
        });
        console.log('Proxy server response:', {
            status: proxyResponse.status,
            statusText: proxyResponse.statusText
        });

        return proxyResponse.ok;
    } catch (error) {
        console.error('Connection check error:', {
            message: error.message,
            stack: error.stack
        });
        return false;
    }
}

async function createWindow() {
    // Register custom protocol before creating window
    registerProxyProtocol();
    
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hidden',
        frame: false
    });

    // Check both proxy and LM Studio connections before loading
    const isConnected = await checkConnections();
    if (!isConnected) {
        const shouldRetry = await dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Connection Error',
            message: 'Could not connect to LM Studio or the proxy server.',
            detail: `Please ensure:\n1. LM Studio is running on port ${LM_STUDIO_PORT}\n2. The proxy server is running on port ${PROXY_PORT}\n3. No firewall is blocking the connections`,
            buttons: ['Retry', 'Exit'],
            defaultId: 0
        });
        
        if (shouldRetry.response === 0) {
            return createWindow();
        }
        app.quit();
        return;
    }

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Window control handlers
    ipcMain.on('minimize-window', () => mainWindow.minimize());
    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.on('close-window', () => app.quit());
}

// Load tools configuration
const TOOLS_CONFIG_PATH = path.join(__dirname, '../Tools/tools_config.json');
let toolsConfig = {};

try {
    toolsConfig = JSON.parse(fs.readFileSync(TOOLS_CONFIG_PATH, 'utf8'));
} catch (error) {
    console.error('Error loading tools config:', error);
}

// Chat history management
const CHATS_DIR = path.join(app.getPath('userData'), 'chats');
if (!fs.existsSync(CHATS_DIR)) {
    fs.mkdirSync(CHATS_DIR, { recursive: true });
}

// IPC Handlers
ipcMain.handle('get-tools-config', () => toolsConfig);

// Update the chat completion endpoint to use node-fetch directly
ipcMain.handle('chat-completion', async (event, { messages, functions }) => {
    console.log('Main process received chat-completion request:', { messages, functions });
    try {
        // Get the active model
        const activeModel = await getActiveModel();

        // Remove any duplicate messages
        const uniqueMessages = messages.filter((message, index, self) =>
            index === self.findIndex((m) => m.content === message.content)
        );

        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: activeModel,
                messages: uniqueMessages,
                temperature: 0.2,
                stream: false,
                functions,
                function_call: 'auto'
            })
        };

        console.log('Sending request through proxy protocol:', {
            url: 'proxy://v1/chat/completions',
            options: {
                ...requestOptions,
                body: JSON.parse(requestOptions.body)
            }
        });

        // Use our custom proxy protocol
        const response = await fetch('proxy://v1/chat/completions', requestOptions);
        
        if (!response.ok) {
            console.error('Proxy server error:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Chat completion error:', {
            message: error.message,
            stack: error.stack
        });
        const action = await ErrorHandler.handleAPIError(error, mainWindow);
        if (action === 'retry') {
            return ipcMain.handle('chat-completion', event, { messages, functions });
        }
        if (action === 'exit') {
            app.quit();
        }
        throw error;
    }
});

// Add streaming chat completion endpoint
ipcMain.handle('chat-completion-stream', async (event, { messages, functions, signal }) => {
    try {
        // Remove any duplicate messages
        const uniqueMessages = messages.filter((message, index, self) =>
            index === self.findIndex((m) => m.content === message.content)
        );

        console.log('Sending streaming chat completion request:', { messages: uniqueMessages, functions });
        
        const controller = new AbortController();
        if (signal) {
            signal.addEventListener('abort', () => {
                controller.abort();
            });
        }

        // Use proxy protocol for streaming requests
        const response = await fetch('proxy://v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            },
            body: JSON.stringify({
                model: await getActiveModel(),
                messages: uniqueMessages,
                temperature: 0.2,
                stream: true,
                functions,
                function_call: 'auto'
            }),
            signal: controller.signal
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return {
            body: response.body,
            headers: response.headers,
            status: response.status
        };
    } catch (error) {
        console.error('Streaming chat completion error:', error);
        if (error.name === 'AbortError') {
            throw error;
        }
        const action = await ErrorHandler.handleAPIError(error, mainWindow);
        if (action === 'retry') {
            return ipcMain.handle('chat-completion-stream', event, { messages, functions, signal });
        }
        if (action === 'exit') {
            app.quit();
        }
        throw error;
    }
});

// Update the tool execution endpoint
ipcMain.handle('execute-tool', async (event, { tool, params }) => {
    try {
        console.log(`Executing tool ${tool} with params:`, params);
        const response = await fetch(`${PROXY_URL}/v1/functions/${tool}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Tool execution result:', result);
        return result;
    } catch (error) {
        console.error('Tool execution error:', error);
        return ErrorHandler.showToolError(error, tool);
    }
});

// Update the file analysis endpoint
ipcMain.handle('analyze-file', async (event, filePath) => {
    try {
        const response = await fetch(`${PROXY_URL}/v1/functions/analyze_file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_path: filePath })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('File analysis error:', error);
        throw error;
    }
});

// Chat history operations
ipcMain.handle('save-chat', async (event, { chatId, messages }) => {
    const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
    await fs.promises.writeFile(chatFile, JSON.stringify(messages, null, 2));
});

ipcMain.handle('delete-chat', async (event, chatId) => {
    const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
    try {
        await fs.promises.unlink(chatFile);
        return true;
    } catch (error) {
        console.error('Error deleting chat:', error);
        return false;
    }
});

ipcMain.handle('show-confirm-dialog', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        title: options.title || 'Confirm',
        message: options.message || 'Are you sure?',
        detail: options.detail || '',
    });
    return result.response === 0;
});

ipcMain.handle('load-chats', async () => {
    try {
        const files = await fs.promises.readdir(CHATS_DIR);
        const chats = [];
        for (const file of files) {
            const chatId = path.parse(file).name;
            const content = await fs.promises.readFile(
                path.join(CHATS_DIR, file), 
                'utf8'
            );
            const messages = JSON.parse(content);
            chats.push({
                id: chatId,
                messages,
                lastMessage: messages[messages.length - 1]?.content || ''
            });
        }
        return chats;
    } catch (error) {
        console.error('Error loading chats:', error);
        return [];
    }
});

ipcMain.handle('load-chat', async (event, chatId) => {
    try {
        const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
        const content = await fs.promises.readFile(chatFile, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error loading chat:', error);
        return [];
    }
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 