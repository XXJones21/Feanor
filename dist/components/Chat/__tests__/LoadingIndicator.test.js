"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const LoadingIndicator_1 = __importDefault(require("../LoadingIndicator"));
// Mock the cn utility to avoid dependency on actual Tailwind classes
vitest_1.vi.mock('@/lib/utils', () => ({
    cn: (...inputs) => inputs.join(' '),
}));
(0, vitest_1.describe)('LoadingIndicator', () => {
    (0, vitest_1.it)('renders with default message', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, {}));
        (0, vitest_1.expect)(react_1.screen.getByText('Loading...')).toBeDefined();
    });
    (0, vitest_1.it)('renders with custom message', () => {
        const message = 'Custom loading message';
        (0, react_1.render)((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { message: message }));
        (0, vitest_1.expect)(react_1.screen.getByText(message)).toBeDefined();
    });
    (0, vitest_1.it)('renders with dots animation', () => {
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { showDots: true }));
        (0, vitest_1.expect)(container.firstChild).toBeDefined();
    });
    (0, vitest_1.it)('renders with bounce animation', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { showBounce: true }));
        const dots = [
            document.querySelector('.animate-bounce-delay-0'),
            document.querySelector('.animate-bounce-delay-200'),
            document.querySelector('.animate-bounce-delay-400')
        ];
        dots.forEach(dot => {
            (0, vitest_1.expect)(dot).toBeDefined();
        });
    });
    (0, vitest_1.it)('applies custom className', () => {
        const customClass = 'custom-class';
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { className: customClass }));
        const element = container.firstChild;
        (0, vitest_1.expect)(element).toBeDefined();
        (0, vitest_1.expect)(element.className).toContain(customClass);
    });
    (0, vitest_1.it)('renders with different sizes', () => {
        const { rerender } = (0, react_1.render)((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { size: "small", showDots: true }));
        let dots = document.querySelectorAll('.w-1\\.5');
        (0, vitest_1.expect)(dots.length).toBe(3);
        rerender((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { size: "medium", showDots: true }));
        dots = document.querySelectorAll('.w-2');
        (0, vitest_1.expect)(dots.length).toBe(3);
        rerender((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { size: "large", showDots: true }));
        dots = document.querySelectorAll('.w-2\\.5');
        (0, vitest_1.expect)(dots.length).toBe(3);
    });
    (0, vitest_1.it)('applies animation classes to dots', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(LoadingIndicator_1.default, { showDots: true }));
        const dots = document.querySelectorAll('[class*="animate-bounce-delay-"]');
        (0, vitest_1.expect)(dots.length).toBe(3);
        // Check specific animation delays
        (0, vitest_1.expect)(document.querySelector('.animate-bounce-delay-0')).toBeDefined();
        (0, vitest_1.expect)(document.querySelector('.animate-bounce-delay-200')).toBeDefined();
        (0, vitest_1.expect)(document.querySelector('.animate-bounce-delay-400')).toBeDefined();
    });
});
