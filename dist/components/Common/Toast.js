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
exports.ToastDescription = exports.ToastTitle = exports.Toast = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const Toast = React.forwardRef(({ className, variant = "default", children, onClose, ...props }, ref) => {
    return ((0, jsx_runtime_1.jsxs)("div", { ref: ref, className: (0, utils_1.cn)("pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all", {
            "bg-background text-foreground": variant === "default",
            "destructive group border-destructive bg-destructive text-destructive-foreground": variant === "destructive",
            "bg-green-500 text-white": variant === "success",
        }, className), ...props, children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1", children: children }), onClose && ((0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: (0, utils_1.cn)("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100", {
                    "text-red-300 hover:text-red-50": variant === "destructive",
                    "text-green-300 hover:text-green-50": variant === "success",
                }), children: (0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0, jsx_runtime_1.jsx)("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), (0, jsx_runtime_1.jsx)("line", { x1: "6", y1: "6", x2: "18", y2: "18" })] }) }))] }));
});
exports.Toast = Toast;
Toast.displayName = "Toast";
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => ((0, jsx_runtime_1.jsx)("h3", { ref: ref, className: (0, utils_1.cn)("text-sm font-medium", className), ...props })));
exports.ToastTitle = ToastTitle;
ToastTitle.displayName = "ToastTitle";
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => ((0, jsx_runtime_1.jsx)("div", { ref: ref, className: (0, utils_1.cn)("text-sm opacity-90", className), ...props })));
exports.ToastDescription = ToastDescription;
ToastDescription.displayName = "ToastDescription";
