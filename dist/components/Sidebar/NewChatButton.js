"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewChatButton = NewChatButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("../Common/Button");
const utils_1 = require("@/lib/utils");
function NewChatButton({ className, isCollapsed = false, ...props }) {
    return ((0, jsx_runtime_1.jsxs)(Button_1.Button, { className: (0, utils_1.cn)("w-full justify-start gap-2", isCollapsed && "justify-center", className), ...props, children: [(0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 5v14M5 12h14" }) }), !isCollapsed && (0, jsx_runtime_1.jsx)("span", { children: "New Chat" })] }));
}
