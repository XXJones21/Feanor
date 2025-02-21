"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const ErrorContainer = styled_components_1.default.div `
    padding: 20px;
    margin: 20px;
    border-radius: 8px;
    background-color: ${props => props.theme.colors.errorBackground || '#FFF3F3'};
    border: 1px solid ${props => props.theme.colors.error || '#FF0000'};
`;
const ErrorHeading = styled_components_1.default.h3 `
    color: ${props => props.theme.colors.error || '#FF0000'};
    margin-bottom: 10px;
`;
const ErrorMessage = styled_components_1.default.p `
    color: ${props => props.theme.colors.text};
    margin-bottom: 15px;
`;
const ReloadButton = styled_components_1.default.button `
    padding: 8px 16px;
    background: ${props => props.theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background: ${props => props.theme.colors.primaryDark};
    }
`;
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // Log the error to your error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }
    handleReload = () => {
        window.location.reload();
    };
    render() {
        if (this.state.hasError) {
            return ((0, jsx_runtime_1.jsxs)(ErrorContainer, { children: [(0, jsx_runtime_1.jsx)(ErrorHeading, { children: "Something went wrong" }), (0, jsx_runtime_1.jsx)(ErrorMessage, { children: this.state.error && this.state.error.toString() }), (0, jsx_runtime_1.jsx)(ReloadButton, { onClick: this.handleReload, children: "Reload Application" })] }));
        }
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
