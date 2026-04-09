import React, { useState, useRef, useEffect } from 'react';
import './InputBar.css';

export default function InputBar({ onSendMessage, isGenerating }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('text'); // 'text' or 'image'
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim(), mode);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'text' ? 'image' : 'text'));
  };

  return (
    <div className="input-bar-container">
      <form className="input-form glass" onSubmit={handleSubmit}>
        <button
          type="button"
          className={`mode-toggle-btn ${mode === 'image' ? 'active-image' : ''}`}
          onClick={toggleMode}
          title={mode === 'text' ? 'Switch to Image Generation' : 'Switch to Text'}
        >
          {mode === 'text' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
               <circle cx="8.5" cy="8.5" r="1.5"></circle>
               <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </button>

        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'image' ? 'Describe the image you want to generate...' : 'Type your message here...'}
          rows="1"
          disabled={isGenerating}
        />

        <button
          type="submit"
          className={`send-btn ${input.trim() && !isGenerating ? 'active' : ''}`}
          disabled={!input.trim() || isGenerating}
        >
          {isGenerating ? (
            <svg className="generating-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4"></path>
              <path d="M12 18v4"></path>
              <path d="M4.93 4.93l2.83 2.83"></path>
              <path d="M16.24 16.24l2.83 2.83"></path>
              <path d="M2 12h4"></path>
              <path d="M18 12h4"></path>
              <path d="M4.93 19.07l2.83-2.83"></path>
              <path d="M16.24 7.76l2.83-2.83"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
      <div className="input-footer">
        AI Chatbot • Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
