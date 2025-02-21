/**
 * Message Types
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Message status type
 */
export type MessageStatus = 'complete' | 'streaming' | 'error' | 'pending';

/**
 * Error details type
 */
export interface MessageError {
  /** Error message to display */
  message: string;
  /** Whether the error can be retried */
  retryable: boolean;
  /** Error code for categorization */
  code?: string;
}

/**
 * Represents a chat message
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** The content of the message */
  content: string;
  /** The role of the message sender (e.g. 'user', 'assistant') */
  role: MessageRole;
  /** Optional file attachment */
  attachment?: FileAttachment;
  /** Timestamp when the message was created (Unix timestamp in milliseconds) */
  timestamp: number;
  /** Whether the message is currently being streamed */
  isStreaming?: boolean;
  /** Status of the message */
  status: MessageStatus;
  /** Error information if status is 'error' */
  error?: MessageError;
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
export interface IpcRenderer {
  invoke(channel: 'save-chat', payload: { chatId: string; messages: Message[] }): Promise<void>;
  invoke(channel: 'load-chat', chatId: string): Promise<Message[]>;
}

// Re-export types from electron.ts
export type { ElectronBridge } from './electron'; 