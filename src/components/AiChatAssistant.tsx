import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  Cpu, 
  Lightbulb, 
  MessageSquare, 
  Search, 
  Briefcase, 
  Building2, 
  X,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, ChatRole, GeminiModelId, LeadTarget } from '../types';

interface AiChatAssistantProps {
  leads: LeadTarget[];
  initialContextLead?: LeadTarget | null;
  onClearContextLead?: () => void;
  isDrawerMode?: boolean;
  onCloseDrawer?: () => void;
}

const CHAT_STORAGE_KEY = 'lumina_jurere_chat_history_v1';

const ROLE_CONFIGS: Record<ChatRole, {
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  color: string;
  borderColor: string;
  bgLight: string;
  prompts: string[];
}> = {
  luminotecnico: {
    label: 'Consultor Técnico Luminotécnico',
    shortLabel: 'Técnico LED',
    icon: Lightbulb,
    description: 'Especialista em especificações, 2700K vs 3000K, IRC > 90, beirais flutuantes e Inox 316 naval contra maresia.',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgLight: 'bg-amber-500/10',
    prompts: [
      'Qual a diferença entre 2700K e 3000K para fachadas em Jurerê?',
      'Como especificar iluminação de piscina resistente à maresia salina?',
      'Qual a especificação ideal para perfis de beirais flutuantes e pedras?',
      'Quantos lúmens e qual o facho para valorizar palmeiras imperiais?'
    ]
  },
  copywriter: {
    label: 'Estrategista de Copywriting VIP',
    shortLabel: 'Copywriter VIP',
    icon: MessageSquare,
    description: 'Roteiros persuasivos e consultivos para WhatsApp, direct e ligação com anfitriões de luxo e síndicos.',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgLight: 'bg-emerald-500/10',
    prompts: [
      'Crie um script de WhatsApp para anfitrião de mansão no Airbnb Luxe',
      'Como abordar o síndico de um condomínio horizontal para retrofit LED?',
      'Roteiro de áudio de 40s para arquiteto parceiro em Florianópolis',
      'Mensagem para reativar contato com lead que não respondeu o orçamento'
    ]
  },
  osint: {
    label: 'Inteligência Territorial & OSINT',
    shortLabel: 'OSINT & Cadastral',
    icon: Search,
    description: 'Métodos éticos para cruzar GeoFloripa, PMF, Receita Federal e anúncios de temporada para achar tomadores de decisão.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgLight: 'bg-cyan-500/10',
    prompts: [
      'Como achar a Inscrição Imobiliária de um lote no GeoFloripa?',
      'Como descobrir a administradora de um condomínio pela Receita Federal?',
      'Como cruzar anúncio do Airbnb com imagem de satélite para achar a alameda?',
      'Como abordar a zeladoria na rua para descobrir quem é o proprietário?'
    ]
  },
  commercial: {
    label: 'Fechador Comercial & Propostas ROI',
    shortLabel: 'Comercial & ROI',
    icon: Briefcase,
    description: 'Quebra de objeções, justificativas financeiras de retorno de investimento e precificação de R$ 25k a R$ 150k.',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgLight: 'bg-purple-500/10',
    prompts: [
      'Como rebater a objeção: "Achei o orçamento de LED muito caro"?',
      'Simulação de ROI: quanto a iluminação noturna eleva a diária de aluguel?',
      'Estrutura de proposta comercial em 3 fases para fechar contrato de R$ 60k',
      'Como convencer assembleia de condomínio a aprovar modernização de fachada?'
    ]
  }
};

