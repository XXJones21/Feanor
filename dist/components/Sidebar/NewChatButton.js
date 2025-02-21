"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const framer_motion_1 = require("framer-motion");
const Button = (0, styled_components_1.default)(framer_motion_1.motion.button) `
    width: 90%;
    margin: 1rem auto;
    padding: 0.75rem;
    border-radius: 8px;
    border: none;
    background: ${props => props.theme.colors.primary};
    color: white;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: ${props => props.theme.colors.primaryDark};
    }
`;
const NewChatButton = ({ onClick }) => ((0, jsx_runtime_1.jsxs)(Button, { onClick: onClick, whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [(0, jsx_runtime_1.jsx)("span", { children: "+" }), (0, jsx_runtime_1.jsx)("span", { children: "New Chat" })] }));
exports.default = NewChatButton;
