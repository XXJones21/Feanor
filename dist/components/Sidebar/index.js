"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("@/lib/utils");
const Button_1 = require("../Common/Button");
const ChatList_1 = require("./ChatList");
const NewChatButton_1 = require("./NewChatButton");
const ToolsList_1 = require("./ToolsList");
function Sidebar({ className, currentChatId, onChatSelect, onNewChat, isCollapsed = false, onToggleCollapse, ...props }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("relative flex flex-col h-screen bg-background border-r transition-all duration-300 ease-in-out", isCollapsed ? "w-16" : "w-64", "md:relative md:w-auto", className), ...props, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border-b", children: [(0, jsx_runtime_1.jsx)("h2", { className: (0, utils_1.cn)("font-semibold", isCollapsed && "hidden"), children: "Chat Sessions" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "ghost", size: "icon", onClick: onToggleCollapse, className: "md:hidden", children: (0, jsx_runtime_1.jsx)(CollapseIcon, { isCollapsed: isCollapsed }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4", children: (0, jsx_runtime_1.jsx)(NewChatButton_1.NewChatButton, { onClick: onNewChat, isCollapsed: isCollapsed }) }), (0, jsx_runtime_1.jsx)(ChatList_1.ChatList, { groups: [], onSelectSession: onChatSelect, activeSessionId: currentChatId, className: "mb-4" }), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-2 border-t", children: [(0, jsx_runtime_1.jsx)("h3", { className: (0, utils_1.cn)("text-sm font-medium text-muted-foreground mb-2", isCollapsed && "hidden"), children: "Tools" }), (0, jsx_runtime_1.jsx)(ToolsList_1.ToolsList, { onSelectTool: () => { }, isCollapsed: isCollapsed })] })] })] }));
}
function CollapseIcon({ isCollapsed }) {
    return ((0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "transition-transform", style: { transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }, children: (0, jsx_runtime_1.jsx)("path", { d: "M15 18l-6-6 6-6" }) }));
}
