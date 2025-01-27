import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const InputContainer = styled.div`
    border-top: 1px solid ${props => props.theme.colors.border};
    padding: 1rem;
    background: ${props => props.theme.colors.background};
`;

const InputWrapper = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const TextArea = styled.textarea`
    flex: 1;
    min-height: 24px;
    max-height: 200px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid ${props => props.theme.colors.border};
    background: ${props => props.theme.colors.inputBackground};
    color: ${props => props.theme.colors.text};
    resize: none;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary};
        box-shadow: 0 0 0 2px ${props => props.theme.colors.primaryLight};
    }
`;

const SendButton = styled(motion.button)`
    padding: 12px 24px;
    border-radius: 12px;
    border: none;
    background: ${props => props.theme.colors.primary};
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.colors.primaryDark};
    }

    &:disabled {
        background: ${props => props.theme.colors.disabled};
        cursor: not-allowed;
    }
`;

const AttachmentPreview = styled(motion.div)`
    padding: 8px 12px;
    background: ${props => props.theme.colors.backgroundLight};
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
`;

const InputArea = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const textAreaRef = useRef(null);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (message.trim() || attachment) {
            onSendMessage(message, attachment);
            setMessage('');
            setAttachment(null);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (items) {
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    setAttachment(file);
                    break;
                }
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setAttachment(file);
        }
    };

    return (
        <InputContainer>
            <AnimatePresence>
                {attachment && (
                    <AttachmentPreview
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <span>📎 {attachment.name}</span>
                        <button onClick={() => setAttachment(null)}>×</button>
                    </AttachmentPreview>
                )}
            </AnimatePresence>
            <InputWrapper>
                <TextArea
                    ref={textAreaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder="Type a message..."
                    rows={1}
                    disabled={isLoading}
                />
                <SendButton
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading || (!message.trim() && !attachment)}
                    onClick={handleSend}
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </SendButton>
            </InputWrapper>
        </InputContainer>
    );
};

export default InputArea; 