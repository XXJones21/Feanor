import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tool, ToolParameter } from '../types/chat';
import { Button } from './Common/Button';

interface ParameterDialogProps {
    tool: Tool | null;
    onConfirm: (params: Record<string, string>) => void;
    onCancel: () => void;
    isOpen: boolean;
}

interface ParameterInputProps {
    name: string;
    info: ToolParameter;
    value: string;
    onChange: (value: string) => void;
}

const ParameterInput: React.FC<ParameterInputProps> = ({ name, info, value, onChange }) => {
    const handleBrowsePath = async () => {
        try {
            const path = await window.electron.showOpenDialog();
            if (path) {
                onChange(path);
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    };

    const isPathInput = info.description.toLowerCase().includes('path') || 
                       info.description.toLowerCase().includes('file') ||
                       info.description.toLowerCase().includes('directory');

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
                {name}
            </label>
            <div className={`flex ${isPathInput ? 'gap-2' : ''}`}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={info.description}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {isPathInput && (
                    <Button 
                        onClick={handleBrowsePath}
                        variant="secondary"
                        size="default"
                    >
                        Browse...
                    </Button>
                )}
            </div>
            {info.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {info.description}
                </p>
            )}
        </div>
    );
};

const ParameterDialog: React.FC<ParameterDialogProps> = ({
    tool,
    onConfirm,
    onCancel,
    isOpen
}) => {
    const [parameters, setParameters] = useState<Record<string, string>>({});
    const dialogRef = useRef<HTMLDivElement>(null);

    // Reset parameters when tool changes
    useEffect(() => {
        if (tool) {
            const initialParams: Record<string, string> = {};
            Object.keys(tool.parameters.properties).forEach(name => {
                initialParams[name] = '';
            });
            setParameters(initialParams);
        }
    }, [tool]);

    // Handle click outside dialog
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
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

    const handleParameterChange = useCallback((name: string, value: string) => {
        setParameters(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleConfirm = useCallback(() => {
        onConfirm(parameters);
    }, [parameters, onConfirm]);

    if (!isOpen || !tool) return null;

    return (
        <div className="dialog-overlay">
            <div 
                ref={dialogRef}
                className="dialog-content"
            >
                <div className="dialog-header">
                    <h2 className="dialog-title">
                        Use {tool.name}
                    </h2>
                    <p className="dialog-description">
                        Configure the parameters for this tool
                    </p>
                </div>
                
                <div className="dialog-body">
                    {Object.entries(tool.parameters.properties).map(([name, info]) => (
                        <ParameterInput
                            key={name}
                            name={name}
                            info={info}
                            value={parameters[name] || ''}
                            onChange={(value) => handleParameterChange(name, value)}
                        />
                    ))}
                </div>

                <div className="dialog-footer">
                    <Button
                        onClick={onCancel}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="default"
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ParameterDialog; 