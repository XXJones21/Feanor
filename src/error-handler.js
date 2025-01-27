const { dialog } = require('electron');
const fetch = require('node-fetch');

class ErrorHandler {
    static async checkLMStudioConnection() {
        try {
            console.log('Attempting to connect to proxy server at http://127.0.0.1:4892/v1/chat/completions');
            const response = await fetch('http://127.0.0.1:4892/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: "system", content: "test" }],
                    model: "local-model"
                })
            });
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`Proxy server responded with status ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Connection error:', error.message);
            return false;
        }
    }

    static async showConnectionError(window) {
        const result = await dialog.showMessageBox(window, {
            type: 'error',
            title: 'Connection Error',
            message: 'Cannot connect to proxy server',
            detail: 'Please make sure the proxy server is running on port 4892.',
            buttons: ['Retry', 'Exit'],
            defaultId: 0,
            cancelId: 1
        });

        return result.response === 0;
    }

    static updateStatusManager(status, details) {
        if (window.statusManager) {
            window.statusManager.setStatus(status, details);
        }
    }

    static async handleAPIError(error, window) {
        // Don't show dialog for aborted requests
        if (error.name === 'AbortError') {
            return 'abort';
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            const result = await dialog.showMessageBox(window, {
                type: 'error',
                title: 'Connection Error',
                message: 'Failed to connect to LM Studio',
                detail: 'Please check if LM Studio is running and the proxy server is accessible.',
                buttons: ['Retry', 'Exit'],
                defaultId: 0,
                cancelId: 1
            });
            return result.response === 0 ? 'retry' : 'exit';
        }

        // Handle streaming errors
        if (error.message.includes('stream')) {
            const result = await dialog.showMessageBox(window, {
                type: 'error',
                title: 'Streaming Error',
                message: 'Error during response streaming',
                detail: 'The connection was interrupted. Would you like to retry?',
                buttons: ['Retry', 'Continue'],
                defaultId: 0,
                cancelId: 1
            });
            return result.response === 0 ? 'retry' : 'continue';
        }

        // Handle other API errors
        const result = await dialog.showMessageBox(window, {
            type: 'error',
            title: 'API Error',
            message: 'Error communicating with LM Studio',
            detail: `${error.message}\nWould you like to retry?`,
            buttons: ['Retry', 'Continue'],
            defaultId: 0,
            cancelId: 1
        });

        return result.response === 0 ? 'retry' : 'continue';
    }

    static async showToolError(error, toolName) {
        console.error(`Tool execution error (${toolName}):`, error);
        return {
            error: true,
            message: `Error executing tool ${toolName}: ${error.message}`
        };
    }
}

// Add error handling for inaccessible content
function handleContentAccessError(error) {
    if (error.message.includes('[object Object]') || error.message.includes('Cannot access content')) {
        return {
            type: 'content_access_error',
            message: "I apologize, but I'm unable to directly access the content of this link. This could be due to JavaScript requirements, authentication, or other technical limitations. Could you please paste the relevant content directly in our chat?",
            suggestions: [
                "Copy and paste the relevant text directly into our conversation",
                "Share a screenshot of the content",
                "Describe the key points you'd like me to analyze"
            ]
        };
    }
    return null;
}

// Export the handler
module.exports = {
    ErrorHandler,
    handleContentAccessError
}; 