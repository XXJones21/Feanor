"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ParameterInput = ({ name, info, value, onChange }) => {
    const handleBrowsePath = async () => {
        try {
            const path = await window.electron.showOpenDialog();
            if (path) {
                onChange(path);
            }
        }
        catch (error) {
            console.error('Error selecting file:', error);
        }
    };
    const isPathInput = info.description.toLowerCase().includes('path') ||
        info.description.toLowerCase().includes('file') ||
        info.description.toLowerCase().includes('directory');
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-foreground mb-1", children: name }), (0, jsx_runtime_1.jsxs)("div", { className: `flex ${isPathInput ? 'gap-2' : ''}`, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: value, onChange: (e) => onChange(e.target.value), placeholder: info.description, className: "flex-1 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" }), isPathInput && ((0, jsx_runtime_1.jsx)("button", { onClick: handleBrowsePath, className: "px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90", children: "Browse..." }))] }), info.description && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-muted-foreground", children: info.description }))] }));
};
const ParameterDialog = ({ tool, onConfirm, onCancel, isOpen }) => {
    const [parameters, setParameters] = (0, react_1.useState)({});
    const dialogRef = (0, react_1.useRef)(null);
    // Reset parameters when tool changes
    (0, react_1.useEffect)(() => {
        if (tool) {
            const initialParams = {};
            Object.keys(tool.parameters.properties).forEach(name => {
                initialParams[name] = '';
            });
            setParameters(initialParams);
        }
    }, [tool]);
    // Handle click outside dialog
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target)) {
                onCancel();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onCancel]);
    const handleParameterChange = (0, react_1.useCallback)((name, value) => {
        setParameters(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);
    const handleConfirm = (0, react_1.useCallback)(() => {
        onConfirm(parameters);
    }, [parameters, onConfirm]);
    if (!isOpen || !tool)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { ref: dialogRef, className: "bg-card w-full max-w-lg rounded-lg shadow-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-xl font-semibold mb-4", children: ["Use ", tool.name] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: Object.entries(tool.parameters.properties).map(([name, info]) => ((0, jsx_runtime_1.jsx)(ParameterInput, { name: name, info: info, value: parameters[name] || '', onChange: (value) => handleParameterChange(name, value) }, name))) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 flex justify-end space-x-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onCancel, className: "px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleConfirm, className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90", children: "OK" })] })] }) }) }));
};
exports.default = ParameterDialog;
