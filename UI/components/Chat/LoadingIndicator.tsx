import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
    /**
     * The size of the loading indicator dots
     * @default 'medium'
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Optional message to display below the loading indicator
     */
    message?: string;
    /**
     * Optional className for custom styling
     */
    className?: string;
}

const sizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-2.5 h-2.5'
} as const;

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    size = 'medium',
    message,
    className
}) => {
    const dotSize = sizeClasses[size];
    
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-4 m-4",
            className
        )}>
            <div className="flex justify-center items-center space-x-1">
                <div
                    className={cn(
                        dotSize,
                        "bg-primary rounded-full",
                        "animate-bounce-delay-0"
                    )}
                />
                <div
                    className={cn(
                        dotSize,
                        "bg-primary rounded-full",
                        "animate-bounce-delay-200"
                    )}
                />
                <div
                    className={cn(
                        dotSize,
                        "bg-primary rounded-full",
                        "animate-bounce-delay-400"
                    )}
                />
            </div>
            {message && (
                <span className="mt-2 text-sm text-muted-foreground">
                    {message}
                </span>
            )}
        </div>
    );
};

export default LoadingIndicator; 