"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const utils_1 = require("@/lib/utils");
const Message_1 = __importDefault(require("./Message"));
const LoadingIndicator_1 = __importDefault(require("./LoadingIndicator"));
const scroll_1 = require("@/lib/chat/scroll");
const message_1 = require("@/lib/chat/message");
const MessageList = ({ messages, isLoading = false, onRetry, className, onLoadMore }) => {
    const containerRef = (0, react_1.useRef)(null);
    const bottomRef = (0, react_1.useRef)(null);
    const lastMessageRef = (0, react_1.useRef)(null);
    // Set up infinite scroll if onLoadMore is provided
    (0, react_1.useEffect)(() => {
        if (onLoadMore && containerRef.current) {
            const observer = (0, scroll_1.createInfiniteScroll)(containerRef.current, onLoadMore, { rootMargin: '200px' });
            return () => observer.disconnect();
        }
    }, [onLoadMore]);
    // Handle auto-scrolling for new messages
    (0, react_1.useEffect)(() => {
        if (containerRef.current && lastMessageRef.current) {
            const cleanup = (0, scroll_1.handleStreamingScroll)(containerRef.current, lastMessageRef.current);
            return cleanup;
        }
    }, [messages]);
    // Group messages by date
    const groupedMessages = (0, message_1.groupMessagesByDate)(messages);
    const renderMessage = (message, index) => {
        const hasError = message.status === 'error';
        const isLast = index === messages.length - 1;
        return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, ref: isLast ? lastMessageRef : undefined, children: [(0, jsx_runtime_1.jsx)(Message_1.default, { ...message }), hasError && message.error?.retryable && onRetry && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-end gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm text-error bg-error/10 px-4 py-2 rounded-lg", children: "Failed to send message" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onRetry(index), className: (0, utils_1.cn)("px-4 py-2 rounded-lg", "bg-primary text-primary-foreground", "text-sm font-medium", "hover:bg-primary/90 transition-colors"), children: "Retry" })] }))] }, message.id || index));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { ref: containerRef, className: (0, utils_1.cn)("flex-1 overflow-y-auto p-4 scroll-smooth", className), children: [(0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: Object.entries(groupedMessages).map(([date, dateMessages]) => ((0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "sticky top-0 z-10 flex justify-center mb-4", children: (0, jsx_runtime_1.jsx)("span", { className: "px-3 py-1 text-xs bg-muted rounded-full", children: date }) }), dateMessages.map((message, index) => renderMessage(message, index))] }, date))) }), isLoading && (0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, {}), (0, jsx_runtime_1.jsx)("div", { ref: bottomRef })] }));
};
exports.default = MessageList;
