import React from 'react';
import './MessageBubble.css';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isImage = message.isImage;

  return (
    <div className={`message-wrapper ${isUser ? 'user-wrapper' : 'bot-wrapper'} animate-message`}>
      {!isUser && (
        <div className="avatar bot-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
            <path d="M12 12 2.1 7.1"/>
            <path d="m12 12 7.1 7.1"/>
          </svg>
        </div>
      )}
      
      <div className={`bubble ${isUser ? 'user-bubble' : 'bot-bubble'} ${isImage ? 'image-bubble' : ''}`}>
        {isImage ? (
          <div className="image-container">
            {message.content === 'loading' ? (
              <div className="image-loading">
                <div className="spinner"></div>
                <span>Generating your image...</span>
              </div>
            ) : (
              <img src={message.content} alt="Generated AI" className="generated-image" loading="lazy" />
            )}
          </div>
        ) : (
          <div className="text-content">
            {message.content ? message.content : (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      )}
    </div>
  );
}