const MODELS_CONFIG: Array<{
  id: GeminiModelId;
  name: string;
  badge: string;
  speed: string;
  reasoning: string;
  recommended?: boolean;
}> = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Recomendado',
    speed: 'Ultra Rápido',
    reasoning: 'Alto',
    recommended: true
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'Tarefas Gerais',
    speed: 'Rápido',
    reasoning: 'Equilibrado'
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Instantâneo',
    speed: 'Máxima Velocidade',
    reasoning: 'Ágil'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Raciocínio Profundo',
    speed: 'Analítico',
    reasoning: 'Máxima Precisão'
  }
];

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  leads,
  initialContextLead = null,
  onClearContextLead,
  isDrawerMode = false,
  onCloseDrawer
}) => {
  const [role, setRole] = useState<ChatRole>('luminotecnico');
  const [model, setModel] = useState<GeminiModelId>('gemini-3.8-flash');
  const [selectedLead, setSelectedLead] = useState<LeadTarget | null>(initialContextLead || null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize messages from localStorage or welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Falha ao ler histórico do chat:', e);
    }

    return [
      {
        id: 'msg-welcome-01',
        role: 'model',
        content: `### 👋 Olá! Sou o Assistente Especialista do Lúmina Jurerê.

Estou configurado para apoiar sua operação de captação e projetos de **iluminação arquitetural e fachadas LED de alto padrão** em Jurerê Internacional, Jurerê Tradicional e Florianópolis.

**Como posso te ajudar agora?**
- 💡 **Consultoria Técnica:** Especificação de luminárias em Inox 316 naval, fitas LED 24V, temperatura 2700K vs 3000K e IRC > 90.
- ✍️ **Abordagem VIP:** Roteiros de alta conversão para WhatsApp, áudios e e-mails para proprietários e anfitriões de mansões.
- 🔍 **Inteligência OSINT:** Estratégias para cruzar dados do GeoFloripa, Cartórios e Receita Federal para achar tomadores de decisão reais.
- 💼 **Negociação Comercial:** Quebra de objeções, justificativas de ROI e elaboração de propostas de R$ 25.000 a R$ 150.000+.

*Selecione um papel acima ou clique em uma das sugestões rápidas para começar!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash'
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialContextLead if changed externally
  useEffect(() => {
    if (initialContextLead) {
      setSelectedLead(initialContextLead);
    }
  }, [initialContextLead]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Falha ao salvar histórico do chat:', e);
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          role,
          model,
          contextLead: selectedLead ? {
            title: selectedLead.title,
            address: selectedLead.address,
            neighborhood: selectedLead.neighborhood,
            category: selectedLead.category,
            description: selectedLead.description,
            propertyDetails: selectedLead.propertyDetails,
            decisionMaker: selectedLead.decisionMaker,
            opportunity: selectedLead.opportunity
          } : null
        })
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || model
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('Erro na chamada do chat:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Não foi possível obter a resposta no momento.**\n\n${error.message || 'Verifique sua conexão ou tente novamente em instantes.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Deseja limpar todo o histórico desta conversa?')) {
      const resetMessages: ChatMessage[] = [
        {
          id: `msg-reset-${Date.now()}`,
          role: 'model',
          content: `Histórico reiniciado. O que gostaria de analisar ou consultar agora com o **${ROLE_CONFIGS[role].label}**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: model
        }
      ];
      setMessages(resetMessages);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const currentRoleConfig = ROLE_CONFIGS[role];
  const RoleIcon = currentRoleConfig.icon;

  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden ${
      isDrawerMode ? 'h-full max-h-[85vh]' : 'h-[calc(100vh-140px)] min-h-[600px] max-w-7xl mx-auto'
    }`}>
      {/* Top Header Bar */}
      <div className="bg-slate-950/80 px-4 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${currentRoleConfig.bgLight} border ${currentRoleConfig.borderColor} flex items-center justify-center shadow-xs`}>
            <RoleIcon className={`w-5 h-5 ${currentRoleConfig.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                {currentRoleConfig.label}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/20 font-medium">
                Gemini Multi-turn
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentRoleConfig.description}
            </p>
          </div>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex items-center gap-2">
          {/* Model selection */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">Modelo:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as GeminiModelId)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {MODELS_CONFIG.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Clear history */}
          <button
            onClick={handleClearHistory}
            title="Limpar histórico da conversa"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close drawer button (if in drawer mode) */}
          {isDrawerMode && onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role Selection Tabs Bar */}
      <div className="bg-slate-950/40 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Papel do Assistente:
          </span>
          {(Object.keys(ROLE_CONFIGS) as ChatRole[]).map((rKey) => {
            const cfg = ROLE_CONFIGS[rKey];
            const Icon = cfg.icon;
            const isSelected = role === rKey;
            return (
              <button
                key={rKey}
                onClick={() => setRole(rKey)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? `${cfg.bgLight} ${cfg.color} border ${cfg.borderColor} shadow-xs`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cfg.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Lead Selection Bar */}
      <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 font-medium shrink-0">Contexto do Imóvel:</span>
          {selectedLead ? (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md truncate">
              <span className="font-semibold truncate">{selectedLead.title}</span>
              <span className="text-slate-400 text-[10px]">({selectedLead.neighborhood})</span>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  if (onClearContextLead) onClearContextLead();
                }}
                className="hover:text-rose-400 transition-colors ml-1"
                title="Remover contexto específico"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-slate-500 italic">Nenhum selecionado (modo consultoria geral de Jurerê)</span>
          )}
        </div>

        {/* Lead selector dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={selectedLead?.id || ''}
            onChange={(e) => {
              const target = leads.find(l => l.id === e.target.value) || null;
              setSelectedLead(target);
            }}
            className="bg-slate-950 text-slate-300 border border-slate-700/80 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="">Focar em um imóvel específico...</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>
                {l.title.slice(0, 38)} ({l.neighborhood})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Thread (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#090d16]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {/* Avatar on Left for Model */}
              {!isUser && (
                <div className={`w-8 h-8 rounded-xl ${currentRoleConfig.bgLight} border ${currentRoleConfig.borderColor} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                  <Bot className={`w-4 h-4 ${currentRoleConfig.color}`} />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`relative group rounded-2xl px-4 py-3.5 text-sm leading-relaxed max-w-[88%] sm:max-w-[80%] ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-medium shadow-md shadow-amber-500/10 rounded-tr-none'
                    : msg.isError
                    ? 'bg-rose-950/40 border border-rose-800 text-rose-200 rounded-tl-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm rounded-tl-none'
                }`}
              >
                {/* Header metadata inside bubble */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-white/10 text-[11px] opacity-75">
                  <span className="font-bold tracking-tight">
                    {isUser ? 'Você' : `${currentRoleConfig.shortLabel}`}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Content */}
                {isUser ? (
                  <div className="whitespace-pre-wrap font-medium text-slate-950">
                    {msg.content}
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none text-slate-200 space-y-2 markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}

                {/* Copy button for model responses */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copiar texto</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar on Right for User */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-slate-200">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-4xl mr-auto justify-start animate-in fade-in duration-200">
            <div className={`w-8 h-8 rounded-xl ${currentRoleConfig.bgLight} border ${currentRoleConfig.borderColor} flex items-center justify-center shrink-0 mt-0.5`}>
              <Bot className={`w-4 h-4 ${currentRoleConfig.color} animate-pulse`} />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">{currentRoleConfig.shortLabel}</span> está formulando a análise técnica com{' '}
                <span className="text-amber-300 font-mono font-medium">{model}</span>...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Sugestões:</span>
        </div>
        {currentRoleConfig.prompts.map((p, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSendMessage(p)}
            className="text-xs bg-slate-900 hover:bg-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-all shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
        <div className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 focus-within:border-amber-400 transition-colors">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Pergunte ao ${currentRoleConfig.shortLabel} sobre fachadas LED, abordagens ou imóveis em Jurerê... (Enter envia, Shift+Enter pula linha)`}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 max-h-32"
          />

          <button
            disabled={!inputMessage.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              inputMessage.trim() && !isLoading
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
          <span>
            💡 Pressione <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Enter</kbd> para enviar ou <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Shift+Enter</kbd> para quebra de linha.
          </span>
          <span className="hidden sm:inline">
            Alimentado pela Google Gemini API • Lúmina Jurerê
          </span>
        </div>
      </div>
    </div>
  );
};
