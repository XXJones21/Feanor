import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { 
    ChatMessage,
    ElectronBridge,
    IpcChannel,
    IpcChannels
} from './types/electron';

/**
 * Helper function to convert Electron's response to a web Response
 */
async function createResponseFromStream(streamResponse: NodeJS.ReadableStream): Promise<Response> {
    // Create a ReadableStream to handle the streaming data
    const stream = new ReadableStream({
        start(controller) {
            // Handle incoming chunks
            streamResponse.on('data', (chunk: Buffer | string) => {
                try {
                    // Ensure chunk is a Buffer or convert it
                    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    controller.enqueue(buffer);
                } catch (error) {
                    controller.error(error);
                }
            });

            // Handle stream completion
            streamResponse.on('end', () => {
                controller.close();
            });

            // Handle errors
            streamResponse.on('error', (error: Error) => {
                controller.error(error);
            });
        },
        cancel() {
            // Cleanup if the stream is cancelled
            if ('destroy' in streamResponse) {
                (streamResponse as any).destroy();
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
ipcRenderer.on('ipc-log', (_event: IpcRendererEvent, message: string) => {
    console.log('IPC Log:', message);
});

// Expose protected methods that allow the renderer process to use
// specific electron APIs through a secure bridge
const electronBridge: ElectronBridge = {
    invoke: async <T = any>(channel: IpcChannel, data?: any): Promise<T> => {
        console.log('IPC Bridge invoke:', { 
            channel, 
            data: data ? {
                ...data,
                messages: data.messages?.map((m: ChatMessage) => ({ 
                    role: m.role, 
                    content: m.content 
                }))
            } : undefined
        });

        try {
            const response = await ipcRenderer.invoke(channel, data);
            console.log('IPC Bridge response received for channel:', {
                channel,
                timestamp: new Date().toISOString(),
                status: 'success'
            });
            return response;
        } catch (error) {
            console.error('IPC Bridge error:', {
                channel,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },

    on: (channel: IpcChannel, callback: (...args: any[]) => void): void => {
        console.log('IPC Bridge on:', channel);
        ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: any[]) => callback(...args));
    },

    removeAllListeners: (channel: IpcChannel): void => {
        console.log('IPC Bridge removeAllListeners:', channel);
        ipcRenderer.removeAllListeners(channel);
    }
};

// Expose the bridge to the renderer process
contextBridge.exposeInMainWorld('electron', electronBridge);

// Declare the electron bridge in the window object
declare global {
    interface Window {
        electron: ElectronBridge;
    }
} 