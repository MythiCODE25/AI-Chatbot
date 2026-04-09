import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import './ChatWindow.css';

export default function ChatWindow({
  activeChat,
  onSendMessage,
  isGenerating
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  if (!activeChat) {
    const landingGreetings = [
      "Welcome back, how can I help?",
      "Hi there! What's our next project?",
      "Hello! Ready to dive in?",
      "Ready to assist. Pick a chat or prompt below.",
      "Greetings! Let's build something together."
    ];
    const displayGreeting = landingGreetings[Math.floor(Date.now() / 3600000) % landingGreetings.length]; // Changes hourly

    return (
      <div className="chat-window empty">
        <div className="welcome-container">
          <div className="welcome-message glass">
            <div className="welcome-icon">✨</div>
            <h2>{displayGreeting}</h2>
            <p>Select a chat or start a new conversation using the prompts below.</p>
          </div>
          
          <div className="suggestion-cards landing">
            <div className="card" onClick={() => onSendMessage("Explain quantum computing to a 5-year-old", "text")}>
              <h3>Explain Concept</h3>
              <p>How does quantum computing work?</p>
            </div>
            <div className="card" onClick={() => onSendMessage("A futuristic cyberpunk city at night", "image")}>
              <h3>Generate Image</h3>
              <p>Create a neon cyberpunk cityscape</p>
            </div>
            <div className="card" onClick={() => onSendMessage("Write a Python script to sort an array", "text")}>
              <h3>Write Code</h3>
              <p>Python script for sorting arrays</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <header className="chat-header glass">
        <h2>{activeChat.title || 'New Conversation'}</h2>
        <div className="chat-status">
          {isGenerating ? (
            <span className="status-generating">
              <span className="dot animate-pulse"></span> AI is typing...
            </span>
          ) : (
            <span className="status-ready">
               <span className="dot ready"></span> Ready
            </span>
          )}
        </div>
      </header>

      <main className="chat-messages">
        {activeChat.messages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="chat-greeting">
              <h1>{activeChat.greeting || "What can I help with?"}</h1>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {activeChat.messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <div className="chat-input-area">
        <InputBar onSendMessage={onSendMessage} isGenerating={isGenerating} />
      </div>
    </div>
  );
}
