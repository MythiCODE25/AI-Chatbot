import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('nexus_chats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chats', e);
        return [];
      }
    }
    return [];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const savedActiveId = localStorage.getItem('nexus_active_chat');
    return savedActiveId || null;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('nexus_theme') === 'dark';
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize theme class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
    


  // Save to local storage
  useEffect(() => {
    localStorage.setItem('nexus_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('nexus_active_chat', activeChatId);
    }
  }, [activeChatId]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('nexus_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('nexus_theme', 'light');
      }
      return newVal;
    });
  };

  const createNewChat = () => {
    const greetings = [
      "How can I help you today?",
      "Hello! What's on your mind?",
      "Hey there, how can I assist you?",
      "Welcome back! What shall we explore today?",
      "Hi! Ready to create something amazing?",
      "Greetings! How can I be of service?",
      "Hello! Ask me anything."
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const newChat = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      greeting: randomGreeting
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (id) => {
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (activeChatId === id) {
        if (updated.length > 0) {
          setActiveChatId(updated[0].id);
        } else {
          setActiveChatId(null);
        }
      }
      return updated;
    });
  };

  const updateChatMessages = (chatId, messages, titleUpdate = null) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages,
          title: titleUpdate ? titleUpdate : chat.title
        };
      }
      return chat;
    }));
  };

  const streamTextResponse = async (chatId, currentMessages, userInput) => {
    const hfToken = import.meta.env.VITE_HF_TOKEN;
    const modelName = import.meta.env.VITE_MODEL_NAME || "Qwen/Qwen2.5-72B-Instruct";

    try {
      const response = await fetch('https://api-inference.huggingface.co/v1/chat/completions', {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: currentMessages.map(m => ({ 
            role: m.role === 'bot' ? 'assistant' : m.role, 
            content: m.content || " " // Ensure content is not empty
          })),
          stream: true,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error details:', errorData);
        throw new Error(`API returned ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let botMessageText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.choices[0].delta && data.choices[0].delta.content) {
                botMessageText += data.choices[0].delta.content;
                
                // Update specific chat in state
                setChats(prevChats => prevChats.map(chat => {
                  if (chat.id === chatId) {
                    const newMessages = [...chat.messages];
                    newMessages[newMessages.length - 1] = {
                      ...newMessages[newMessages.length - 1],
                      content: botMessageText
                    };
                    return { ...chat, messages: newMessages };
                  }
                  return chat;
                }));
              }
            } catch (e) {
              // Ignore single JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessages = [...chat.messages];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: "Sorry, I encountered an error. Please check your API keys and try again."
          };
          return { ...chat, messages: newMessages };
        }
        return chat;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageResponse = async (chatId, prompt) => {
    const hfToken = import.meta.env.VITE_HF_TOKEN;
    
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessages = [...chat.messages];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: imageUrl,
            isImage: true
          };
          return { ...chat, messages: newMessages };
        }
        return chat;
      }));

    } catch (error) {
      console.error(error);
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessages = [...chat.messages];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: "Sorry, I failed to generate the image. Please check your HF token.",
            isImage: false
          };
          return { ...chat, messages: newMessages };
        }
        return chat;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (text, mode = 'text') => {
    let currentChatId = activeChatId;
    let currentChat = chats.find(c => c.id === currentChatId);

    // Create chat if none exists
    if (!currentChatId || !currentChat) {
      const newId = `chat_${Date.now()}`;
      currentChatId = newId;
      currentChat = { id: newId, title: text.slice(0, 30) + (text.length > 30 ? '...' : ''), messages: [] };
      setChats(prev => [currentChat, ...prev]);
      setActiveChatId(newId);
    }

    // Auto-update title for first message
    let titleUpdate = null;
    if (currentChat.messages.length === 0) {
      titleUpdate = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }

    const startMessages = [
      ...currentChat.messages,
      { role: 'user', content: text, isImage: false },
      { role: 'assistant', content: mode === 'image' ? 'loading' : '', isImage: mode === 'image' }
    ];

    updateChatMessages(currentChatId, startMessages, titleUpdate);
    setIsGenerating(true);

    if (mode === 'image') {
      await generateImageResponse(currentChatId, text);
    } else {
      // Create context for text model (filter out images)
      const contextMessages = startMessages.slice(0, -1).filter(m => !m.isImage);
      await streamTextResponse(currentChatId, contextMessages, text);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <ChatWindow
        activeChat={activeChat}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
}
