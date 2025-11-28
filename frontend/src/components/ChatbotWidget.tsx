import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Bot, Settings, Sparkles, Maximize2, Minimize2, Code2 } from 'lucide-react';
import { useSendMessage, useChatbotHealth } from '../hooks';
import type { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * ChatbotWidget Component
 * 
 * Professional AI coding assistant with markdown and code formatting
 * 
 * Current Features:
 * - Health & productivity tips
 * - Maximize/minimize window
 * - Code syntax highlighting
 * - Markdown formatting (bold, italic, headers, lists)
 * - Inline code and code blocks
 * 
 * Future Features:
 * - Code assistance & debugging
 * - Latest tech trends & research
 * - Design patterns & best practices
 * - Performance optimization tips
 */

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 **Hi! I\'m DevWell AI Assistant** powered by OpenRouter.\n\nI can help you with:\n\n- Health & productivity tips\n- Fatigue management advice\n- Ergonomics guidance\n- Work-life balance\n- DevWell features\n\n🚀 **Coming soon:** Code assistance, tech research & design patterns!\n\nTry asking me:\n- "How can I improve my posture?"\n- "Show me a TypeScript example"\n- "Latest React best practices"\n\nHow can I help you today?',
      timestamp: new Date(),
      model: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'llama' | 'openrouter' | 'auto'>('auto');
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const sendMessageMutation = useSendMessage();
  const { data: health } = useChatbotHealth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Prepare conversation history (last 5 messages)
    const conversationHistory = messages.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const result = await sendMessageMutation.mutateAsync({
        message: userMessage.content,
        model: selectedModel,
        conversationHistory
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        model: result.model
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      
      // Get error message from response or use default
      let errorText = '❌ Sorry, I encountered an error. Please try again or switch to a different model.';
      
      if (error?.response?.data?.msg) {
        errorText = `❌ Error: ${error.response.data.msg}`;
      } else if (error?.response?.data?.error) {
        errorText = `❌ ${error.response.data.error}`;
      } else if (error?.message) {
        errorText = `❌ Error: ${error.message}`;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        model: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: '🔄 Conversation cleared! How can I help you?',
      timestamp: new Date(),
      model: 'system'
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 group"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            DevWell AI Assistant
          </div>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 transition-all duration-300 ${
          isExpanded 
            ? 'inset-6 w-auto h-auto' 
            : 'bottom-6 right-6 w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-6 h-6" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  DevWell AI
                  {isExpanded && <Code2 className="w-4 h-4 opacity-75" />}
                </h3>
                <p className="text-xs opacity-90">
                  {health?.status === 'healthy' ? '🟢 Online' : '🔴 Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                aria-label={isExpanded ? "Minimize" : "Maximize"}
                title={isExpanded ? "Minimize" : "Maximize"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 border-b border-gray-200 p-3 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auto">🤖 Auto (Recommended)</option>
                  <option value="openrouter">🌐 OpenRouter</option>
                </select>
              </div>
              <button
                onClick={clearConversation}
                className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Clear Conversation
              </button>
            </div>
          )}

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 ${isExpanded ? 'max-h-full' : ''}`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${isExpanded ? 'max-w-[85%]' : 'max-w-[80%]'} rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-pre:my-2 prose-code:text-xs">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg !mt-2 !mb-2"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                              </code>
                            );
                          },
                          h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 border-b pb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold text-gray-800">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-800">{children}</h3>,
                          p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-sm">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                          a: ({ children, href }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  {message.model && message.role === 'assistant' && message.model !== 'system' && message.model !== 'error' && (
                    <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      {message.model === 'auto' ? 'OpenRouter' : message.model}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <Loader className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sendMessageMutation.isPending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isExpanded ? (
                <>Powered by OpenRouter • Code formatting enabled • Press <Minimize2 className="w-3 h-3 inline" /> to minimize</>
              ) : (
                <>Powered by OpenRouter • Press <Maximize2 className="w-3 h-3 inline" /> for code mode</>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
