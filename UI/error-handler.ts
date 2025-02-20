import { BrowserWindow, dialog } from 'electron';
import fetch from 'node-fetch';

export interface ErrorHandlerResult {
    action: 'retry' | 'exit' | 'ignore';
}

export class ErrorHandler {
    private static readonly PROXY_URL = 'http://127.0.0.1:4892';

    static async checkLMStudioConnection(): Promise<boolean> {
        try {
            const response = await fetch(this.PROXY_URL);
            return response.ok;
        } catch (error) {
            console.error('LM Studio connection error:', error);
            return false;
        }
    }

    static async showConnectionError(window: BrowserWindow): Promise<boolean> {
        const result = await dialog.showMessageBox(window, {
            type: 'error',
            title: 'Connection Error',
            message: 'Could not connect to LM Studio',
            detail: 'Please make sure LM Studio is running and try again.',
            buttons: ['Retry', 'Exit'],
            defaultId: 0
        });

        return result.response === 0;
    }

    static async handleAPIError(error: unknown, window: BrowserWindow): Promise<'retry' | 'exit' | 'ignore'> {
        console.error('API Error:', error);

        const result = await dialog.showMessageBox(window, {
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

    static async showToolError(error: unknown, tool: string): Promise<void> {
        console.error(`Tool error (${tool}):`, error);
        
        const options = {
            type: 'error' as const,
            title: 'Tool Error',
            message: `An error occurred while executing the tool: ${tool}`,
            detail: error instanceof Error ? error.message : 'Unknown error',
            buttons: ['OK'],
            defaultId: 0
        };

        await dialog.showMessageBox(options);
    }
} 