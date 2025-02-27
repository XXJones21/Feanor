"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatList = ChatList;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("@/lib/utils");
function ChatGroup({ title, sessions, isCollapsed, onToggleCollapse }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "py-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: onToggleCollapse, className: "flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground", children: [(0, jsx_runtime_1.jsx)("span", { children: title }), (0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: (0, utils_1.cn)("transition-transform", isCollapsed ? "-rotate-90" : "rotate-0"), children: (0, jsx_runtime_1.jsx)("path", { d: "m6 9 6 6 6-6" }) })] }), !isCollapsed && ((0, jsx_runtime_1.jsx)("div", { className: "space-y-1", children: sessions.map((session) => ((0, jsx_runtime_1.jsx)(ChatSessionItem, { ...session }, session.id))) }))] }));
}
function ChatSessionItem({ id, title, lastMessage, timestamp, isActive, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex flex-col gap-1 px-4 py-2 cursor-pointer", "hover:bg-accent hover:text-accent-foreground", isActive && "bg-accent text-accent-foreground"), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium truncate", children: title }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground", children: timestamp })] }), lastMessage && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground truncate", children: lastMessage }))] }));
}
function ChatList({ groups, onSelectSession, activeSessionId, className, }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("py-2", className), children: groups.map((group, index) => ((0, jsx_runtime_1.jsx)(ChatGroup, { ...group }, index))) }));
}
