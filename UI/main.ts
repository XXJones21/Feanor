import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { ErrorHandler } from './error-handler';
import {
    Message,
    ChatMessage,
    ChatCompletionRequest,
    ToolExecutionRequest,
    StreamResponse,
    SaveChatRequest,
    ToolsConfig,
    ModelCache
} from './types/electron';

let mainWindow: BrowserWindow | null = null;

// Constants
const PROXY_PORT = 4892;
const PROXY_URL = `http://127.0.0.1:${PROXY_PORT}`;
const LM_STUDIO_PORT = 4891;
const LM_STUDIO_URL = `http://127.0.0.1:${LM_STUDIO_PORT}`;

// Add cache for model information
let modelCache: ModelCache = {
    activeModel: null,
    availableModels: null,
    lastCheck: 0
};

// Add function to get the active model from LM Studio
async function getActiveModel(forceRefresh = false): Promise<string> {
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
            const models = modelsData.data.map((m: any) => m.id);
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
            return testData.model;
        }

        // If no model info in response, use first available
        const defaultModel = modelCache.availableModels[0];
        console.log('Using first available model:', defaultModel);
        modelCache.activeModel = defaultModel;
        modelCache.lastCheck = now;
        return defaultModel;
    } catch (error) {
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
async function checkConnections(): Promise<boolean> {
    console.log('Checking connections...');
    
    try {
        // Get the active model (this will also check LM Studio connection)
        const activeModel = await getActiveModel(true); // Force refresh on startup
        console.log(`Active model: ${activeModel}`);

        // Check proxy server with active model
        console.log(`Checking proxy server at ${PROXY_URL}`);
        const proxyResponse = await fetch(`${PROXY_URL}/v1/chat/completions`, {
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
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return false;
    }
}

// Process message
async function processMessage(message: string): Promise<Message> {
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
ipcMain.handle('process-message', async (_event: IpcMainInvokeEvent, message: string) => {
    return processMessage(message);
});

async function createWindow(): Promise<void> {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
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
    ipcMain.on('minimize-window', () => mainWindow?.minimize());
    ipcMain.on('maximize-window', () => {
        if (!mainWindow) return;
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
let toolsConfig: ToolsConfig = { tools: [] };

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

// Helper function to handle chat completion retries
async function retryChatCompletion(messages: ChatMessage[], functions?: any[]): Promise<any> {
    // Get the active model
    const activeModel = await getActiveModel();

    const uniqueMessages = messages.filter((message, index, self) =>
        index === self.findIndex((m) => m.content === message.content)
    );

    console.log('Retrying chat completion request:', { 
        messages: uniqueMessages, 
        functions,
        model: activeModel
    });
    
    const response = await fetch(`${PROXY_URL}/v1/chat/completions`, {
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

// Helper function to handle streaming chat completion retries
async function retryStreamingChatCompletion(messages: ChatMessage[], functions?: any[], signal?: AbortSignal): Promise<StreamResponse> {
    // Get the active model
    const activeModel = await getActiveModel();

    const uniqueMessages = messages.filter((message, index, self) =>
        index === self.findIndex((m) => m.content === message.content)
    );

    console.log('Retrying streaming chat completion request:', { 
        messages: uniqueMessages, 
        functions,
        model: activeModel
    });
    
    const controller = new AbortController();
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
            model: activeModel,
            messages: uniqueMessages,
            temperature: 0.2,
            stream: true,
            functions,
            function_call: 'auto'
        }),
        signal: controller.signal as any
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    return {
        body: response.body,
        headers: response.headers as any,
        status: response.status
    };
}

// Chat completion endpoint
ipcMain.handle('chat-completion', async (_event: IpcMainInvokeEvent, { messages, functions }: ChatCompletionRequest) => {
    try {
        return await retryChatCompletion(messages, functions);
    } catch (error) {
        console.error('Chat completion error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        if (!mainWindow) throw error;
        const action = await ErrorHandler.handleAPIError(error, mainWindow);
        if (action === 'retry') {
            return await retryChatCompletion(messages, functions);
        }
        if (action === 'exit') {
            app.quit();
        }
        throw error;
    }
});

// Streaming chat completion endpoint
ipcMain.handle('chat-completion-stream', async (_event: IpcMainInvokeEvent, { messages, functions, signal }: ChatCompletionRequest): Promise<StreamResponse> => {
    try {
        return await retryStreamingChatCompletion(messages, functions, signal);
    } catch (error) {
        console.error('Streaming chat completion error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        if (!mainWindow) throw error;
        const action = await ErrorHandler.handleAPIError(error, mainWindow);
        if (action === 'retry') {
            return await retryStreamingChatCompletion(messages, functions, signal);
        }
        if (action === 'exit') {
            app.quit();
        }
        throw error;
    }
});

// Tool execution endpoint
ipcMain.handle('execute-tool', async (_event: IpcMainInvokeEvent, { tool, params }: ToolExecutionRequest) => {
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

// File analysis endpoint
ipcMain.handle('analyze-file', async (_event: IpcMainInvokeEvent, filePath: string) => {
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
ipcMain.handle('save-chat', async (_event: IpcMainInvokeEvent, { chatId, messages }: SaveChatRequest) => {
    const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
    await fs.promises.writeFile(chatFile, JSON.stringify(messages, null, 2));
});

ipcMain.handle('delete-chat', async (_event: IpcMainInvokeEvent, chatId: string) => {
    const chatFile = path.join(CHATS_DIR, `${chatId}.json`);
    try {
        await fs.promises.unlink(chatFile);
        return true;
    } catch (error) {
        console.error('Error deleting chat:', error);
        return false;
    }
});

ipcMain.handle('show-confirm-dialog', async (_event: IpcMainInvokeEvent, options: Electron.MessageBoxOptions) => {
    if (!mainWindow) return false;
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

ipcMain.handle('load-chat', async (_event: IpcMainInvokeEvent, chatId: string) => {
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