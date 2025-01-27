import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
    padding: 20px;
    margin: 20px;
    border-radius: 8px;
    background-color: ${props => props.theme.colors.errorBackground || '#FFF3F3'};
    border: 1px solid ${props => props.theme.colors.error || '#FF0000'};
`;

const ErrorHeading = styled.h3`
    color: ${props => props.theme.colors.error || '#FF0000'};
    margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
    color: ${props => props.theme.colors.text};
    margin-bottom: 15px;
`;

const ReloadButton = styled.button`
    padding: 8px 16px;
    background: ${props => props.theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background: ${props => props.theme.colors.primaryDark};
    }
`;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log the error to your error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorContainer>
                    <ErrorHeading>Something went wrong</ErrorHeading>
                    <ErrorMessage>
                        {this.state.error && this.state.error.toString()}
                    </ErrorMessage>
                    <ReloadButton onClick={this.handleReload}>
                        Reload Application
                    </ReloadButton>
                </ErrorContainer>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 