import { FC } from 'react';

export interface TitleBarProps {
    title?: string;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;
}

declare const TitleBar: FC<TitleBarProps>;
export default TitleBar; 