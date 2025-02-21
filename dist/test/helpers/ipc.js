"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockChatResponse = createMockChatResponse;
exports.createMockStreamChunk = createMockStreamChunk;
exports.createMockErrorResponse = createMockErrorResponse;
exports.waitForIpcCall = waitForIpcCall;
exports.processStream = processStream;
exports.createMockFile = createMockFile;
exports.createMockMessage = createMockMessage;
exports.createMockChatHistory = createMockChatHistory;
const vitest_1 = require("vitest");
/**
 * Helper function to create a mock response for chat completion
 */
function createMockChatResponse(content) {
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
function createMockStreamChunk(content) {
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
function createMockErrorResponse(message) {
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
async function waitForIpcCall(channel) {
    await new Promise(process.nextTick);
    (0, vitest_1.expect)(window.electron.invoke).toHaveBeenCalledWith(channel, vitest_1.expect.any(Object));
}
/**
 * Helper function to simulate stream processing
 */
async function processStream(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        result += decoder.decode(value);
    }
    return result;
}
/**
 * Helper function to create a mock file
 */
function createMockFile(name, type, size = 1024) {
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
function createMockMessage(content, role = 'user') {
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
function createMockChatHistory(messageCount = 5) {
    const messages = [];
    for (let i = 0; i < messageCount; i++) {
        messages.push(createMockMessage(`User message ${i}`, 'user'), createMockMessage(`Assistant response ${i}`, 'assistant'));
    }
    return messages;
}
