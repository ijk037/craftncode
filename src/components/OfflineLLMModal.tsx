import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Bot, 
  Send, 
  Lightbulb, 
  User, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  Terminal,
  Settings
} from 'lucide-react';
import { webLlmService, type ChatMessage } from '../services/webLlmService';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
}

interface OfflineLLMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineLLMModal: React.FC<OfflineLLMModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text: `Hello! I am **Qwen 2.5** connected directly to your local on-device neural engine. 

I operate 100% locally on your computer with **zero internet or cloud APIs**. Ask me about medical triage, first-aid procedures, disaster survival, or British Red Cross improvised supplies!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentStreamingText, setCurrentStreamingText] = useState<string>('');
  
  // Ollama Connection State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCheckingConn, setIsCheckingConn] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('qwen2.5:0.5b');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('http://localhost:11434');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const checkOllama = useCallback(async () => {
    setIsCheckingConn(true);
    setConnectionError('');
    try {
      const res = await webLlmService.checkConnection();
      setIsConnected(res.connected);
      if (res.connected) {
        setAvailableModels(res.models);
        setSelectedModel(webLlmService.getSelectedModel());
      } else {
        setConnectionError(res.error || 'Failed to connect to local Ollama');
      }
    } finally {
      setIsCheckingConn(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkOllama();
    }
  }, [isOpen, checkOllama]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, currentStreamingText]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I stop severe arterial bleeding?',
    'What everyday items replace a first-aid kit?',
    'CPR steps for an unconscious victim',
    'How to purify water without electricity?',
    'Trapped under earthquake debris — what to do?',
    'Immediate steps for 2nd degree burns'
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setCurrentStreamingText('');

    try {
      const chatHistory: ChatMessage[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.sender === 'USER' ? 'user' : 'assistant',
          content: m.text,
        }));
      
      chatHistory.push({ role: 'user', content: text.trim() });

      let accumulated = '';
      await webLlmService.streamCompletion(chatHistory, (tokenChunk) => {
        accumulated = tokenChunk;
        setCurrentStreamingText(tokenChunk);
      });

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          text: accumulated,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'AI',
          text: `⚠️ **Connection Error:** Could not reach local Qwen model on Ollama.\n\n*Error details:* ${err.message}\n\nPlease verify that Ollama is running in your terminal:\n\`\`\`powershell\nollama run qwen2.5:0.5b\n\`\`\``,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setIsConnected(false);
    } finally {
      setIsTyping(false);
      setCurrentStreamingText('');
    }
  };

  const handleApplyUrl = () => {
    webLlmService.setBaseUrl(customUrl);
    checkOllama();
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F5F3EE] text-[#252826] border border-[#d8d1c3] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col h-[88vh] font-sans">
        
        {/* Header */}
        <div className="p-4 bg-[#E9E5DC] border-b border-[#d8d1c3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-[#8da999]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#173F35] font-mono">
                  Offline LLM Assistant
                </h2>
                {isConnected ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3F8F78]/20 text-[#173F35] border border-[#3F8F78]/40 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#3F8F78] fill-[#3F8F78]" />
                    {selectedModel} Live
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#A83F35]/15 text-[#A83F35] border border-[#A83F35]/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Ollama Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6F8F7D] flex items-center gap-1.5 mt-0.5 font-mono">
                <span>{webLlmService.getBaseUrl()} • 0 KB Cloud Dependency</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg text-[#6F8F7D] hover:text-[#173F35] hover:bg-[#ded8cd] transition-colors"
              title="Connection Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6F8F7D] hover:text-[#173F35] hover:bg-[#ded8cd] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Settings Bar (Collapsible) */}
        {showSettings && (
          <div className="p-3 bg-[#E9E5DC] border-b border-[#d8d1c3] flex flex-col sm:flex-row items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-[#173F35] font-mono shrink-0">Ollama URL:</span>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-[#F5F3EE] border border-[#d8d1c3] rounded-lg px-2.5 py-1 text-xs text-[#252826] font-mono"
            />
            {availableModels.length > 0 && (
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  webLlmService.setSelectedModel(e.target.value);
                }}
                className="bg-[#F5F3EE] border border-[#d8d1c3] rounded-lg px-2 py-1 text-xs font-mono"
              >
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
            <button
              onClick={handleApplyUrl}
              className="px-3 py-1 rounded-lg bg-[#173F35] text-[#F5F3EE] font-bold text-xs shrink-0"
            >
              Save & Test
            </button>
          </div>
        )}

        {/* Offline Alert Banner if Ollama is not detected */}
        {!isConnected && (
          <div className="p-3.5 bg-[#A83F35]/10 border-b border-[#A83F35]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Terminal className="w-4 h-4 text-[#A83F35] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#A83F35] block font-mono">Real Qwen Model Not Detected on localhost:11434</span>
                <span className="text-[11px] text-[#5c635f] block">
                  Run this command in PowerShell to start your local neural engine: <code className="bg-[#E9E5DC] px-1.5 py-0.5 rounded font-mono font-bold text-[#173F35]">ollama run qwen2.5:0.5b</code>
                </span>
                {connectionError && (
                  <span className="text-[10px] text-[#A83F35] font-mono mt-0.5 block">Notice: {connectionError}</span>
                )}
              </div>
            </div>

            <button
              onClick={checkOllama}
              disabled={isCheckingConn}
              className="px-3 py-1.5 rounded-xl bg-[#173F35] hover:bg-[#102d26] disabled:opacity-50 text-[#F5F3EE] font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConn ? 'animate-spin' : ''}`} />
              <span>{isCheckingConn ? 'Checking...' : 'Check Connection'}</span>
            </button>
          </div>
        )}

        {/* Quick Suggested Queries */}
        <div className="px-4 py-2.5 bg-[#E9E5DC]/70 border-b border-[#d8d1c3] flex items-center gap-1.5 overflow-x-auto user-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-[#6F8F7D] uppercase font-mono shrink-0 flex items-center gap-1 mr-1">
            <Lightbulb className="w-3.5 h-3.5 text-[#C65D32]" />
            Prompts:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-lg bg-[#F5F3EE] hover:bg-[#ded8cd] border border-[#d8d1c3] text-[11px] text-[#252826] font-medium shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 user-scrollbar bg-[#F5F3EE]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${
                msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'USER'
                  ? 'bg-[#C65D32] text-white'
                  : 'bg-[#173F35] text-[#F5F3EE]'
              }`}>
                {msg.sender === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#8da999]" />}
              </div>

              <div className="rounded-2xl p-4 text-xs leading-relaxed shadow-sm bg-[#E9E5DC] border border-[#d8d1c3] text-[#252826]">
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-[#6F8F7D] mb-1.5 border-b border-[#d8d1c3]/60 pb-1">
                  <span className="font-bold flex items-center gap-1">
                    {msg.sender === 'USER' ? 'You' : `Qwen 2.5 (${selectedModel})`}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-xs">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {/* Active Streaming Token Render */}
          {isTyping && currentStreamingText && (
            <div className="flex gap-3 mr-auto max-w-[90%] md:max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-[#8da999]" />
              </div>
              <div className="rounded-2xl p-4 text-xs leading-relaxed shadow-sm bg-[#E9E5DC] border border-[#173F35]/40 text-[#252826]">
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-[#173F35] mb-1.5 border-b border-[#d8d1c3]/60 pb-1">
                  <span className="font-bold flex items-center gap-1">
                    Qwen 2.5 Streaming Neural Tokens...
                    <span className="w-2 h-2 rounded-full bg-[#3F8F78] animate-ping" />
                  </span>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-xs">
                  {currentStreamingText}
                </div>
              </div>
            </div>
          )}

          {isTyping && !currentStreamingText && (
            <div className="flex gap-3 mr-auto items-center text-xs text-[#6F8F7D]">
              <div className="w-8 h-8 rounded-xl bg-[#173F35] text-[#F5F3EE] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#8da999]" />
              </div>
              <div className="bg-[#E9E5DC] p-3 rounded-2xl border border-[#d8d1c3] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#173F35] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#173F35] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#173F35] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-mono ml-1 text-[#173F35]">Local GPU Computing Tokens...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-[#E9E5DC] border-t border-[#d8d1c3] flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask local Qwen 2.5 disaster triage or first-aid steps..."
            className="flex-1 bg-[#F5F3EE] border border-[#d8d1c3] rounded-xl px-4 py-2.5 text-xs text-[#252826] placeholder-[#878e8a] focus:border-[#173F35] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-[#173F35] hover:bg-[#102d26] disabled:opacity-50 text-[#F5F3EE] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 font-mono"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Qwen</span>
          </button>
        </form>

      </div>
    </div>
  );
};
