'use client';

import { useState, useEffect } from 'react';
import { FaBrain, FaComments, FaLightbulb, FaRedo, FaCoins } from 'react-icons/fa';
import InsightsSection from './InsightsSection';
import { chatAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AISection() {
  const [activeTab, setActiveTab] = useState('recommendations'); // 'chat' or 'recommendations'

  return (
    <div className="w-full max-w-xl flex flex-col items-center py-1">
      {/* Credits Section */}
      <div className="w-full flex justify-end mb-3">
        <div className="flex items-center gap-1.5 text-amber-600">
          <FaCoins size={12} />
          <span className="text-xs font-medium">Credits: 999+</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full mb-3">
        <div className="flex bg-white/60 rounded-xl p-0.5 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FaComments size={14} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 ${
              activeTab === 'recommendations'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FaLightbulb size={14} />
            Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'chat' ? (
          <ChatTab />
        ) : (
          <RecommendationsTab />
        )}
      </div>
    </div>
  );
}

// Chat Tab Component
function ChatTab() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI financial assistant. I can help you with budgeting advice, expense analysis, investment suggestions, and answer any financial questions you have. What would you like to know?',
      timestamp: new Date()
    }
  ]);

  const suggestedQuestions = [
    "How can I save more money?",
    "What's my spending pattern?",
    "Give me investment advice",
    "How to create a budget?",
    "What are my top expenses?"
  ];
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageWithText = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        type: msg.type,
        content: msg.content
      }));

      // Call the chat API
      const response = await chatAPI.sendMessage(messageText, conversationHistory);
      
      if (response.success) {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(response.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your message. Please try again or check your internet connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');

    await sendMessageWithText(currentMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-280px)]">
      {/* Messages Area */}
      <div className="flex-1 bg-white/60 rounded-xl p-3 mb-3 overflow-y-auto border border-gray-100 messages-container">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-2.5 rounded-xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 text-gray-800 p-2.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Questions - Show only if no conversation yet */}
      {messages.length === 1 && !isLoading && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  // Auto-send the question
                  const userMessage = {
                    id: Date.now(),
                    type: 'user',
                    content: question,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, userMessage]);
                  sendMessageWithText(question);
                }}
                className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about your finances..."
          className="flex-1 bg-white/60 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            !inputMessage.trim() || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-sm'
          }`}
        >
          Send
        </button>
      </div>
      
      {/* Credit Cost Info */}
      <div className="w-full flex justify-center mt-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FaCoins size={10} />
          <span>1 credit per message</span>
        </div>
      </div>
    </div>
  );
}

// Recommendations Tab Component
function RecommendationsTab() {
  return <InsightsSection />;
} 