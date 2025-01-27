import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1.0); }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    margin: 1rem 0;
`;

const Dot = styled.div`
    width: 8px;
    height: 8px;
    margin: 0 4px;
    background-color: ${props => props.theme.colors.primary};
    border-radius: 50%;
    display: inline-block;
    animation: ${bounce} 1.4s infinite ease-in-out both;
    animation-delay: ${props => props.delay}s;
`;

const LoadingIndicator = () => (
    <LoadingContainer>
        <Dot delay={0} />
        <Dot delay={0.16} />
        <Dot delay={0.32} />
    </LoadingContainer>
);

export default LoadingIndicator; 