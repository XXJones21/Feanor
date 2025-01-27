const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        titleBarStyle: 'hidden',
        frame: false
    });

    // Check LM Studio connection before loading
    const isConnected = await ErrorHandler.checkLMStudioConnection();
    if (!isConnected) {
        const shouldRetry = await ErrorHandler.showConnectionError(mainWindow);
        if (shouldRetry) {
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
const TOOLS_CONFIG_PATH = path.join(__dirname, '../tools_config.json');
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

// Update these constants at the top of the file
const PROXY_PORT = 4892;  // The port where our proxy server is running
const PROXY_URL = `http://127.0.0.1:${PROXY_PORT}`;

// Update the chat completion endpoint
ipcMain.handle('chat-completion', async (event, { messages, functions }) => {
    try {
        // Remove any duplicate messages
        const uniqueMessages = messages.filter((message, index, self) =>
            index === self.findIndex((m) => m.content === message.content)
        );

        console.log('Sending chat completion request:', { messages: uniqueMessages, functions });
        
        const response = await fetch(`${PROXY_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'local-model',
                messages: uniqueMessages,
                temperature: 0.2,
                stream: false,
                functions,
                function_call: 'auto'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Chat completion response:', data);
        return data;
    } catch (error) {
        console.error('Chat completion error:', error);
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
        // If a signal is provided, listen for abort events
        if (signal) {
            signal.addEventListener('abort', () => {
                controller.abort();
            });
        }

        const response = await fetch(`${PROXY_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            },
            body: JSON.stringify({
                model: 'local-model',
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

        // Return the response directly for streaming
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