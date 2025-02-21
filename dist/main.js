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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const node_fetch_1 = __importStar(require("node-fetch"));
const child_process_1 = require("child_process");
const error_handler_1 = require("./error-handler");
let mainWindow = null;
let proxyProcess = null;
// Constants
const PROXY_PORT = 4892;
const PROXY_URL = `http://127.0.0.1:${PROXY_PORT}`;
const LM_STUDIO_PORT = 4891;
const LM_STUDIO_URL = `http://127.0.0.1:${LM_STUDIO_PORT}`;
// Add cache for model information
let modelCache = {
    activeModel: null,
    availableModels: null,
    lastCheck: 0
};
// Start proxy server
async function startProxyServer() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting proxy server...');
            const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
            proxyProcess = (0, child_process_1.spawn)(pythonPath, ['Backend/lmstudio_proxy.py'], {
                stdio: 'pipe'
            });
            proxyProcess.stdout.on('data', (data) => {
                console.log('Proxy server output:', data.toString());
            });
            proxyProcess.stderr.on('data', (data) => {
                console.error('Proxy server error:', data.toString());
            });
            proxyProcess.on('error', (error) => {
                console.error('Failed to start proxy server:', error);
                reject(error);
            });
            // Wait for the server to start
            setTimeout(() => {
                console.log('Proxy server started');
                resolve();
            }, 2000);
        }
        catch (error) {
            console.error('Error starting proxy server:', error);
            reject(error);
        }
    });
}
// Stop proxy server
function stopProxyServer() {
    if (proxyProcess) {
        console.log('Stopping proxy server...');
        proxyProcess.kill();
        proxyProcess = null;
    }
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
            const modelsResponse = await (0, node_fetch_1.default)(`${LM_STUDIO_URL}/v1/models`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!modelsResponse.ok) {
                throw new Error(`Failed to get models: ${modelsResponse.statusText}`);
            }
            const modelsData = await modelsResponse.json();
            const models = modelsData.data.map((m) => m.id);
            if (!models.length) {
                throw new Error('No models available from LM Studio');
            }
            modelCache.availableModels = models;
            console.log('Available models:', modelCache.availableModels);
        }
        if (!modelCache.availableModels?.length) {
            throw new Error('No models available in cache');
        }
        // Make a test request to see which model responds
        const testResponse = await (0, node_fetch_1.default)(`${LM_STUDIO_URL}/v1/chat/completions`, {
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
            return testData.model;
        }
        // If no model info in response, use first available
        const defaultModel = modelCache.availableModels[0];
        console.log('Using first available model:', defaultModel);
        modelCache.activeModel = defaultModel;
        modelCache.lastCheck = now;
        return defaultModel;
    }
    catch (error) {
        console.error('Error getting active model:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
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
        // Check proxy server with active model
        console.log(`Checking proxy server at ${PROXY_URL}`);
        const proxyResponse = await (0, node_fetch_1.default)(`${PROXY_URL}/v1/chat/completions`, {
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
    }
    catch (error) {
        console.error('Connection check error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return false;
    }
}
// Process message - updated to match Message interface
async function processMessage(content) {
    try {
        return {
            id: crypto.randomUUID(),
            role: 'assistant',
            content,
            timestamp: Date.now(),
            status: 'complete',
            isStreaming: false
        };
    }
    catch (error) {
        console.error('Error processing message:', error);
        throw error;
    }
}
// Add message handling IPC
electron_1.ipcMain.handle('process-message', async (_event, content) => {
    return processMessage(content);
});
async function createWindow() {
    try {
        // Start proxy server first
        await startProxyServer();
        mainWindow = new electron_1.BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                preload: path.join(process.cwd(), 'dist/preload.js')
            },
            titleBarStyle: 'hidden',
            frame: false
        });
        // Check LM Studio connection before loading
        const isConnected = await error_handler_1.ErrorHandler.checkLMStudioConnection();
        if (!isConnected) {
            const shouldRetry = await error_handler_1.ErrorHandler.showConnectionError(mainWindow);
            if (shouldRetry) {
                return createWindow();
            }
            electron_1.app.quit();
            return;
        }
        mainWindow.loadFile(path.join(process.cwd(), 'dist/index.html'));
        // Window control handlers
        electron_1.ipcMain.on('minimize-window', () => mainWindow?.minimize());
        electron_1.ipcMain.on('maximize-window', () => {
            if (!mainWindow)
                return;
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            }
            else {
                mainWindow.maximize();
            }
        });
        electron_1.ipcMain.on('close-window', () => electron_1.app.quit());
    }
    catch (error) {
        console.error('Error creating window:', error);
        electron_1.app.quit();
    }
}
// Load tools configuration
const TOOLS_CONFIG_PATH = path.join(process.cwd(), 'Tools/tools_config.json');
let toolsConfig = { tools: [] };
// Chat history management
const CHATS_DIR = path.join(electron_1.app.getPath('userData'), 'chats');
// Initialize tools and chat directory
async function initialize() {
    try {
        toolsConfig = JSON.parse(await fs.readFile(TOOLS_CONFIG_PATH, 'utf8'));
    }
    catch (error) {
        console.error('Error loading tools config:', error);
    }
    if (!await fs.access(CHATS_DIR).then(() => true).catch(() => false)) {
        await fs.mkdir(CHATS_DIR, { recursive: true });
    }
}
// IPC Handlers
electron_1.ipcMain.handle('get-tools-config', () => toolsConfig);
// Helper function to handle chat completion retries
async function retryChatCompletion(messages, functions) {
    // Get the active model
    const activeModel = await getActiveModel();
    const uniqueMessages = messages.filter((message, index, self) => index === self.findIndex((m) => m.content === message.content));
    console.log('Retrying chat completion request:', {
        messages: uniqueMessages,
        functions,
        model: activeModel
    });
    const response = await (0, node_fetch_1.default)(`${PROXY_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: activeModel,
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
    return await response.json();
}
// Helper function to convert Node.js ReadableStream to Web ReadableStream
function convertNodeStreamToWebStream(nodeStream) {
    return new ReadableStream({
        start(controller) {
            nodeStream.on('data', (chunk) => {
                try {
                    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    controller.enqueue(buffer);
                }
                catch (error) {
                    controller.error(error);
                }
            });
            nodeStream.on('end', () => {
                controller.close();
            });
            nodeStream.on('error', (error) => {
                controller.error(error);
            });
        },
        cancel() {
            if ('destroy' in nodeStream) {
                nodeStream.destroy();
            }
        }
    });
}
// Helper function to handle streaming chat completion retries
async function retryStreamingChatCompletion(messages, functions, signal) {
    // Get the active model
    const activeModel = await getActiveModel();
    const uniqueMessages = messages.filter((message, index, self) => index === self.findIndex((m) => m.content === message.content));
    console.log('Retrying streaming chat completion request:', {
        messages: uniqueMessages,
        functions,
        model: activeModel
    });
    const controller = new AbortController();
    if (signal) {
        signal.addEventListener('abort', () => controller.abort());
    }
    const fetchOptions = {
        method: 'POST',
        headers: new node_fetch_1.Headers({
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }),
        body: JSON.stringify({
            model: activeModel,
            messages: uniqueMessages.map((msg) => ({
                role: msg.role,
                content: msg.content
            })),
            temperature: 0.2,
            stream: true,
            functions,
            function_call: 'auto'
        }),
        // Cast the signal to any to bypass type checking
        signal: controller.signal
    };
    const response = await (0, node_fetch_1.default)(`${PROXY_URL}/v1/chat/completions`, fetchOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
        throw new Error('Response body is null');
    }
    // Convert Node.js ReadableStream to Web ReadableStream
    const webStream = convertNodeStreamToWebStream(response.body);
    return {
        body: webStream,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
    };
}
// Chat completion endpoint
electron_1.ipcMain.handle('chat-completion', async (_event, { messages, functions }) => {
    try {
        return await retryChatCompletion(messages, functions);
    }
    catch (error) {
        console.error('Chat completion error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        if (!mainWindow)
            throw error;
        const action = await error_handler_1.ErrorHandler.handleAPIError(error, mainWindow);
        if (action === 'retry') {
            return await retryChatCompletion(messages, functions);
        }
        if (action === 'exit') {
            electron_1.app.quit();
        }
        throw error;
    }
});
// Streaming chat completion endpoint
electron_1.ipcMain.handle('chat-completion-stream', async (_event, { messages, functions, signal }) => {
    try {
        return await retryStreamingChatCompletion(messages, functions, signal);
    }
    catch (error) {
        console.error('Streaming chat completion error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        if (!mainWindow)
            throw error;
        const action = await error_handler_1.ErrorHandler.handleAPIError(error, mainWindow);
        if (action === 'retry') {
            return await retryStreamingChatCompletion(messages, functions, signal);
        }
        if (action === 'exit') {
            electron_1.app.quit();
        }
        throw error;
    }
});
// Tool execution endpoint
electron_1.ipcMain.handle('execute-tool', async (_event, { tool, params }) => {
    try {
        console.log(`Executing tool ${tool} with params:`, params);
        const response = await (0, node_fetch_1.default)(`${PROXY_URL}/v1/functions/${tool}`, {
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
    }
    catch (error) {
        console.error('Tool execution error:', error);
        return error_handler_1.ErrorHandler.showToolError(error, tool);
    }
});
// File analysis endpoint
electron_1.ipcMain.handle('analyze-file', async (_event, filePath) => {
    try {
        const response = await (0, node_fetch_1.default)(`${PROXY_URL}/v1/functions/analyze_file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_path: filePath })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('File analysis error:', error);
        throw error;
    }
});
// Chat history operations
electron_1.ipcMain.handle('show-open-dialog', async () => {
    if (!mainWindow)
        return null;
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.canceled ? null : result.filePaths[0];
});
electron_1.ipcMain.handle('save-chat', async (_event, { chatId, messages }) => {
    const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
    await fs.writeFile(chatFile, JSON.stringify(messages, null, 2));
});
electron_1.ipcMain.handle('delete-chat', async (_event, chatId) => {
    const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
    try {
        await fs.unlink(chatFile);
        return true;
    }
    catch (error) {
        console.error('Error deleting chat:', error);
        return false;
    }
});
electron_1.ipcMain.handle('show-confirm-dialog', async (_event, options) => {
    if (!mainWindow)
        return false;
    const result = await electron_1.dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        title: options.title || 'Confirm',
        message: options.message || 'Are you sure?',
        detail: options.detail || '',
    });
    return result.response === 0;
});
electron_1.ipcMain.handle('load-chats', async () => {
    try {
        const files = await fs.readdir(CHATS_DIR);
        const chats = [];
        for (const file of files) {
            const chatId = path.parse(file).name;
            const content = await fs.readFile(path.join(CHATS_DIR, file), 'utf8');
            const messages = JSON.parse(content);
            chats.push({
                id: chatId,
                messages,
                lastMessage: messages[messages.length - 1]?.content || ''
            });
        }
        return chats;
    }
    catch (error) {
        console.error('Error loading chats:', error);
        return [];
    }
});
electron_1.ipcMain.handle('load-chat', async (_event, chatId) => {
    try {
        const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
        const content = await fs.readFile(chatFile, 'utf8');
        return JSON.parse(content);
    }
    catch (error) {
        console.error('Error loading chat:', error);
        return [];
    }
});
// App lifecycle
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    stopProxyServer();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
