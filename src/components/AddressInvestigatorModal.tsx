import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  MapPin, 
  Search, 
  Loader2, 
  ExternalLink, 
  PlusCircle, 
  Lightbulb, 
  Compass, 
  CheckCircle2, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { LeadTarget } from '../types';

interface AddressInvestigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity: string;
  initialTargetName?: string;
  initialAddress?: string;
  onSaveAsLead: (lead: LeadTarget) => void;
}

export const AddressInvestigatorModal: React.FC<AddressInvestigatorModalProps> = ({
  isOpen,
  onClose,
  defaultCity,
  initialTargetName = '',
  initialAddress = '',
  onSaveAsLead
}) => {
  const [targetName, setTargetName] = useState(initialTargetName);
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(defaultCity);
  const [contextNotes, setContextNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInvestigate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await fetch('/api/leads/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName,
          address,
          city,
          contextNotes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Falha ao investigar imóvel.');
      }

      setResult(data.investigation);
      setSources(data.sources || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao realizar investigação com Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToLead = () => {
    if (!result) return;
    const timestamp = new Date().toISOString();
    const newLead: LeadTarget = {
      id: `investigated-lead-${Date.now()}`,
      title: result.identifiedProperty || targetName || 'Imóvel Investigado',
      category: result.likelyOwnerType?.toLowerCase().includes('condom') ? 'condo_residential' : 'mansion_rental',
      city,
      neighborhood: 'Jurerê',
      address: address || 'Endereço apurado em Jurerê',
      description: result.lightingAudit?.highlights || 'Imóvel investigado via OSINT Gemini.',
      decisionMaker: {
        role: result.likelyOwnerType || 'Proprietário / Tomador de Decisão',
        name: 'A confirmar pelo canal indicado',
        decisionPower: 'Direto',
        strategy: result.contactSuggestion?.hook || 'Abordagem técnica com foco em valorização estética.'
      },
      contactChannels: {
        whatsapp: '',
        phone: '',
        instagram: '',
        website: sources[0]?.uri || ''
      },
      opportunity: {
        facadePotential: 5,
        patioPoolPotential: 4,
        gardenPotential: 4,
        recommendedType: result.lightingAudit?.recommendations || 'Iluminação Cênica em LED para Fachada',
        estimatedTicket: 'R$ 25.000 - R$ 50.000',
        keySellingPoint: result.contactSuggestion?.hook || 'Valorização imediata do imóvel.'
      },
      status: 'novo',
      history: [
        {
          id: `h-${Date.now()}`,
          date: timestamp.split('T')[0],
          action: 'Investigação Concluída',
          note: 'Investigado via OSINT Gemini.'
        }
      ],
      source: 'Investigador de Endereço Gemini',
      groundingSources: sources,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    onSaveAsLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Investigador de Endereço & Proprietário
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                OSINT Gratuito
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Descubra a melhor trilha na internet para chegar em quem decide a instalação de LED
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleInvestigate} className="space-y-3 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Imóvel / Condomínio / Referência:
              </label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="Ex: Condomínio Premier Jurerê ou Mansão do Canal"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Endereço ou Rua em Jurerê:
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Av. dos Búzios, próx. ao nº 1200"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas ou Detalhes Observados (Opcional):
            </label>
            <input
              type="text"
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Ex: Fachada de vidro enorme sem luz, parece aluguel de temporada, tem placa de segurança..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Investigando cruzamento de dados públicos com Gemini...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Rastrear Caminho do Tomador de Decisão</span>
              </>
            )}
          </button>

          {/* Quick links to Public Databases */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Bases Públicas Oficiais Integradas:</span>
            <div className="flex items-center gap-3">
              <a
                href="https://geofloripa.pmf.sc.gov.br/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
              >
                <ExternalLink className="w-3 h-3" />
                GeoFloripa (PMF Lotes)
              </a>
              <a
                href="https://brasilapi.com.br/"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
              >
                <ExternalLink className="w-3 h-3" />
                Receita Federal (CNPJ/QSA)
              </a>
            </div>
          </div>
        </form>

        {/* Results view */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header of the property */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Diagnóstico do Imóvel
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  {result.likelyOwnerType || 'Proprietário Mapeado'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {result.identifiedProperty || targetName || address}
              </h3>
            </div>

            {/* Decision Maker Trail */}
            {result.decisionMakerTrail && Array.isArray(result.decisionMakerTrail) && (
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Trilha Prática para Conectar com o Tomador de Decisão:
                </h4>
                <div className="space-y-2.5">
                  {result.decisionMakerTrail.map((trail: any, idx: number) => (
                    <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-200 mb-0.5">
                          {trail.method || `Caminho ${idx + 1}`}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{trail.actionableDetails}</p>
                        {trail.contactFound && (
                          <div className="mt-1.5 inline-block text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                            Contato Identificado: {trail.contactFound}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Suggestion & Hook */}
            {result.contactSuggestion && (
              <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Gancho de Abordagem Recomendado:
                </h4>
                <div className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed italic">
                  "{result.contactSuggestion.hook}"
                </div>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                  <span>Canal Recomendado: <strong className="text-white">{result.contactSuggestion.recommendedChannel}</strong></span>
                  {result.contactSuggestion.bestTimeToContact && (
                    <span>Horário Ideal: <strong className="text-white">{result.contactSuggestion.bestTimeToContact}</strong></span>
                  )}
                </div>
              </div>
            )}

            {/* Lighting Audit */}
            {result.lightingAudit && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Auditoria de Iluminação LED para Apresentação:
                </h4>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  <strong className="text-amber-300">Pontos de Destaque: </strong>
                  {result.lightingAudit.highlights}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-300">Proposta de Projeto: </strong>
                  {result.lightingAudit.recommendations}
                </p>
              </div>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <div className="text-xs">
                <span className="text-slate-400 font-semibold block mb-1">Fontes Públicas Consultadas:</span>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:underline bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1"
                    >
                      {s.title || s.uri}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleConvertToLead}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Salvar este Imóvel no Radar de Captação</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
