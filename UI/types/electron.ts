/**
 * Basic message type
 */
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Chat message type
 */
export interface ChatMessage extends Message {
    id?: string;
    timestamp?: number;
    status?: 'pending' | 'complete' | 'error';
    error?: string;
}

/**
 * Chat completion request type
 */
export interface ChatCompletionRequest {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    stream?: boolean;
}

/**
 * Tool execution request type
 */
export interface ToolExecutionRequest {
    tool: string;
    params: Record<string, unknown>;
}

/**
 * Stream response type
 */
export interface StreamResponse {
    body: ReadableStream;
    headers: Headers;
    status: number;
    statusText: string;
}

/**
 * Save chat request type
 */
export interface SaveChatRequest {
    chatId: string;
    messages: ChatMessage[];
}

/**
 * Tools configuration type
 */
export interface ToolsConfig {
    tools: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }[];
}

/**
 * Model cache for storing LM Studio model information
 */
export interface ModelCache {
    /** Currently active model ID */
    activeModel: string | null;
    /** List of available model IDs */
    availableModels: string[] | null;
    /** Timestamp of last cache update */
    lastCheck: number;
}

// IPC Channel Types
export const IpcChannels = {
    CHAT_COMPLETION: 'chat-completion',
    CHAT_COMPLETION_STREAM: 'chat-completion-stream',
    GET_MODELS: 'get-models',
    GET_ACTIVE_MODEL: 'get-active-model',
    SAVE_CHAT: 'save-chat',
    LOAD_CHAT: 'load-chat',
    DELETE_CHAT: 'delete-chat',
    GET_CHAT_HISTORY: 'get-chat-history',
    EXECUTE_TOOL: 'execute-tool',
    GET_TOOLS: 'get-tools'
} as const;

export type IpcChannel = typeof IpcChannels[keyof typeof IpcChannels];

// Bridge Types
export interface ElectronBridge {
    invoke: <T = any>(channel: IpcChannel, data?: any) => Promise<T>;
    on: (channel: IpcChannel, callback: (...args: any[]) => void) => void;
    removeAllListeners: (channel: IpcChannel) => void;
}

declare global {
    interface Window {
        electron: ElectronBridge;
    }
} 