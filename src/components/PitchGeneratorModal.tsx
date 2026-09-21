import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Phone, 
  Instagram, 
  Mail, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import { LeadTarget } from '../types';

interface PitchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadTarget | null;
}

export const PitchGeneratorModal: React.FC<PitchGeneratorModalProps> = ({
  isOpen,
  onClose,
  lead
}) => {
  const [channel, setChannel] = useState<'whatsapp' | 'instagram' | 'email' | 'cold_call'>('whatsapp');
  const [tone, setTone] = useState<'exclusivo_luxo' | 'custo_beneficio_valorizacao' | 'parceria_comissao'>('exclusivo_luxo');
  const [isLoading, setIsLoading] = useState(false);
  const [pitchData, setPitchData] = useState<{
    subject?: string;
    message: string;
    followUpHint?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && lead) {
      generatePitch(channel, tone);
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const generatePitch = async (selectedChannel = channel, selectedTone = tone) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCopied(false);

    try {
      const response = await fetch('/api/leads/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          channel: selectedChannel,
          tone: selectedTone
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Falha ao gerar pitch.');
      }

      setPitchData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao gerar abordagem com Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!pitchData) return;
    const textToCopy = pitchData.subject 
      ? `Assunto: ${pitchData.subject}\n\n${pitchData.message}` 
      : pitchData.message;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetWhatsappNumber = lead.contactChannels?.whatsapp || lead.contactChannels?.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = targetWhatsappNumber
    ? `https://wa.me/${targetWhatsappNumber}?text=${encodeURIComponent(pitchData?.message || '')}`
    : `https://wa.me/?text=${encodeURIComponent(pitchData?.message || '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Gerador de Abordagem Personalizada
            </h2>
            <p className="text-xs text-slate-400">
              Alvo: <strong className="text-slate-200">{lead.title}</strong> ({lead.neighborhood})
            </p>
          </div>
        </div>

        {/* Target Profile Bar */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 mb-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-400">Tomador de Decisão: </span>
            <strong className="text-amber-300">{lead.decisionMaker.role}</strong>
          </div>
          <div>
            <span className="text-slate-400">Pacote LED: </span>
            <strong className="text-emerald-400">{lead.opportunity.recommendedType}</strong>
          </div>
        </div>

        {/* Channel Selection Buttons */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Canal de Comunicação:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'whatsapp', label: 'WhatsApp', icon: Send },
              { id: 'instagram', label: 'Instagram DM', icon: Instagram },
              { id: 'cold_call', label: 'Roteiro de Ligação', icon: Phone },
              { id: 'email', label: 'E-mail Comercial', icon: Mail }
            ].map((c) => {
              const Icon = c.icon;
              const isSelected = channel === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setChannel(c.id as any);
                    generatePitch(c.id as any, tone);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tom de Voz da Mensagem:
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { id: 'exclusivo_luxo', label: 'Exclusivo & Luxo' },
              { id: 'custo_beneficio_valorizacao', label: 'Valorização & Retorno' },
              { id: 'parceria_comissao', label: 'Parceria / Técnico' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTone(t.id as any);
                  generatePitch(channel, t.id as any);
                }}
                className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                  tone === t.id
                    ? 'bg-slate-700 text-amber-300 border-amber-400/50 font-semibold'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl mb-4">
            {errorMessage}
          </div>
        )}

        {/* Output View */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative mb-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span>Gerando abordagem irresistível com IA...</span>
            </div>
          ) : pitchData ? (
            <div className="space-y-3">
              {pitchData.subject && (
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[11px] text-slate-400 font-semibold block">Assunto Sugerido:</span>
                  <div className="text-xs text-amber-300 font-medium">{pitchData.subject}</div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold">Texto da Mensagem:</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {pitchData.message.length} caracteres
                  </span>
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 select-all">
                  {pitchData.message}
                </div>
              </div>

              {pitchData.followUpHint && (
                <div className="text-[11px] text-slate-400 bg-amber-500/5 border border-amber-500/15 p-2.5 rounded-lg flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Dica de Follow-up: </strong>
                    {pitchData.followUpHint}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => generatePitch(channel, tone)}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gerar Outra Versão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isLoading || !pitchData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Mensagem</span>
                </>
              )}
            </button>

            {channel === 'whatsapp' && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Abrir no WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
