/**
 * Message Types
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Message status type - consolidating the values
 */
export type MessageStatus = 'sending' | 'sent' | 'error';

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
 * Base message interface with required fields
 */
export interface BaseMessage {
  /** Unique identifier for the message */
  id: string;
  /** The content of the message */
  content: string;
  /** The role of the message sender (e.g. 'user', 'assistant') */
  role: MessageRole;
  /** Timestamp when the message was created (Unix timestamp in milliseconds) */
  timestamp: number;
  /** The sender of the message */
  sender: User;
}

/**
 * Full message interface extending base with optional fields
 */
export interface Message extends BaseMessage {
  /** Status of the message */
  status: MessageStatus;
  /** Error information if status is 'error' */
  error?: MessageError;
  /** Whether the message is currently being streamed */
  isStreaming?: boolean;
  /** Attachments associated with the message */
  attachments?: Attachment[];
}

/**
 * Tool Types
 */

/**
 * Parameter type for tool inputs
 */
export interface ToolParameter {
  /** The type of the parameter (string, number, boolean, etc.) */
  type: string;
  /** Description of what the parameter does */
  description: string;
  /** Whether this parameter is required */
  required?: boolean;
  /** For array types, describes the items in the array */
  items?: {
    type: string;
    description?: string;
  };
  /** For object types, describes the properties of the object */
  properties?: Record<string, ToolParameter>;
  /** Default value for the parameter */
  default?: unknown;
  /** Enum values for string parameters */
  enum?: string[];
}

/**
 * Tool configuration interface
 */
export interface Tool {
  /** Unique identifier for the tool */
  id: string;
  /** Display name of the tool */
  name: string;
  /** Optional description of what the tool does */
  description?: string;
  /** Icon component or element to display */
  icon: React.ReactNode;
  /** Whether the tool is currently active */
  isActive?: boolean;
  /** Tool parameters configuration */
  parameters: {
    /** Parameter definitions keyed by name */
    properties: Record<string, ToolParameter>;
    /** Required parameter names */
    required?: string[];
  };
  /** Component to render for the tool */
  component?: string;
  /** Whether the tool requires user confirmation */
  requiresConfirmation?: boolean;
}

/**
 * Tool execution request interface
 */
export interface ToolExecutionRequest {
  /** Name of the tool to execute */
  tool: string;
  /** Parameters to pass to the tool */
  params: Record<string, unknown>;
}

/**
 * Tool execution response interface
 */
export interface ToolExecutionResponse {
  /** Title of the response */
  title?: string;
  /** Response text content */
  text?: string;
  /** Related links */
  links?: string[];
  /** Any error information */
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Tool context hook interface
 */
export interface ToolsContext {
  /** Available tools */
  tools: Tool[];
  /** Currently selected tool */
  selectedTool: Tool | null;
  /** Execute a tool by its name */
  executeToolByName: (name: string, params: Record<string, unknown>) => Promise<ToolExecutionResponse>;
  /** Select a tool */
  selectTool: (toolId: string) => void;
  /** Clear the selected tool */
  clearSelectedTool: () => void;
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

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isBot?: boolean;
}

/**
 * Attachment interface
 */
export interface Attachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  size?: number;
}

/**
 * Chat session interface
 */
export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: string;
  messages: Message[];
  isActive?: boolean;
}

/**
 * Chat group interface
 */
export interface ChatGroup {
  title: string;
  sessions: ChatSession[];
  isCollapsed?: boolean;
} 