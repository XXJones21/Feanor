"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcChannels = void 0;
// IPC Channel Types
exports.IpcChannels = {
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
};
