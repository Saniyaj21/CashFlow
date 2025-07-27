'use client';

import { useState, useEffect } from 'react';
import { FaBrain, FaComments, FaLightbulb, FaRedo, FaCoins, FaRobot, FaStar } from 'react-icons/fa';
import InsightsSection from './InsightsSection';
import { chatAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AISection() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'recommendations'

  return (
    <div className="w-full max-w-xl flex flex-col">
      {/* Header with Credits */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <FaRobot className="text-white" size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">AI Assistant</h2>
            <p className="text-xs text-gray-500">Your personal financial advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full border border-amber-200">
          <FaCoins size={12} className="text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">999+</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full mb-4">
        <div className="flex bg-gray-100/80 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'chat'
                ? 'bg-white text-purple-600 shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <FaComments size={16} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'recommendations'
                ? 'bg-white text-purple-600 shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
                      >
              <FaStar size={16} />
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
    <div className="w-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 bg-white/80 rounded-2xl p-4 mb-4 overflow-y-auto border border-gray-200/50 shadow-sm messages-container">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-purple-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 text-gray-800 p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Questions - Show only if no conversation yet */}
      {messages.length === 1 && !isLoading && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-3 font-medium">Try asking:</p>
          <div className="grid grid-cols-2 gap-2">
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
                className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl text-xs font-medium hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100 hover:border-purple-200 text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/80 rounded-2xl p-4 border border-gray-200/50 shadow-sm">
        <div className="flex gap-3 mb-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your finances..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              !inputMessage.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:scale-105'
            }`}
          >
            Send
          </button>
        </div>
        
        {/* Credit Cost Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FaCoins size={10} />
            <span>1 credit per message</span>
          </div>
          <div className="text-xs text-gray-400">
            {messages.length - 1} messages sent
          </div>
        </div>
      </div>
    </div>
  );
}

// Recommendations Tab Component
function RecommendationsTab() {
  return <InsightsSection />;
} 