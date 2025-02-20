import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import type { ElectronBridge } from './UI/types/electron';

// Extend Vitest's expect method with testing-library matchers
expect.extend(matchers);

// Declare window.electron
declare global {
    interface Window {
        electron: ElectronBridge;
    }
}

// Mock Electron
vi.mock('electron', () => {
    return {
        contextBridge: {
            exposeInMainWorld: vi.fn()
        },
        ipcRenderer: {
            on: vi.fn(),
            invoke: vi.fn(),
            removeAllListeners: vi.fn()
        }
    };
});

// Create a mock window.electron object
Object.defineProperty(window, 'electron', {
    value: {
        invoke: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn()
    },
    writable: true
});

// Create test utilities for IPC
export const mockIpc = {
    // Mock successful IPC calls
    mockSuccess: (channel: string, response: any) => {
        (window.electron.invoke as any).mockImplementation((ch: string) => 
            ch === channel ? Promise.resolve(response) : Promise.reject(new Error(`Unknown channel: ${ch}`))
        );
    },
    // Mock failed IPC calls
    mockError: (channel: string, error: Error) => {
        (window.electron.invoke as any).mockImplementation((ch: string) =>
            ch === channel ? Promise.reject(error) : Promise.reject(new Error(`Unknown channel: ${ch}`))
        );
    },
    // Mock streaming responses
    mockStream: (channel: string, chunks: any[]) => {
        const mockStream = new ReadableStream({
            start(controller) {
                chunks.forEach(chunk => controller.enqueue(chunk));
                controller.close();
            }
        });
        (window.electron.invoke as any).mockImplementation((ch: string) =>
            ch === channel ? Promise.resolve({
                body: mockStream,
                headers: new Headers({
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                }),
                status: 200,
                statusText: 'OK'
            }) : Promise.reject(new Error(`Unknown channel: ${ch}`))
        );
    },
    // Reset all mocks
    reset: () => {
        vi.clearAllMocks();
        (window.electron.invoke as any).mockReset();
        (window.electron.on as any).mockReset();
        (window.electron.removeAllListeners as any).mockReset();
    }
};

// Cleanup after each test
afterEach(() => {
    cleanup();
    mockIpc.reset();
}); 