import { BrowserWindow, IpcMainInvokeEvent } from 'electron';

export interface Message {
    type: string;
    content: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    name?: string;
    function_call?: {
        name: string;
        arguments: string;
    };
}

export interface ChatCompletionRequest {
    messages: ChatMessage[];
    functions?: any[];
    signal?: AbortSignal;
}

export interface ToolExecutionRequest {
    tool: string;
    params: Record<string, any>;
}

export interface ErrorHandlerResult {
    action: 'retry' | 'exit' | 'ignore';
}

export interface StreamResponse {
    body: NodeJS.ReadableStream;
    headers: Headers;
    status: number;
}

export interface ToolsConfig {
    tools: any[];
}

export interface SaveChatRequest {
    chatId: string;
    messages: ChatMessage[];
}

export interface WindowState {
    isMaximized: boolean;
} 