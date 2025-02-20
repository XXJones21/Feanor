/**
 * Represents a file attachment in a chat message
 */
export interface FileAttachment {
    /** The name of the file */
    name: string;
    /** The path or URL to the file */
    path: string;
    /** The MIME type of the file */
    type: string;
    /** The size of the file in bytes */
    size: number;
}

/**
 * Represents a chat message
 */
export interface ChatMessage {
    /** Unique identifier for the message */
    id: string;
    /** The content of the message */
    content: string;
    /** The role of the message sender (e.g. 'user', 'assistant') */
    role: 'user' | 'assistant' | 'system';
    /** Optional file attachment */
    attachment?: FileAttachment;
    /** Timestamp when the message was created */
    timestamp: number;
    /** Whether the message is currently being streamed */
    isStreaming?: boolean;
    /** Whether there was an error processing this message */
    hasError?: boolean;
}

/**
 * Map of message roles to their display names
 */
export const MESSAGE_ROLES = {
    user: 'User',
    assistant: 'Assistant',
    system: 'System'
} as const;

/**
 * Map of message roles to their theme colors
 */
export const MESSAGE_COLORS = {
    user: 'blue',
    assistant: 'green',
    system: 'gray'
} as const; 