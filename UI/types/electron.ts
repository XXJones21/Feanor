import type { MessageRole, MessageStatus, MessageError, Tool, ToolParameter } from './chat';
import type { Headers as NodeFetchHeaders } from 'node-fetch';

/**
 * Basic message type
 */
export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: number;
    status: MessageStatus;
    error?: MessageError;
}

/**
 * Chat message type
 */
export interface ChatMessage extends Message {
    isStreaming?: boolean;
}

/**
 * Chat completion request type
 */
export interface ChatCompletionRequest {
    messages: ChatMessage[];
    functions?: Tool[];
    temperature?: number;
    stream?: boolean;
    function_call?: 'auto' | 'none';
    model?: string;
    signal?: AbortSignal;
}

/**
 * Chat completion response type
 */
export interface ChatCompletionResponse {
    choices: Array<{
        message: {
            content: string;
            role?: MessageRole;
        };
    }>;
}

/**
 * Tool execution request type
 */
export interface ToolExecutionRequest {
    tool: string;
    params: Record<string, unknown>;
}

/**
 * Tool execution response type
 */
export interface ToolExecutionResponse {
    title?: string;
    text?: string;
    links?: string[];
}

/**
 * Stream response type
 */
export interface StreamResponse {
    body: ReadableStream;
    headers: NodeFetchHeaders;
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
    tools: Tool[];
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
    GET_TOOLS: 'get-tools',
    // Window control channels
    WINDOW_MINIMIZE: 'window-minimize',
    WINDOW_MAXIMIZE: 'window-maximize',
    WINDOW_CLOSE: 'window-close',
    SHOW_CONFIRM_DIALOG: 'show-confirm-dialog',
    SHOW_OPEN_DIALOG: 'show-open-dialog'
} as const;

export type IpcChannel = typeof IpcChannels[keyof typeof IpcChannels];

// Bridge Types
export interface ElectronBridge {
    invoke: {
        (channel: typeof IpcChannels.CHAT_COMPLETION, data: ChatCompletionRequest): Promise<ChatCompletionResponse>;
        (channel: typeof IpcChannels.CHAT_COMPLETION_STREAM, data: ChatCompletionRequest): Promise<StreamResponse>;
        (channel: typeof IpcChannels.EXECUTE_TOOL, data: ToolExecutionRequest): Promise<ToolExecutionResponse>;
        (channel: typeof IpcChannels.SAVE_CHAT, data: SaveChatRequest): Promise<void>;
        (channel: typeof IpcChannels.GET_CHAT_HISTORY): Promise<Array<{ id: string; messages: ChatMessage[] }>>;
        (channel: typeof IpcChannels.LOAD_CHAT, chatId: string): Promise<ChatMessage[]>;
        (channel: typeof IpcChannels.DELETE_CHAT, chatId: string): Promise<void>;
        (channel: typeof IpcChannels.GET_TOOLS): Promise<ToolsConfig>;
        (channel: typeof IpcChannels.SHOW_CONFIRM_DIALOG, options: { 
            title: string; 
            message: string; 
            detail?: string;
            buttons?: string[];
            defaultId?: number;
            type?: string;
        }): Promise<{ response: number }>;
        (channel: typeof IpcChannels.WINDOW_MINIMIZE): Promise<void>;
        (channel: typeof IpcChannels.WINDOW_MAXIMIZE): Promise<void>;
        (channel: typeof IpcChannels.WINDOW_CLOSE): Promise<void>;
        // Generic fallback for any other channels
        <T = any>(channel: IpcChannel, data?: any): Promise<T>;
    };
    showOpenDialog: () => Promise<string | null>;
    on: (channel: IpcChannel, callback: (...args: any[]) => void) => void;
    removeAllListeners: (channel: IpcChannel) => void;
}

declare global {
    interface Window {
        electron: ElectronBridge;
    }
} 