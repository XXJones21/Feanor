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
exports.useTools = useTools;
const React = __importStar(require("react"));
const electron_1 = require("@/types/electron");
/**
 * Hook for managing tools state and execution
 */
function useTools() {
    const [tools, setTools] = React.useState([]);
    const [selectedTool, setSelectedTool] = React.useState(null);
    // Load tools configuration
    React.useEffect(() => {
        const loadTools = async () => {
            try {
                const config = await window.electron.invoke(electron_1.IpcChannels.GET_TOOLS_CONFIG);
                setTools(config.tools);
            }
            catch (error) {
                console.error('Failed to load tools configuration:', error);
                setTools([]);
            }
        };
        loadTools();
    }, []);
    const executeToolByName = React.useCallback(async (name, params) => {
        try {
            const response = await window.electron.invoke(electron_1.IpcChannels.EXECUTE_TOOL, {
                tool: name,
                params,
            });
            return response;
        }
        catch (error) {
            console.error(`Error executing tool ${name}:`, error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    code: 'EXECUTION_ERROR',
                },
            };
        }
    }, []);
    const selectTool = React.useCallback((toolId) => {
        const tool = tools.find((t) => t.id === toolId);
        setSelectedTool(tool || null);
    }, [tools]);
    const clearSelectedTool = React.useCallback(() => {
        setSelectedTool(null);
    }, []);
    return {
        tools,
        selectedTool,
        executeToolByName,
        selectTool,
        clearSelectedTool,
    };
}
