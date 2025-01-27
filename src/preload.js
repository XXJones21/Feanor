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

contextBridge.exposeInMainWorld('electron', {
    invoke: async (channel, data) => {
        const response = await ipcRenderer.invoke(channel, data);
        
        // Handle streaming responses
        if (channel === 'chat-completion-stream') {
            return createResponseFromStream(response);
        }
        
        return response;
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});