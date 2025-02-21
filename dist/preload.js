"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("./types/electron");
/**
 * Helper function to convert Electron's response to a web Response
 */
async function createResponseFromStream(streamResponse) {
    // Create a ReadableStream to handle the streaming data
    const stream = new ReadableStream({
        start(controller) {
            // Handle incoming chunks
            streamResponse.on('data', (chunk) => {
                try {
                    // Ensure chunk is a Buffer or convert it
                    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    controller.enqueue(buffer);
                }
                catch (error) {
                    controller.error(error);
                }
            });
            // Handle stream completion
            streamResponse.on('end', () => {
                controller.close();
            });
            // Handle errors
            streamResponse.on('error', (error) => {
                controller.error(error);
            });
        },
        cancel() {
            // Cleanup if the stream is cancelled
            if ('destroy' in streamResponse) {
                streamResponse.destroy();
            }
        }
    });
    // Return a Response object that can be used by the renderer
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}
// Log all IPC messages for debugging
electron_1.ipcRenderer.on('ipc-log', (_event, message) => {
    console.log('IPC Log:', message);
});
// Expose protected methods that allow the renderer process to use
// specific electron APIs through a secure bridge
const electronBridge = {
    invoke: async (channel, data) => {
        console.log('IPC Bridge invoke:', {
            channel,
            data: data ? {
                ...data,
                messages: data.messages?.map((m) => ({
                    role: m.role,
                    content: m.content
                }))
            } : undefined
        });
        try {
            const response = await electron_1.ipcRenderer.invoke(channel, data);
            console.log('IPC Bridge response received for channel:', {
                channel,
                timestamp: new Date().toISOString(),
                status: 'success'
            });
            return response;
        }
        catch (error) {
            console.error('IPC Bridge error:', {
                channel,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },
    showOpenDialog: async () => {
        try {
            const result = await electron_1.ipcRenderer.invoke(electron_2.IpcChannels.SHOW_OPEN_DIALOG);
            return result || null;
        }
        catch (error) {
            console.error('Show open dialog error:', error);
            return null;
        }
    },
    on: (channel, callback) => {
        console.log('IPC Bridge on:', channel);
        electron_1.ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    },
    removeAllListeners: (channel) => {
        console.log('IPC Bridge removeAllListeners:', channel);
        electron_1.ipcRenderer.removeAllListeners(channel);
    }
};
// Expose the bridge to the renderer process
electron_1.contextBridge.exposeInMainWorld('electron', electronBridge);
