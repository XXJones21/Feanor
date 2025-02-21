"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimestamp = formatTimestamp;
exports.formatMessage = formatMessage;
exports.groupMessagesByDate = groupMessagesByDate;
exports.hasCodeBlocks = hasCodeBlocks;
exports.getRoleIconClass = getRoleIconClass;
/**
 * Formats a timestamp into a human-readable string
 */
function formatTimestamp(timestamp, options = {}) {
    const { includeDate = false, includeSeconds = false } = options;
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const timeOptions = {
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
function formatMessage(message, options = {}) {
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
function groupMessagesByDate(messages) {
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
    }, {});
}
/**
 * Checks if a message contains code blocks
 */
function hasCodeBlocks(message) {
    return /```[\s\S]*?```/g.test(message.content);
}
/**
 * Gets the role icon class for a message
 */
function getRoleIconClass(role) {
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
