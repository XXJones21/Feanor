"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const electron_1 = require("electron");
const node_fetch_1 = __importDefault(require("node-fetch"));
class ErrorHandler {
    static PROXY_URL = 'http://127.0.0.1:4892';
    static LM_STUDIO_URL = 'http://127.0.0.1:4891';
    static async checkLMStudioConnection() {
        try {
            // First check LM Studio
            console.log('Checking LM Studio connection...');
            const lmStudioResponse = await (0, node_fetch_1.default)(`${this.LM_STUDIO_URL}/v1/models`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!lmStudioResponse.ok) {
                console.error('LM Studio connection failed:', lmStudioResponse.statusText);
                return false;
            }
            // Then check proxy
            console.log('Checking proxy connection...');
            const proxyResponse = await (0, node_fetch_1.default)(`${this.PROXY_URL}/health`);
            if (!proxyResponse.ok) {
                console.error('Proxy connection failed:', proxyResponse.statusText);
                return false;
            }
            const health = await proxyResponse.json();
            if (!health.lmstudio_connected) {
                console.error('Proxy reports LM Studio is not connected');
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Connection error:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return false;
        }
    }
    static async showConnectionError(window) {
        const result = await electron_1.dialog.showMessageBox(window, {
            type: 'error',
            title: 'Connection Error',
            message: 'Could not connect to LM Studio',
            detail: 'Please ensure:\n\n' +
                '1. LM Studio is running\n' +
                '2. A model is loaded in LM Studio\n' +
                '3. The local server is enabled in LM Studio settings\n' +
                '4. The server is running on port 4891\n\n' +
                'Would you like to retry the connection?',
            buttons: ['Retry', 'Exit'],
            defaultId: 0
        });
        return result.response === 0;
    }
    static async handleAPIError(error, window) {
        console.error('API Error:', error);
        const result = await electron_1.dialog.showMessageBox(window, {
            type: 'error',
            title: 'API Error',
            message: 'An error occurred while communicating with the API',
            detail: error instanceof Error ? error.message : 'Unknown error',
            buttons: ['Retry', 'Exit', 'Ignore'],
            defaultId: 0
        });
        switch (result.response) {
            case 0:
                return 'retry';
            case 1:
                return 'exit';
            default:
                return 'ignore';
        }
    }
    static async showToolError(error, tool) {
        console.error(`Tool error (${tool}):`, error);
        const options = {
            type: 'error',
            title: 'Tool Error',
            message: `An error occurred while executing the tool: ${tool}`,
            detail: error instanceof Error ? error.message : 'Unknown error',
            buttons: ['OK'],
            defaultId: 0
        };
        await electron_1.dialog.showMessageBox(options);
    }
}
exports.ErrorHandler = ErrorHandler;
