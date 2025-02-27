"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcChannels = void 0;
// Constants for IPC channels
var IpcChannels;
(function (IpcChannels) {
    IpcChannels["CHAT_COMPLETION"] = "chat-completion";
    IpcChannels["CHAT_COMPLETION_STREAM"] = "chat-completion-stream";
    IpcChannels["EXECUTE_TOOL"] = "execute-tool";
    IpcChannels["GET_TOOLS"] = "get-tools-config";
    IpcChannels["GET_TOOLS_CONFIG"] = "get-tools-config";
    IpcChannels["GET_CHAT_HISTORY"] = "get-chat-history";
    IpcChannels["LOAD_CHAT"] = "load-chat";
    IpcChannels["SAVE_CHAT"] = "save-chat";
    IpcChannels["DELETE_CHAT"] = "delete-chat";
    IpcChannels["SHOW_CONFIRM_DIALOG"] = "show-confirm-dialog";
    IpcChannels["SHOW_OPEN_DIALOG"] = "show-open-dialog";
    IpcChannels["ANALYZE_FILE"] = "analyze-file";
    IpcChannels["PROCESS_MESSAGE"] = "process-message";
    IpcChannels["WINDOW_MINIMIZE"] = "window-minimize";
    IpcChannels["WINDOW_MAXIMIZE"] = "window-maximize";
    IpcChannels["WINDOW_CLOSE"] = "window-close";
    IpcChannels["GET_MODELS"] = "get-models";
    IpcChannels["GET_ACTIVE_MODEL"] = "get-active-model";
})(IpcChannels || (exports.IpcChannels = IpcChannels = {}));
