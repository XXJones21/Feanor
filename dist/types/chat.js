"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatError = void 0;
/**
 * Error Types
 */
class ChatError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ChatError';
    }
}
exports.ChatError = ChatError;
