import { useState } from 'react';

interface Conversation {
  waId: string;
  contactName: string;
  lastMessage: string;
  lastTimestamp: string;
  totalMessages: number;
  lastStatus: string;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedWaId: string | null;
  onSelect: (waId: string) => void;
}

export function ConversationsList({ conversations, selectedWaId, onSelect }: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conversation =>
    conversation.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16H17v2h-7V9h2v5.34l9.24-9.24-1.41-1.41z"/>
          </svg>
        );
      case 'read':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16H17v2h-7V9h2v5.34l9.24-9.24-1.41-1.41z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="conversations-list">
      {/* Header */}
      <div className="conversations-header">
        <h2>Chats</h2>
        <button className="new-chat-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search or start new chat"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conversations */}
      <div className="conversations-content">
        {filteredConversations.length === 0 ? (
          <div className="empty-conversations">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <h3>No conversations found</h3>
            <p>Your messages will appear here when you start chatting.</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.waId}
              className={`conversation-item ${selectedWaId === conversation.waId ? 'selected' : ''}`}
              onClick={() => onSelect(conversation.waId)}
            >
              <div className="conversation-avatar">
                {getInitials(conversation.contactName || conversation.waId)}
              </div>
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3 className="conversation-name">
                    {conversation.contactName || `+${conversation.waId}`}
                  </h3>
                  <span className="conversation-time">
                    {formatTime(conversation.lastTimestamp)}
                  </span>
                </div>
                <div className="conversation-message">
                  {conversation.lastMessage && (
                    <>
                      <span className="message-status message-status-${conversation.lastStatus}">
                        {getStatusIcon(conversation.lastStatus)}
                      </span>
                      <span>{conversation.lastMessage}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


