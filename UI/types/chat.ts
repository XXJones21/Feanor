/**
 * Message Types
 */
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
  id?: string;
}

/**
 * Tool Types
 */
export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  items?: {
    type: string;
    description?: string;
  };
  properties?: Record<string, ToolParameter>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

/**
 * Component Props Types
 */
export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onRetry: (messageIndex: number) => Promise<void>;
}

export interface InputAreaProps {
  onSendMessage: (content: string, attachment?: FileAttachment | null) => Promise<void>;
  isLoading: boolean;
}

export interface FileAttachment {
  name: string;
  path: string;
  type?: string;
  size?: number;
}

/**
 * Hook Types
 */
export interface ChatHistory {
  messages: Message[];
  addMessage: (chatId: string, message: Message) => Promise<void>;
  loadChat: (chatId: string) => void;
  initializeChat: (chatId: string) => void;
}

export interface ToolsHook {
  tools: Tool[];
  executeToolByName: (name: string, params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Error Types
 */
export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

/**
 * Electron Bridge Types
 */
export interface ElectronBridge {
  invoke(channel: 'chat-completion', payload: {
    messages: Message[];
    functions: Tool[];
    temperature: number;
    stream: boolean;
    function_call: 'auto' | 'none';
    model: string;
  }): Promise<{
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }>;
}

declare global {
  interface Window {
    electron: ElectronBridge;
  }
} 