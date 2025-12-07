import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Bot, Settings, Sparkles, Maximize2, Minimize2, Code2, Copy } from 'lucide-react';
import { useSendMessage, useChatbotHealth, useDarkMode } from '../hooks';
import type { ChatMessage, LogEntry } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatbotWidgetProps {
  logs?: LogEntry[];
  onSendMessage?: (message: string) => Promise<void>;
  isConnected?: boolean;
}

export default function ChatbotWidget({ logs = [], onSendMessage: externalSendMessage, isConnected = false }: ChatbotWidgetProps) {
  const { isDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 **Hi! I\'m DevWell AI Assistant**\n\nI can help you with health tips and productivity.\n\nWhen **Live Session** is active, I can see what you see.',
      timestamp: new Date(),
      model: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'llama' | 'openrouter' | 'auto'>('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [copyStatus, setCopyStatus] = useState<Record<string, 'idle' | 'copied' | 'error'>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessageMutation = useSendMessage();
  const { data: health } = useChatbotHealth();

  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const isQuotaError = lastLog?.message?.includes('Quota Exceeded') || lastLog?.message?.includes('1011');

  // Merge local messages with logs
  // We filter logs to only show relevant ones (e.g. system alerts, AI responses if we had them in logs)
  // For now, let's map 'alert' and 'success' logs to system messages
  const displayMessages = [
    ...localMessages,
    ...logs.filter(l => l.type === 'alert' || l.type === 'success' || l.sender === 'ai').map(l => ({
      id: l.id,
      role: l.sender === 'ai' ? 'assistant' : 'system',
      content: l.message,
      timestamp: l.timestamp,
      model: 'gemini-live'
    } as ChatMessage))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, key: string) => {
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopyStatus(prev => ({ ...prev, [key]: 'copied' }));
      window.setTimeout(() => setCopyStatus(prev => ({ ...prev, [key]: 'idle' })), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      setCopyStatus(prev => ({ ...prev, [key]: 'error' }));
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInput('');

    if (isConnected && externalSendMessage) {
      // Send to Gemini Live
      try {
        await externalSendMessage(userMessage.content);
      } catch (error) {
        console.error("Failed to send to Gemini Live", error);
        setLocalMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: '❌ Failed to send message to Live session.',
          timestamp: new Date(),
          model: 'error'
        }]);
      }
    } else {
      // Default Chatbot behavior
      if (sendMessageMutation.isPending) return;

      const conversationHistory = localMessages.slice(-5).map(msg => ({
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

        setLocalMessages(prev => [...prev, assistantMessage]);

      } catch (error: any) {
        console.error('Chatbot error:', error);
        let errorText = '❌ Sorry, I encountered an error.';
        if (error?.response?.data?.msg) errorText = `❌ Error: ${error.response.data.msg}`;

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorText,
          timestamp: new Date(),
          model: 'error'
        };
        setLocalMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setLocalMessages([{
      id: '1',
      role: 'assistant',
      content: '🔄 Conversation cleared!',
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
          {isConnected && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
          )}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            DevWell AI Assistant
          </div>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isExpanded
          ? 'inset-6 w-auto h-auto'
          : 'bottom-6 right-6 w-96 h-[600px]'
          }`}>
          {/* Header */}
          <div className={`text-white p-4 rounded-t-2xl flex items-center justify-between ${isConnected ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-6 h-6" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {isConnected ? 'DevWell Monitor' : 'DevWell AI'}
                  {isExpanded && <Code2 className="w-4 h-4 opacity-75" />}
                </h3>
                <p className="text-xs opacity-90">
                  {isConnected 
                    ? '🔴 Monitoring Active' 
                    : isQuotaError 
                      ? <span className="text-red-200 font-bold animate-pulse">⚠️ Quota Exceeded (Wait 1m)</span>
                      : (health?.status === 'healthy' ? '🟢 Online' : '🔴 Offline')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 space-y-2">
              {!isConnected && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="auto">🤖 Auto (Recommended)</option>
                    <option value="openrouter">🌐 OpenRouter</option>
                  </select>
                </div>
              )}
              <button
                onClick={clearConversation}
                className="w-full px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                Clear Conversation
              </button>
            </div>
          )}

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 ${isExpanded ? 'max-h-full' : ''}`}>
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${isExpanded ? 'max-w-[85%]' : 'max-w-[80%]'} rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : message.role === 'system'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-gray-800 dark:text-yellow-200'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="relative group/msg">
                      <div className="absolute -right-10 top-0 flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-full"
                          title={copyStatus[message.id] === 'copied' ? 'Copied!' : 'Copy response'}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeContent = String(children).replace(/\n$/, '');
                              const codeCopyKey = `${message.id}-${codeContent.slice(0, 25)}`;

                              if (!inline && match) {
                                return (
                                  <div className="relative group/code">
                                    <button
                                      onClick={() => copyToClipboard(codeContent, codeCopyKey)}
                                      className="absolute right-2 top-2 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover/code:opacity-100 transition"
                                      title={copyStatus[codeCopyKey] === 'copied' ? 'Copied!' : 'Copy code'}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    <SyntaxHighlighter
                                      style={isDarkMode ? vscDarkPlus : vs}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-lg !mt-2 !mb-2"
                                      {...props}
                                    >
                                      {codeContent}
                                    </SyntaxHighlighter>
                                    {copyStatus[codeCopyKey] === 'copied' && (
                                      <span className="absolute right-10 top-2 text-[10px] text-emerald-400">Copied!</span>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <code className="bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sendMessageMutation.isPending && !isConnected && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                  <Loader className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Ask Gemini (Monitoring Active)..." : "Ask me anything..."}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                disabled={sendMessageMutation.isPending && !isConnected}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || (sendMessageMutation.isPending && !isConnected)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
