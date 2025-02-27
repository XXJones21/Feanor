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
exports.Checkbox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const Checkbox = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-5 items-center", children: (0, jsx_runtime_1.jsx)("input", { type: "checkbox", className: (0, utils_1.cn)("h-4 w-4 rounded border border-input bg-background text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", error && "border-destructive focus:ring-destructive", className), ref: ref, ...props }) }), label && ((0, jsx_runtime_1.jsx)("div", { className: "ml-3 text-sm leading-6", children: (0, jsx_runtime_1.jsx)("label", { htmlFor: props.id, className: (0, utils_1.cn)("font-medium text-foreground", props.disabled && "cursor-not-allowed opacity-50"), children: label }) })), error && ((0, jsx_runtime_1.jsx)("span", { className: "absolute -bottom-5 left-0 text-xs text-destructive", children: error }))] }));
});
exports.Checkbox = Checkbox;
Checkbox.displayName = "Checkbox";
