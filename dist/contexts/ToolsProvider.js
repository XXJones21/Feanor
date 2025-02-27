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
exports.useToolsContext = useToolsContext;
exports.ToolsProvider = ToolsProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const useTools_1 = require("@/hooks/useTools");
const ToolsContext = React.createContext(null);
/**
 * Hook to use the tools context
 */
function useToolsContext() {
    const context = React.useContext(ToolsContext);
    if (!context) {
        throw new Error('useToolsContext must be used within a ToolsProvider');
    }
    return context;
}
/**
 * Provider component for tools functionality
 */
function ToolsProvider({ children }) {
    const toolsContext = (0, useTools_1.useTools)();
    return ((0, jsx_runtime_1.jsx)(ToolsContext.Provider, { value: toolsContext, children: children }));
}
