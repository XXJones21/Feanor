import { type Message } from '@/types/chat';

interface TimeFormatOptions {
  includeDate?: boolean;
  includeSeconds?: boolean;
}

interface MessageFormatOptions {
  trimLength?: number;
  formatNewlines?: boolean;
  stripMarkdown?: boolean;
}

/**
 * Formats a timestamp into a human-readable string
 */
export function formatTimestamp(timestamp: number | Date, options: TimeFormatOptions = {}): string {
  const { includeDate = false, includeSeconds = false } = options;
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
  };
  
  if (includeDate) {
    return new Intl.DateTimeFormat('en-US', {
      ...timeOptions,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('en-US', timeOptions).format(date);
}

/**
 * Formats a message for display, with options for trimming and formatting
 */
export function formatMessage(message: Message, options: MessageFormatOptions = {}): string {
  const { trimLength, formatNewlines = true, stripMarkdown = false } = options;
  let content = message.content;
  
  // Strip markdown if requested
  if (stripMarkdown) {
    content = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/_(.+?)_/g, '$1') // Remove italics
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[(.+?)\]\(.+?\)/g, '$1'); // Remove links
  }
  
  // Format newlines
  if (formatNewlines) {
    content = content.replace(/\n/g, ' ');
  }
  
  // Trim if needed
  if (trimLength && content.length > trimLength) {
    content = `${content.substring(0, trimLength)}...`;
  }
  
  return content;
}

/**
 * Groups messages by date for display
 */
export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  return messages.reduce((groups, message) => {
    const date = new Date(message.timestamp);
    const dateKey = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
}

/**
 * Checks if a message contains code blocks
 */
export function hasCodeBlocks(message: Message): boolean {
  return /```[\s\S]*?```/g.test(message.content);
}

/**
 * Gets the role icon class for a message
 */
export function getRoleIconClass(role: Message['role']): string {
  switch (role) {
    case 'user':
      return 'i-lucide-user';
    case 'assistant':
      return 'i-lucide-bot';
    case 'system':
      return 'i-lucide-settings';
    default:
      return 'i-lucide-message-square';
  }
} 