"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = Message;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const Card_1 = require("../Common/Card");
const Avatar_1 = require("@/components/Common/Avatar");
const Button_1 = require("../Common/Button");
function formatFileSize(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
function Message({ content, timestamp, sender, attachments = [], // Provide default empty array
status, error, isStreaming, isLastMessage, onRetry, onDelete, className }) {
    const isError = status === "error";
    const isSending = status === "sending";
    const [isVisible, setIsVisible] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex gap-3 p-4 transition-all duration-200", sender.isBot ? "bg-muted/50" : "bg-background", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"), children: [(0, jsx_runtime_1.jsx)("div", { className: "flex gap-4", children: (0, jsx_runtime_1.jsxs)(Avatar_1.Avatar, { className: (0, utils_1.cn)("h-8 w-8 transition-transform duration-200", sender.isBot && "bg-primary text-primary-foreground", isVisible ? "scale-100" : "scale-0"), children: [(0, jsx_runtime_1.jsx)(Avatar_1.AvatarImage, { src: sender.avatar, alt: sender.name }), (0, jsx_runtime_1.jsx)(Avatar_1.AvatarFallback, { children: sender.name[0] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: sender.name }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground", children: timestamp }), status && ((0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)("text-xs transition-colors duration-200", isError && "text-destructive", isSending && "text-muted-foreground animate-pulse"), children: isError ? "Failed to send" : isSending ? "Sending..." : "Sent" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm leading-relaxed whitespace-pre-wrap break-words", children: content }), attachments && attachments.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3", children: attachments.map((attachment, index) => ((0, jsx_runtime_1.jsx)(Card_1.Card, { className: (0, utils_1.cn)("overflow-hidden transition-all duration-200", isVisible
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-4", { "delay-100": index > 0 }), children: attachment.type === "image" ? ((0, jsx_runtime_1.jsx)("img", { src: attachment.url, alt: attachment.name, className: "aspect-video w-full object-cover", loading: "lazy" })) : ((0, jsx_runtime_1.jsx)(Card_1.CardContent, { className: "p-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0, jsx_runtime_1.jsx)("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }), (0, jsx_runtime_1.jsx)("polyline", { points: "13 2 13 9 20 9" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 truncate", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm truncate", children: attachment.name }), attachment.size && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-muted-foreground", children: formatFileSize(attachment.size) }))] })] }) })) }, attachment.id))) }))] }), isError && onRetry && ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex items-center gap-2 pt-2 transition-all duration-200", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"), children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "ghost", size: "sm", onClick: onRetry, className: "h-auto p-0 text-destructive hover:text-destructive", children: "Retry" }), onDelete && ((0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "ghost", size: "sm", onClick: onDelete, className: "h-auto p-0 text-muted-foreground hover:text-foreground", children: "Delete" }))] }))] })] }));
}
