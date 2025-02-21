"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("@/lib/utils");
const sizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-2.5 h-2.5'
};
const LoadingIndicator = ({ size = 'medium', message = 'Loading...', className = '', showDots = false, showBounce = false }) => {
    const dotSize = sizeClasses[size];
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex flex-col items-center justify-center p-4 m-4", className), children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center space-x-1", children: showDots && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)(dotSize, "bg-primary rounded-full", "animate-bounce-delay-0") }), (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)(dotSize, "bg-primary rounded-full", "animate-bounce-delay-200") }), (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)(dotSize, "bg-primary rounded-full", "animate-bounce-delay-400") })] })) }), message && ((0, jsx_runtime_1.jsx)("span", { className: "mt-2 text-sm text-muted-foreground", children: message }))] }));
};
exports.default = LoadingIndicator;
