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
exports.ToolsList = ToolsList;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const useTools_1 = require("@/hooks/useTools");
function ToolsList({ onSelectTool, isCollapsed = false, className, }) {
    const { tools, selectedTool, selectTool } = (0, useTools_1.useTools)();
    const handleToolClick = React.useCallback((tool) => {
        selectTool(tool.id);
        onSelectTool(tool.id);
    }, [selectTool, onSelectTool]);
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("py-2 space-y-1", className), children: tools.map((tool) => ((0, jsx_runtime_1.jsx)(ToolItem, { tool: tool, isCollapsed: isCollapsed, isActive: selectedTool?.id === tool.id, onClick: () => handleToolClick(tool) }, tool.id))) }));
}
function ToolItem({ tool, isCollapsed, isActive, onClick, }) {
    return ((0, jsx_runtime_1.jsxs)("button", { onClick: onClick, className: (0, utils_1.cn)("flex items-center w-full px-4 py-2 text-sm transition-colors", "hover:bg-accent hover:text-accent-foreground", isActive && "bg-accent text-accent-foreground", isCollapsed ? "justify-center" : "gap-3"), children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: tool.icon }), !isCollapsed && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-start text-left", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: tool.name }), tool.description && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-muted-foreground", children: tool.description }))] }))] }));
}
