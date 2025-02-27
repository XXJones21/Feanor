import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

// Simplified IPC channels const to avoid import issues
const IpcChannels = {
    CHAT_COMPLETION: 'chat-completion',
    CHAT_COMPLETION_STREAM: 'chat-completion-stream',
    EXECUTE_TOOL: 'execute-tool',
    GET_TOOLS: 'get-tools-config',
    GET_TOOLS_CONFIG: 'get-tools-config',
    GET_CHAT_HISTORY: 'get-chat-history',
    LOAD_CHAT: 'load-chat',
    SAVE_CHAT: 'save-chat',
    DELETE_CHAT: 'delete-chat',
    SHOW_CONFIRM_DIALOG: 'show-confirm-dialog',
    SHOW_OPEN_DIALOG: 'show-open-dialog',
    ANALYZE_FILE: 'analyze-file',
    PROCESS_MESSAGE: 'process-message',
    WINDOW_MINIMIZE: 'window-minimize',
    WINDOW_MAXIMIZE: 'window-maximize',
    WINDOW_CLOSE: 'window-close',
    GET_MODELS: 'get-models',
    GET_ACTIVE_MODEL: 'get-active-model'
};

// Add logging for debugging
console.log('Preload script starting...');

// Expose protected methods that allow the renderer process to use IPC
contextBridge.exposeInMainWorld('electron', {
    invoke: (channel: string, data?: any) => {
        // Log for debugging
        console.log(`IPC invoke: ${channel}`, data);
        return ipcRenderer.invoke(channel, data);
    },
    
    showOpenDialog: async () => {
        try {
            console.log('Showing open dialog');
            const result = await ipcRenderer.invoke(IpcChannels.SHOW_OPEN_DIALOG);
            return result || null;
        } catch (error) {
            console.error('Show open dialog error:', error);
            return null;
        }
    },

    on: (channel: string, callback: (...args: any[]) => void) => {
        console.log('IPC Bridge on:', channel);
        ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: any[]) => callback(...args));
    },

    removeAllListeners: (channel: string) => {
        console.log('IPC Bridge removeAllListeners:', channel);
        ipcRenderer.removeAllListeners(channel);
    }
});

console.log('Preload script completed successfully'); 