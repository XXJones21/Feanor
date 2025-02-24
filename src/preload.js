const { contextBridge, ipcRenderer } = require('electron');

// Helper function to convert Electron's response to a web Response
const createResponseFromStream = async (streamResponse) => {
    // Create a ReadableStream to handle the streaming data
    const stream = new ReadableStream({
        start(controller) {
            // Handle incoming chunks
            streamResponse.on('data', chunk => {
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
            streamResponse.on('error', error => {
                controller.error(error);
            });
        },
        cancel() {
            // Cleanup if the stream is cancelled
            streamResponse.destroy();
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
};

// Log all IPC messages for debugging
ipcRenderer.on('ipc-log', (event, message) => {
    console.log('IPC Log:', message);
});

contextBridge.exposeInMainWorld('electron', {
    invoke: async (channel, data) => {
        console.log('IPC Bridge invoke:', { 
            channel, 
            data: {
                ...data,
                messages: data.messages?.map(m => ({ role: m.role, content: m.content }))
            }
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
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },
    on: (channel, func) => {
        console.log('IPC Bridge on:', channel);
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: (channel) => {
        console.log('IPC Bridge removeAllListeners:', channel);
        ipcRenderer.removeAllListeners(channel);
    }
});