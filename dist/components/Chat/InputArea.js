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
exports.InputArea = InputArea;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const Button_1 = require("../Common/Button");
const Textarea_1 = require("../Common/Form/Textarea");
function InputArea({ onSend, isLoading, placeholder = "Type a message...", className, maxAttachments = 5, }) {
    const [content, setContent] = React.useState("");
    const [attachments, setAttachments] = React.useState([]);
    const [isAttaching, setIsAttaching] = React.useState(false);
    const fileInputRef = React.useRef(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (content.trim() || attachments.length > 0) {
            try {
                await onSend(content, attachments.map((a) => a.file));
                setContent("");
                setAttachments([]);
            }
            catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (attachments.length + files.length > maxAttachments) {
            // Show error toast or message
            return;
        }
        setIsAttaching(true);
        const newAttachments = await Promise.all(files.map(async (file) => {
            const attachment = {
                id: Math.random().toString(36).slice(2),
                file,
            };
            if (file.type.startsWith("image/")) {
                attachment.previewUrl = URL.createObjectURL(file);
            }
            return attachment;
        }));
        setAttachments((prev) => [...prev, ...newAttachments]);
        setIsAttaching(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    const removeAttachment = (id) => {
        setAttachments((prev) => {
            const attachment = prev.find((a) => a.id === id);
            if (attachment?.previewUrl) {
                URL.revokeObjectURL(attachment.previewUrl);
            }
            return prev.filter((a) => a.id !== id);
        });
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: (0, utils_1.cn)("p-4 border-t transition-transform duration-200", isLoading && "opacity-80", className), children: [attachments.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("flex gap-2 mb-4 overflow-x-auto pb-2 transition-all duration-200", isAttaching ? "opacity-50" : "opacity-100"), children: attachments.map((attachment, index) => ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("relative flex-shrink-0 group transition-all duration-200", "animate-scale-in", { "delay-100": index > 0 }), children: [attachment.previewUrl ? ((0, jsx_runtime_1.jsx)("img", { src: attachment.previewUrl, alt: attachment.file.name, className: "h-20 w-20 object-cover rounded-md" })) : ((0, jsx_runtime_1.jsx)("div", { className: "h-20 w-20 flex items-center justify-center bg-muted rounded-md", children: (0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0, jsx_runtime_1.jsx)("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }), (0, jsx_runtime_1.jsx)("polyline", { points: "13 2 13 9 20 9" })] }) })), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => removeAttachment(attachment.id), className: (0, utils_1.cn)("absolute -top-2 -right-2 h-6 w-6", "bg-destructive text-destructive-foreground rounded-full", "flex items-center justify-center", "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100", "transition-all duration-200"), children: "\u00D7" })] }, attachment.id))) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)(Textarea_1.Textarea, { value: content, onChange: (e) => setContent(e.target.value), onKeyDown: handleKeyDown, placeholder: placeholder, className: (0, utils_1.cn)("min-h-[60px] max-h-[200px] transition-all duration-200", isLoading && "opacity-50"), disabled: isLoading }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { type: "button", onClick: () => fileInputRef.current?.click(), disabled: isLoading || attachments.length >= maxAttachments, className: (0, utils_1.cn)("h-10 w-10 p-0 transition-all duration-200", isAttaching && "animate-pulse"), children: (0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "transition-transform duration-200 hover:scale-110", children: (0, jsx_runtime_1.jsx)("path", { d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" }) }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { type: "submit", disabled: isLoading || (!content.trim() && attachments.length === 0), className: "h-10 w-10 p-0 transition-all duration-200", children: (0, jsx_runtime_1.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "transition-transform duration-200 hover:scale-110", children: [(0, jsx_runtime_1.jsx)("line", { x1: "22", y1: "2", x2: "11", y2: "13" }), (0, jsx_runtime_1.jsx)("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })] }) })] })] }), (0, jsx_runtime_1.jsx)("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/*,.pdf,.doc,.docx,.txt", className: "hidden", onChange: handleFileSelect })] }));
}
