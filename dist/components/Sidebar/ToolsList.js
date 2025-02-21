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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const framer_motion_1 = require("framer-motion");
const ToolsContainer = styled_components_1.default.div `
    border-top: 1px solid ${props => props.theme.colors.border};
    padding: 1rem;
`;
const ToolsHeader = styled_components_1.default.div `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.textLight};
    font-size: 0.9rem;
    cursor: pointer;
`;
const ToolsListContainer = (0, styled_components_1.default)(framer_motion_1.motion.div) `
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;
const ToolItem = (0, styled_components_1.default)(framer_motion_1.motion.div) `
    padding: 0.75rem;
    border-radius: 8px;
    background: ${props => props.theme.colors.backgroundLight};
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
        background: ${props => props.theme.colors.primaryLight};
    }

    .tool-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .tool-description {
        font-size: 0.8rem;
        color: ${props => props.theme.colors.textLight};
    }
`;
const ToolsList = ({ tools, onToolSelect }) => {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(true);
    return ((0, jsx_runtime_1.jsxs)(ToolsContainer, { children: [(0, jsx_runtime_1.jsxs)(ToolsHeader, { onClick: () => setIsExpanded(!isExpanded), children: [(0, jsx_runtime_1.jsx)("span", { children: "Available Tools" }), (0, jsx_runtime_1.jsx)("span", { children: isExpanded ? '▼' : '▶' })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: isExpanded && ((0, jsx_runtime_1.jsx)(ToolsListContainer, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, children: tools.map(tool => ((0, jsx_runtime_1.jsxs)(ToolItem, { onClick: () => onToolSelect(tool.name), whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "tool-name", children: tool.name }), (0, jsx_runtime_1.jsx)("div", { className: "tool-description", children: tool.description })] }, tool.name))) })) })] }));
};
exports.default = ToolsList;
