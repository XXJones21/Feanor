"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const framer_motion_1 = require("framer-motion");
const ChatListContainer = styled_components_1.default.div `
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
`;
const ChatItem = (0, styled_components_1.default)(framer_motion_1.motion.div) `
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    border-radius: 8px;
    cursor: pointer;
    background: ${props => props.isActive ? props.theme.colors.primaryLight : 'transparent'};
    color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.text};
    
    &:hover {
        background: ${props => props.isActive ? props.theme.colors.primaryLight : props.theme.colors.backgroundLight};
    }

    .chat-title {
        font-weight: ${props => props.isActive ? '600' : '400'};
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }

    .chat-preview {
        font-size: 0.8rem;
        color: ${props => props.theme.colors.textLight};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;
const EmptyState = styled_components_1.default.div `
    text-align: center;
    padding: 2rem;
    color: ${props => props.theme.colors.textLight};
`;
const ChatList = ({ chats, currentChatId, onChatSelect }) => {
    if (!chats || chats.length === 0) {
        return ((0, jsx_runtime_1.jsx)(EmptyState, { children: "No chats yet. Start a new conversation!" }));
    }
    return ((0, jsx_runtime_1.jsx)(ChatListContainer, { children: (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: chats.map(chat => ((0, jsx_runtime_1.jsxs)(ChatItem, { isActive: chat.id === currentChatId, onClick: () => onChatSelect(chat.id), initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "chat-title", children: chat.title || `Chat ${new Date(parseInt(chat.id)).toLocaleDateString()}` }), (0, jsx_runtime_1.jsx)("div", { className: "chat-preview", children: chat.lastMessage || 'No messages yet' })] }, chat.id))) }) }));
};
exports.default = ChatList;
