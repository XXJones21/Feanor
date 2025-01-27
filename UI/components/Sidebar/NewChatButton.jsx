import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Button = styled(motion.button)`
    width: 90%;
    margin: 1rem auto;
    padding: 0.75rem;
    border-radius: 8px;
    border: none;
    background: ${props => props.theme.colors.primary};
    color: white;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: ${props => props.theme.colors.primaryDark};
    }
`;

const NewChatButton = ({ onClick }) => (
    <Button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        <span>+</span>
        <span>New Chat</span>
    </Button>
);

export default NewChatButton; 