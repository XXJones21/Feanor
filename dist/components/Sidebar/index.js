"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const NewChatButton_1 = __importDefault(require("./NewChatButton"));
const ChatList_1 = __importDefault(require("./ChatList"));
const ToolsList_1 = __importDefault(require("./ToolsList"));
const SidebarContainer = styled_components_1.default.div `
    background: ${props => props.theme.colors.sidebarBackground};
    border-right: 1px solid ${props => props.theme.colors.border};
    display: flex;
    flex-direction: column;
    height: 100%;
`;
const Sidebar = ({ currentChatId, onChatSelect, onNewChat, tools, onToolSelect }) => {
    return ((0, jsx_runtime_1.jsxs)(SidebarContainer, { children: [(0, jsx_runtime_1.jsx)(NewChatButton_1.default, { onClick: onNewChat }), (0, jsx_runtime_1.jsx)(ChatList_1.default, { currentChatId: currentChatId, onChatSelect: onChatSelect }), (0, jsx_runtime_1.jsx)(ToolsList_1.default, { tools: tools, onToolSelect: onToolSelect })] }));
};
exports.default = Sidebar;
