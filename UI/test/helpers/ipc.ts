import { expect } from 'vitest';
import type { IpcChannel } from '@/types/electron';

/**
 * Helper function to create a mock response for chat completion
 */
export function createMockChatResponse(content: string) {
    return {
        choices: [{
            message: {
                content,
                role: 'assistant'
            }
        }]
    };
}

/**
 * Helper function to create a mock stream chunk
 */
export function createMockStreamChunk(content: string) {
    return `data: ${JSON.stringify({
        choices: [{
            delta: {
                content,
                role: 'assistant'
            }
        }]
    })}\n\n`;
}

/**
 * Helper function to create a mock error response
 */
export function createMockErrorResponse(message: string) {
    return {
        error: {
            message,
            type: 'server_error',
            code: 500
        }
    };
}

/**
 * Helper function to wait for IPC calls
 */
export async function waitForIpcCall(channel: IpcChannel) {
    await new Promise(process.nextTick);
    expect(window.electron.invoke).toHaveBeenCalledWith(channel, expect.any(Object));
}

/**
 * Helper function to simulate stream processing
 */
export async function processStream(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
    }

    return result;
}

/**
 * Helper function to create a mock file
 */
export function createMockFile(name: string, type: string, size: number = 1024) {
    return {
        name,
        type,
        size,
        path: `mock/path/${name}`
    };
}

/**
 * Helper function to create a mock chat message
 */
export function createMockMessage(content: string, role: 'user' | 'assistant' | 'system' = 'user') {
    return {
        id: crypto.randomUUID(),
        content,
        role,
        timestamp: Date.now()
    };
}

/**
 * Helper function to create a mock chat history
 */
export function createMockChatHistory(messageCount: number = 5) {
    const messages = [];
    for (let i = 0; i < messageCount; i++) {
        messages.push(
            createMockMessage(`User message ${i}`, 'user'),
            createMockMessage(`Assistant response ${i}`, 'assistant')
        );
    }
    return messages;
} 