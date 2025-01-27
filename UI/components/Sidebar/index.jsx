import React from 'react';
import styled from 'styled-components';
import NewChatButton from './NewChatButton';
import ChatList from './ChatList';
import ToolsList from './ToolsList';

const SidebarContainer = styled.div`
    background: ${props => props.theme.colors.sidebarBackground};
    border-right: 1px solid ${props => props.theme.colors.border};
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const Sidebar = ({ currentChatId, onChatSelect, onNewChat, tools, onToolSelect }) => {
    return (
        <SidebarContainer>
            <NewChatButton onClick={onNewChat} />
            <ChatList
                currentChatId={currentChatId}
                onChatSelect={onChatSelect}
            />
            <ToolsList
                tools={tools}
                onToolSelect={onToolSelect}
            />
        </SidebarContainer>
    );
};

export default Sidebar; 