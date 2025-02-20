import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingIndicator from '../LoadingIndicator';

// Mock the cn utility to avoid dependency on actual Tailwind classes
jest.mock('@/lib/utils', () => ({
    cn: (...inputs: string[]) => inputs.join(' '),
}));

describe('LoadingIndicator', () => {
    it('renders without crashing', () => {
        render(<LoadingIndicator />);
        // Should find three dots
        const dots = document.querySelectorAll('.bg-primary');
        expect(dots).toHaveLength(3);
    });

    it('displays message when provided', () => {
        const message = 'Loading your request...';
        render(<LoadingIndicator message={message} />);
        expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('applies different sizes correctly', () => {
        const { rerender } = render(<LoadingIndicator size="small" />);
        let dots = document.querySelectorAll('.w-1\\.5');
        expect(dots).toHaveLength(3);

        rerender(<LoadingIndicator size="medium" />);
        dots = document.querySelectorAll('.w-2');
        expect(dots).toHaveLength(3);

        rerender(<LoadingIndicator size="large" />);
        dots = document.querySelectorAll('.w-2\\.5');
        expect(dots).toHaveLength(3);
    });

    it('applies custom className when provided', () => {
        const customClass = 'custom-test-class';
        render(<LoadingIndicator className={customClass} />);
        const container = document.querySelector(`.${customClass}`);
        expect(container).toBeInTheDocument();
    });

    it('applies animation classes to dots', () => {
        render(<LoadingIndicator />);
        const dots = document.querySelectorAll('[class*="animate-bounce-delay-"]');
        expect(dots).toHaveLength(3);
        
        // Check specific animation delays
        expect(document.querySelector('.animate-bounce-delay-0')).toBeInTheDocument();
        expect(document.querySelector('.animate-bounce-delay-200')).toBeInTheDocument();
        expect(document.querySelector('.animate-bounce-delay-400')).toBeInTheDocument();
    });
}); 