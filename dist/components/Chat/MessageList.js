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
exports.MessageList = MessageList;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const Message_1 = require("./Message");
const Spinner_1 = require("../Common/Loading/Spinner");
function MessageList({ messages, isLoading, onRetry, onDelete, className, }) {
    const messagesEndRef = React.useRef(null);
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };
    React.useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex flex-col flex-1 overflow-y-auto bg-background", className), children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [messages.map((message, index) => ((0, jsx_runtime_1.jsx)(Message_1.Message, { ...message, timestamp: formatTimestamp(message.timestamp), isLastMessage: index === messages.length - 1, onRetry: message.status === 'error' ? () => onRetry?.(message.id) : undefined, onDelete: message.status === 'error' ? () => onDelete?.(message.id) : undefined }, message.id))), isLoading && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center p-4", children: (0, jsx_runtime_1.jsx)(Spinner_1.Spinner, { size: "sm" }) })), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] })] }));
}
