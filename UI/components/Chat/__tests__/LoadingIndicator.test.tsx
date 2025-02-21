import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingIndicator from '../LoadingIndicator';

// Mock the cn utility to avoid dependency on actual Tailwind classes
vi.mock('@/lib/utils', () => ({
    cn: (...inputs: string[]) => inputs.join(' '),
}));

describe('LoadingIndicator', () => {
    it('renders with default message', () => {
        render(<LoadingIndicator />);
        expect(screen.getByText('Loading...')).toBeDefined();
    });

    it('renders with custom message', () => {
        const message = 'Custom loading message';
        render(<LoadingIndicator message={message} />);
        expect(screen.getByText(message)).toBeDefined();
    });

    it('renders with dots animation', () => {
        const { container } = render(<LoadingIndicator showDots />);
        expect(container.firstChild).toBeDefined();
    });

    it('renders with bounce animation', () => {
        render(<LoadingIndicator showBounce />);
        const dots = [
            document.querySelector('.animate-bounce-delay-0'),
            document.querySelector('.animate-bounce-delay-200'),
            document.querySelector('.animate-bounce-delay-400')
        ];
        dots.forEach(dot => {
            expect(dot).toBeDefined();
        });
    });

    it('applies custom className', () => {
        const customClass = 'custom-class';
        const { container } = render(<LoadingIndicator className={customClass} />);
        const element = container.firstChild as HTMLElement;
        expect(element).toBeDefined();
        expect(element.className).toContain(customClass);
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<LoadingIndicator size="small" showDots />);
        let dots = document.querySelectorAll('.w-1\\.5');
        expect(dots.length).toBe(3);

        rerender(<LoadingIndicator size="medium" showDots />);
        dots = document.querySelectorAll('.w-2');
        expect(dots.length).toBe(3);

        rerender(<LoadingIndicator size="large" showDots />);
        dots = document.querySelectorAll('.w-2\\.5');
        expect(dots.length).toBe(3);
    });

    it('applies animation classes to dots', () => {
        render(<LoadingIndicator showDots />);
        const dots = document.querySelectorAll('[class*="animate-bounce-delay-"]');
        expect(dots.length).toBe(3);
        
        // Check specific animation delays
        expect(document.querySelector('.animate-bounce-delay-0')).toBeDefined();
        expect(document.querySelector('.animate-bounce-delay-200')).toBeDefined();
        expect(document.querySelector('.animate-bounce-delay-400')).toBeDefined();
    });
}); 