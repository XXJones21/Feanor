"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const utils_1 = require("@/lib/utils");
const message_1 = require("@/lib/chat/message");
/**
 * InputArea component for sending messages and handling file attachments
 */
const InputArea = ({ onSendMessage, isLoading = false, className, maxLength }) => {
    const [message, setMessage] = (0, react_1.useState)('');
    const [attachment, setAttachment] = (0, react_1.useState)(null);
    const textAreaRef = (0, react_1.useRef)(null);
    // Auto-resize textarea
    const adjustTextAreaHeight = (0, react_1.useCallback)(() => {
        const textarea = textAreaRef.current;
        if (!textarea)
            return;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, []);
    (0, react_1.useEffect)(() => {
        adjustTextAreaHeight();
    }, [message, adjustTextAreaHeight]);
    const handleKeyPress = (0, react_1.useCallback)((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    }, []);
    const handleChange = (0, react_1.useCallback)((e) => {
        const value = e.target.value;
        if (maxLength && value.length > maxLength)
            return;
        setMessage(value);
    }, [maxLength]);
    const handleSend = (0, react_1.useCallback)(async () => {
        const trimmedMessage = (0, message_1.formatMessage)({
            content: message,
            role: 'user',
            id: '',
            timestamp: Date.now(),
            status: 'complete'
        }, {
            formatNewlines: false,
            stripMarkdown: false
        });
        if (trimmedMessage || attachment) {
            try {
                await onSendMessage(trimmedMessage, attachment);
                setMessage('');
                setAttachment(null);
                if (textAreaRef.current) {
                    textAreaRef.current.style.height = 'auto';
                }
            }
            catch (error) {
                console.error('Failed to send message:', error);
                // You might want to show an error toast here
            }
        }
    }, [message, attachment, onSendMessage]);
    const handlePaste = (0, react_1.useCallback)((e) => {
        const items = e.clipboardData?.items;
        if (!items)
            return;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    setAttachment({
                        name: file.name,
                        path: URL.createObjectURL(file),
                        type: file.type,
                        size: file.size
                    });
                }
                break;
            }
        }
    }, []);
    const handleDrop = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setAttachment({
                name: file.name,
                path: URL.createObjectURL(file),
                type: file.type,
                size: file.size
            });
        }
    }, []);
    const handleRemoveAttachment = (0, react_1.useCallback)(() => {
        if (attachment?.path) {
            URL.revokeObjectURL(attachment.path);
        }
        setAttachment(null);
    }, [attachment]);
    // Cleanup object URLs on unmount
    (0, react_1.useEffect)(() => {
        return () => {
            if (attachment?.path) {
                URL.revokeObjectURL(attachment.path);
            }
        };
    }, [attachment]);
    const charCount = message.length;
    const isOverLimit = maxLength ? charCount > maxLength : false;
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("border-t border-border bg-background p-4", className), children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-[1200px] mx-auto", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: attachment && ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, className: "flex items-center gap-2 p-2 mb-2 bg-muted rounded-lg", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-muted-foreground", children: ["\uD83D\uDCCE ", attachment.name] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleRemoveAttachment, className: "p-1 hover:bg-background rounded-full transition-colors", "aria-label": "Remove attachment", children: "\u00D7" })] })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-end gap-4", children: [(0, jsx_runtime_1.jsx)("textarea", { ref: textAreaRef, value: message, onChange: handleChange, onKeyPress: handleKeyPress, onPaste: handlePaste, onDrop: handleDrop, onDragOver: (e) => e.preventDefault(), placeholder: "Type a message...", rows: 1, disabled: isLoading, className: (0, utils_1.cn)("flex-1 min-h-[24px] max-h-[200px] p-3", "rounded-xl border bg-background", "text-sm leading-relaxed resize-none", "transition-all duration-200", "focus:outline-none focus:ring-2 focus:ring-primary", "disabled:opacity-50 disabled:cursor-not-allowed", isOverLimit && "border-error focus:ring-error") }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.button, { whileTap: { scale: 0.95 }, disabled: isLoading || (!message.trim() && !attachment) || isOverLimit, onClick: () => void handleSend(), className: (0, utils_1.cn)("px-6 py-3 rounded-xl", "bg-primary text-primary-foreground", "font-semibold text-sm", "transition-colors duration-200", "hover:bg-primary/90", "disabled:bg-muted disabled:cursor-not-allowed"), children: isLoading ? 'Sending...' : 'Send' })] }), maxLength && ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("text-xs text-right", isOverLimit ? "text-error" : "text-muted-foreground"), children: [charCount, "/", maxLength, " characters"] }))] })] }) }));
};
exports.default = InputArea;
