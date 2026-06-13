import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Download, Settings, Send, Bot, User, MessageSquare, Plus, Trash2, Menu, X, AlertOctagon, ImageIcon, Paperclip, Info, Square, Github, Linkedin, FileText, Code, ChevronDown } from 'lucide-react';
import fluxGenLogo from './assets/images/flux_gen_logo_1779525932966.png';
import { get, set } from 'idb-keyval';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  referenceImage?: string;
  enhancedPrompt?: string;
  understanding?: string;
  dimensions?: string;
  isError?: boolean;
  isLoading?: boolean;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>([{ id: Date.now().toString(), title: 'New Generation', messages: [], createdAt: Date.now() }]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const savedChats = await get<ChatSession[]>('flux_gen_chats');
        if (savedChats && savedChats.length > 0) {
          setChats(savedChats);
        }
        
        const savedChatId = await get<string>('flux_gen_current_chat');
        if (savedChatId) {
          setCurrentChatId(savedChatId);
        }
      } catch (e) {
        console.error('Failed to load data from indexedDB', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!currentChatId && chats.length > 0 && isLoaded) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      set('flux_gen_chats', chats).catch(e => console.error('Failed to save chats to indexedDB', e));
    }
  }, [chats, isLoaded]);

  useEffect(() => {
    if (currentChatId && isLoaded) {
      set('flux_gen_current_chat', currentChatId).catch(e => console.error('Failed to save current chat ID to indexedDB', e));
    }
  }, [currentChatId, isLoaded]);
  
  const [input, setInput] = useState('');
  const [model, setModel] = useState('qwen-image');
  const [seed, setSeed] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{url: string, id: string} | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableModels = [
    { id: 'qwen-image', name: 'Qwen-Image', supportsImage: false },
    { id: 'qwen-image-edit', name: 'Qwen-Image-Edit', supportsImage: true },
    { id: 'flux.1-dev', name: 'FLUX.1-dev', supportsImage: false },
    { id: 'flux.1-schnell', name: 'FLUX.1-schnell', supportsImage: false },
    { id: 'flux.1-kontext-dev', name: 'FLUX.1-Kontext-dev', supportsImage: true },
    { id: 'flux.2-klein-4b', name: 'FLUX.2-klein-4B', supportsImage: false },
    { id: 'stable-diffusion-3.5-large', name: 'Stable Diffusion 3.5 Large', supportsImage: false },
  ];

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
  const messages = currentChat?.messages || [];
  const selectedModelConfig = availableModels.find(m => m.id === model);
  const supportsImage = selectedModelConfig?.supportsImage;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    };
    if (isInfoOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInfoOpen]);

  const createNewChat = () => {
    const newChat: ChatSession = { id: Date.now().toString(), title: 'New Generation', messages: [], createdAt: Date.now() };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const confirmDelete = () => {
    if (!chatToDelete) return;
    
    const remaining = chats.filter(c => c.id !== chatToDelete);
    let newChats = remaining;
    let newCurrentId = currentChatId;

    if (remaining.length === 0) {
      const newChat: ChatSession = { id: Date.now().toString(), title: 'New Generation', messages: [], createdAt: Date.now() };
      newChats = [newChat];
      newCurrentId = newChat.id;
    } else if (currentChatId === chatToDelete) {
      newCurrentId = remaining[0].id;
    }

    setChats(newChats);
    setCurrentChatId(newCurrentId);
    setChatToDelete(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userPrompt = input.trim();
    const currentRefImage = referenceImage;
    
    setInput('');
    setReferenceImage(null);
    setIsGenerating(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessageTimeId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();

    const isFirstMessage = messages.length === 0;
    
    abortControllerRef.current = new AbortController();
    
    setChats(prev => prev.map(c => {
      if (c.id !== currentChatId) return c;
      const newTitle = isFirstMessage 
        ? (userPrompt.length > 25 ? userPrompt.substring(0, 25) + '...' : userPrompt)
        : c.title;
        
      return {
        ...c,
        title: newTitle,
        messages: [
          ...c.messages,
          { id: userMessageTimeId, role: 'user', content: userPrompt, referenceImage: currentRefImage || undefined },
          { id: assistantMessageId, role: 'assistant', isLoading: true, content: 'Synthesizing visual data...' }
        ]
      };
    }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, model, inputImage: currentRefImage, seed: seed ? parseInt(seed, 10) : undefined }),
        signal: abortControllerRef.current.signal,
      });

      let data: any;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate image');
      }

      setChats(prev => prev.map(c => {
        if (c.id !== currentChatId) return c;
        return {
          ...c,
          messages: c.messages.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, isLoading: false, content: 'Generation complete.', imageUrl: data.imageUrl, enhancedPrompt: data.enhancedPrompt, understanding: data.understanding, dimensions: data.dimensions } 
              : msg
          )
        };
      }));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setChats(prev => prev.map(c => {
          if (c.id !== currentChatId) return c;
          return {
            ...c,
            messages: c.messages.map(msg => 
               msg.id === assistantMessageId 
                ? { ...msg, isLoading: false, isError: true, content: 'Generation cancelled.' } 
                : msg
            )
          };
        }));
        return;
      }
      setChats(prev => prev.map(c => {
        if (c.id !== currentChatId) return c;
        return {
          ...c,
          messages: c.messages.map(msg => 
             msg.id === assistantMessageId 
              ? { ...msg, isLoading: false, isError: true, content: `Error: ${err.message || 'An unexpected error occurred'}` } 
              : msg
          )
        };
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 flex bg-zinc-950 font-sans text-zinc-100 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      
      {/* Sidebar */}
      <aside className={`absolute md:relative z-40 h-full w-[80%] md:w-72 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}`}>
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
          <span className="flex items-center gap-2 font-display font-semibold tracking-wide text-zinc-100">
            <img src={fluxGenLogo} alt="FLUX GEN Logo" className="w-6 h-6 rounded border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.2)]" referrerPolicy="no-referrer" />
            FLUX GEN
          </span>
          <button className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="p-4">
          <button 
            onClick={createNewChat} 
            className="w-full flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 font-medium py-2.5 rounded-lg hover:bg-white transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4"/> New Generation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">History</div>
          {chats.map(chat => (
            <div key={chat.id} 
                 className={`group flex flex-col gap-1 rounded-lg p-3 cursor-pointer transition-colors ${currentChatId === chat.id ? 'bg-zinc-800/80 text-zinc-100' : 'hover:bg-zinc-800/50 text-zinc-400'}`} 
                 onClick={() => { setCurrentChatId(chat.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}>
              <div className="flex items-center justify-between">
                <div className="flex-1 truncate text-sm flex items-center gap-2.5 font-medium">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${currentChatId === chat.id ? 'text-indigo-400' : 'text-zinc-500'}`}/>
                  <span className="truncate">{chat.title}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setChatToDelete(chat.id); }} 
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:text-red-400 hover:bg-zinc-700/50 transition-all ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}/>}

      {/* Main Chat Area */}
      <main className="flex-1 h-full min-h-0 flex flex-col bg-transparent relative z-10 w-full overflow-hidden">
        
        {/* Header Bar */}
        <header className="shrink-0 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md p-4 flex items-center justify-between gap-2 z-20 w-full h-[73px]">
          <div className="flex items-center gap-2 flex-shrink min-w-0">
            <button className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800/50 transition-colors shrink-0" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5"/>
            </button>
            <div className="hidden md:block truncate text-sm font-medium text-zinc-200 max-w-[200px] lg:max-w-[400px]">
              {currentChat.title}
            </div>
          </div>
          
          <div className="flex justify-end items-center gap-1 sm:gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setChatToDelete(currentChatId)}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-400 rounded-md hover:bg-zinc-800/50 transition-colors shrink-0"
              title="Delete Conversation"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 shrink-0 max-w-[130px] sm:max-w-xs">
              <Settings className="hidden sm:block w-4 h-4 text-zinc-400 shrink-0" />
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="appearance-none bg-transparent text-xs sm:text-sm font-medium text-zinc-200 cursor-pointer outline-none focus:ring-0 pr-4 sm:pr-4 truncate w-full"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
                ))}
              </select>
            </div>

            <div className="relative shrink-0" ref={infoRef}>
              <button 
                type="button"
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800/50 transition-colors"
                title="Account Details"
              >
                <Info className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
              {isInfoOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  <div className="flex flex-col items-center text-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
                        RA
                      </div>
                      <div className="w-full">
                        <p className="text-sm font-semibold text-zinc-100 truncate w-full px-2" title="Rehan Ahmad">Rehan Ahmad</p>
                        <p className="text-xs font-medium text-zinc-400 mt-0.5 truncate w-full px-2" title="rehan515ahmad@gmail.com">rehan515ahmad@gmail.com</p>
                        <p className="text-xs font-medium text-zinc-500 mt-2">Creator / Developer</p>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400 flex flex-col gap-2.5 mb-4 pb-4 border-b border-zinc-800">
                      <div className="flex justify-between items-center bg-zinc-950/50 px-2.5 py-1.5 rounded-md border border-zinc-800/50">
                        <span>Status</span>
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-950/50 px-2.5 py-1.5 rounded-md border border-zinc-800/50">
                        <span>Workspace</span>
                        <span className="text-zinc-300">Personal</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-1 mb-1">Social Profiles</span>
                      <a href="https://www.linkedin.com/in/rehan-ahmad-863386382?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-zinc-300 hover:text-white px-2 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors">
                        <Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn
                      </a>
                      <a href="https://github.com/Ft976" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-zinc-300 hover:text-white px-2 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors">
                        <Github className="w-4 h-4 text-zinc-100" /> GitHub
                      </a>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-zinc-800">
                      <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-1 mb-1">Information</span>
                      <a href="https://build.nvidia.com/black-forest-labs/flux-schnell" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-zinc-300 hover:text-white px-2 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors">
                        <FileText className="w-4 h-4 text-indigo-400" /> Document
                      </a>
                      <a href="https://github.com/Ft976?tab=repositories" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-zinc-300 hover:text-white px-2 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors">
                        <Code className="w-4 h-4 text-emerald-400" /> Project Files
                      </a>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overscroll-none p-4 md:p-8 flex flex-col gap-8 w-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-6 max-w-sm mx-auto w-full">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                <ImageIcon className="w-8 h-8 text-indigo-400/80" />
              </div>
              <div className="text-center">
                <h2 className="font-display text-xl font-medium text-zinc-200 mb-2">Visualize Ideas</h2>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  Describe a scene, character, or concept, and our models will generate a high-fidelity image for you.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pb-8">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 md:gap-6 ${message.role === 'user' ? 'flex-row' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border ${message.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 md:w-5 md:h-5 text-zinc-300" />
                    ) : (
                      <img src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif" alt="AI" className="w-[80%] h-[80%] object-contain opacity-80" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`flex-1 flex flex-col gap-3 min-w-0 pt-1`}>
                    
                    {message.referenceImage && (
                      <div className="mb-1">
                        <img src={message.referenceImage} alt="Reference input" className="h-16 w-16 md:h-24 md:w-24 rounded-lg border border-zinc-700 object-cover shadow-sm bg-zinc-900" />
                      </div>
                    )}
                    
                    {message.content && (
                      <div className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words min-w-0 font-sans ${message.isError ? 'text-red-400 font-medium' : 'text-zinc-200'}`}>
                        {message.content}
                      </div>
                    )}

                    {message.isLoading && (
                      <div className="flex items-center justify-between w-full max-w-sm gap-3 py-2 text-zinc-400">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          <span className="text-sm font-medium">Generating visual architecture...</span>
                        </div>
                        <button
                          onClick={stopGeneration}
                          className="px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors shadow-sm"
                        >
                          <Square className="w-3 h-3 fill-current" /> Stop
                        </button>
                      </div>
                    )}

                    {message.enhancedPrompt && (
                      <details className="mt-2 mb-2 group">
                        <summary className="flex items-center justify-between gap-1.5 p-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-lg cursor-pointer transition-colors text-xs font-semibold text-indigo-400 uppercase tracking-wider select-none list-none [&::-webkit-details-marker]:hidden">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Prompt Intelligence
                          </span>
                          <div className="flex items-center gap-2">
                            {message.dimensions && <span className="text-indigo-300/60 lowercase font-mono">{message.dimensions}</span>}
                            <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 opacity-60" />
                          </div>
                        </summary>
                        <div className="p-3 mt-1 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-sm text-indigo-200/90 leading-relaxed max-w-prose whitespace-pre-wrap break-words">
                          {message.understanding && (
                            <div className="mb-3 pb-3 border-b border-indigo-500/10">
                              <span className="block text-[10px] text-indigo-400/80 uppercase tracking-widest font-semibold mb-1">Understanding</span>
                              {message.understanding}
                            </div>
                          )}
                          <span className="block text-[10px] text-indigo-400/80 uppercase tracking-widest font-semibold mb-1">Generated Prompt</span>
                          {message.enhancedPrompt}
                        </div>
                      </details>
                    )}
                    
                    {message.imageUrl && (
                      <div 
                        className="mt-3 relative group inline-block max-w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/10 hover:border-zinc-700 cursor-pointer"
                        onClick={() => setSelectedImage({ url: message.imageUrl!, id: message.id })}
                      >
                        <img 
                          src={message.imageUrl} 
                          alt="AI Generation" 
                          className="w-full h-auto max-h-[600px] object-contain block"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                        <a 
                          href={message.imageUrl}
                          download={`generation-${message.id}.jpg`}
                          className="absolute bottom-4 right-4 bg-white text-zinc-900 p-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 pointer-events-auto"
                          title="Download Image"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 bg-zinc-950/90 border-t border-zinc-900/80 backdrop-blur-md pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:py-6 p-4 md:p-6 z-20 w-full relative">
          <form onSubmit={handleSubmit} className="relative flex flex-col max-w-4xl mx-auto w-full group">
            {referenceImage && (
              <div className="relative inline-block self-start mb-3 ml-2">
                <img src={referenceImage} alt="Reference preview" className="h-20 w-20 object-cover rounded-xl border-2 border-zinc-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                <button 
                  type="button" 
                  onClick={() => setReferenceImage(null)}
                  className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-full p-1.5 shadow-md border border-zinc-600 transition-colors z-10 hover:bg-red-500 hover:border-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="relative flex items-end w-full">
              <button
                type="button"
                className={`absolute left-2 bottom-2 shrink-0 text-zinc-400 p-2.5 rounded-xl transition-colors z-10 ${supportsImage ? 'hover:text-white hover:bg-zinc-800/80' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => supportsImage && document.getElementById('image-upload')?.click()}
                title={supportsImage ? "Upload Reference Image" : "Current model does not support image upload"}
                disabled={!supportsImage}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!supportsImage}
                onChange={handleImageUpload}
              />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want to see..."
                className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl py-3.5 pl-14 pr-16 text-[15px] font-sans text-zinc-100 max-h-[200px] min-h-[56px] outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all resize-none shadow-lg placeholder:text-zinc-500 will-change-transform overflow-y-auto"
                spellCheck="false"
                rows={1}
                disabled={isGenerating}
              />
              {isGenerating ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="absolute right-2 bottom-2 shrink-0 bg-red-500/20 hover:bg-red-500/30 text-red-500 hover:text-red-400 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md z-10"
                  title="Stop Generation"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() && !referenceImage}
                  className="absolute right-2 bottom-2 shrink-0 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800/80 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:text-zinc-500 disabled:cursor-not-allowed shadow-md z-10"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
          <div className="text-center mt-3 text-xs font-medium text-zinc-500 hidden md:block">
            Shift + Enter to add a new line
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {chatToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertOctagon className="w-6 h-6 text-red-500"/>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Delete chat?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Are you sure you want to delete this chat record? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setChatToDelete(null)} 
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
            <a 
              href={selectedImage.url}
              download={`generation-${selectedImage.id}.jpg`}
              className="bg-zinc-800/80 hover:bg-zinc-700 text-white p-3 rounded-full backdrop-blur-md transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Download Full Image"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              className="bg-zinc-800/80 hover:bg-zinc-700 text-white p-3 rounded-full backdrop-blur-md transition-colors"
              onClick={() => setSelectedImage(null)}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 w-full h-full flex items-center justify-center">
            <img 
              src={selectedImage.url} 
              alt="Fullscreen generation" 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
