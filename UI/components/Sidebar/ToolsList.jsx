import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ToolsContainer = styled.div`
    border-top: 1px solid ${props => props.theme.colors.border};
    padding: 1rem;
`;

const ToolsHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.textLight};
    font-size: 0.9rem;
    cursor: pointer;
`;

const ToolsList = styled(motion.div)`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const ToolItem = styled(motion.div)`
    padding: 0.75rem;
    border-radius: 8px;
    background: ${props => props.theme.colors.backgroundLight};
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
        background: ${props => props.theme.colors.primaryLight};
    }

    .tool-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .tool-description {
        font-size: 0.8rem;
        color: ${props => props.theme.colors.textLight};
    }
`;

const ToolsList = ({ tools, onToolSelect }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <ToolsContainer>
            <ToolsHeader onClick={() => setIsExpanded(!isExpanded)}>
                <span>Available Tools</span>
                <span>{isExpanded ? '▼' : '▶'}</span>
            </ToolsHeader>
            <AnimatePresence>
                {isExpanded && (
                    <ToolsList
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {tools.map(tool => (
                            <ToolItem
                                key={tool.name}
                                onClick={() => onToolSelect(tool.name)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="tool-name">{tool.name}</div>
                                <div className="tool-description">{tool.description}</div>
                            </ToolItem>
                        ))}
                    </ToolsList>
                )}
            </AnimatePresence>
        </ToolsContainer>
    );
};

export default ToolsList; 