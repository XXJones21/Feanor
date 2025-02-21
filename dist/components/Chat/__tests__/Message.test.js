"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const Message_1 = __importDefault(require("../Message"));
// Mock the cn utility
vitest_1.vi.mock('@/lib/utils', () => ({
    cn: (...inputs) => inputs.join(' '),
}));
// Mock react-markdown to avoid complex markdown rendering in tests
vitest_1.vi.mock('react-markdown', () => {
    return ({ children }) => (0, jsx_runtime_1.jsx)("div", { "data-testid": "markdown", children: children });
});
const defaultProps = {
    content: 'Test message',
    role: 'user',
    id: '1',
    timestamp: Date.now(),
    status: 'complete'
};
(0, vitest_1.describe)('Message', () => {
    (0, vitest_1.it)('renders message content', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps }));
        const content = react_1.screen.getByTestId('markdown');
        (0, vitest_1.expect)(content).toBeDefined();
        (0, vitest_1.expect)(content.textContent).toBe(defaultProps.content);
    });
    (0, vitest_1.it)('applies primary background for user messages', () => {
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps, role: "user" }));
        const messageWrapper = container.firstChild;
        const messageContent = messageWrapper.querySelector('div:nth-child(2)');
        (0, vitest_1.expect)(messageContent).toBeDefined();
        (0, vitest_1.expect)(messageContent.className).toContain('bg-primary');
    });
    (0, vitest_1.it)('applies secondary background for assistant messages', () => {
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps, role: "assistant" }));
        const messageWrapper = container.firstChild;
        const messageContent = messageWrapper.querySelector('div:nth-child(2)');
        (0, vitest_1.expect)(messageContent).toBeDefined();
        (0, vitest_1.expect)(messageContent.className).toContain('bg-card');
    });
    (0, vitest_1.it)('shows streaming indicator when isStreaming is true', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps, isStreaming: true }));
        const streamingIndicator = react_1.screen.queryByTestId('streaming-indicator');
        (0, vitest_1.expect)(streamingIndicator).toBeDefined();
    });
    (0, vitest_1.it)('updates content while streaming', () => {
        const { rerender } = (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps, isStreaming: true, content: "Processing query..." }));
        (0, vitest_1.expect)(react_1.screen.getByTestId('markdown').textContent).toBe('Processing query...');
        rerender((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps, isStreaming: false, content: "Here is your answer" }));
        (0, vitest_1.expect)(react_1.screen.getByTestId('markdown').textContent).toBe('Here is your answer');
    });
    (0, vitest_1.it)('applies custom className', () => {
        const customClass = 'test-class';
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps, className: customClass }));
        const element = container.firstChild;
        (0, vitest_1.expect)(element).toBeDefined();
        (0, vitest_1.expect)(element.className).toContain(customClass);
    });
    (0, vitest_1.it)('handles empty content', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps, content: "" }));
        (0, vitest_1.expect)(react_1.screen.getByTestId('markdown').textContent).toBe('');
    });
    (0, vitest_1.it)('applies animation class', () => {
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(Message_1.default, { ...defaultProps }));
        const element = container.firstChild;
        (0, vitest_1.expect)(element).toBeDefined();
        (0, vitest_1.expect)(element.className).toContain('animate-fade-in');
    });
});
