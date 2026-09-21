import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  MapPin, 
  Filter, 
  Loader2, 
  CheckCircle, 
  Search, 
  Compass, 
  Building2, 
  Home, 
  Hotel, 
  Briefcase,
  Globe,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { LeadCategory, LeadTarget } from '../types';

interface SearchRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity: string;
  onSearchResults: (newLeads: LeadTarget[], summary: string) => void;
}

export const SearchRadarModal: React.FC<SearchRadarModalProps> = ({
  isOpen,
  onClose,
  defaultCity,
  onSearchResults
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'airbnb'>('radar');

  // Gemini Search State
  const [city, setCity] = useState(defaultCity);
  const [category, setCategory] = useState<LeadCategory | 'all'>('all');
  const [focus, setFocus] = useState<'geral' | 'fachada' | 'patio_piscina' | 'paisagismo'>('fachada');
  const [customQuery, setCustomQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Airbnb Import State
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [airbnbText, setAirbnbText] = useState('');
  const [airbnbNeighborhood, setAirbnbNeighborhood] = useState('Jurerê Internacional');
  const [airbnbLoading, setAirbnbLoading] = useState(false);
  const [airbnbWarning, setAirbnbWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSearchStep('Iniciando Gemini com Google Search Grounding...');

    try {
      setTimeout(() => {
        setSearchStep(`Mapeando dados públicos e anúncios em ${city}...`);
      }, 1200);

      setTimeout(() => {
        setSearchStep('Identificando tomadores de decisão e canais de contato...');
      }, 2500);

      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          category,
          focus,
          customQuery
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Falha ao buscar alvos.');
      }

      if (data.leads && Array.isArray(data.leads) && data.leads.length > 0) {
        onSearchResults(data.leads, data.summary || 'Alvos captados com sucesso.');
        onClose();
      } else {
        setErrorMessage(
          data.message || 
          'A IA concluiu a busca mas não encontrou novos alvos estruturados para esses termos específicos. Tente ampliar os filtros ou digitar termos como "mansões de temporada Jurerê" ou "condomínios Jurerê".'
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro inesperado ao consultar a inteligência do Gemini.');
    } finally {
      setIsLoading(false);
      setSearchStep('');
    }
  };

  const handleAirbnbImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airbnbUrl.trim() && !airbnbText.trim()) {
      setAirbnbWarning('Por favor, informe a URL do anúncio Airbnb ou cole o texto com comodidades.');
      return;
    }

    setAirbnbLoading(true);
    setAirbnbWarning(null);

    try {
      const response = await fetch('/api/airbnb/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: airbnbUrl.trim(),
          listingText: airbnbText.trim(),
          neighborhoodHint: airbnbNeighborhood
        })
      });

      const data = await response.json();

      if (data.blocked) {
        // Honest notification of anti-bot block, asking to paste text without pretending
        setAirbnbWarning(data.message);
        return;
      }

      if (data.lead) {
        onSearchResults([data.lead], `Imóvel Airbnb "${data.lead.title}" importado com sucesso.`);
        onClose();
      } else {
        setAirbnbWarning(data.message || 'Não foi possível estruturar o imóvel a partir dos dados informados.');
      }
    } catch (err: any) {
      setAirbnbWarning(err.message || 'Erro de conexão ao processar dados do Airbnb.');
    } finally {
      setAirbnbLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isLoading || airbnbLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            {activeTab === 'radar' ? <Sparkles className="w-5 h-5" /> : <Globe className="w-5 h-5 text-rose-400" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {activeTab === 'radar' ? 'Radar Gemini de Captação' : 'Importação Direta de Anúncio Airbnb'}
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold uppercase border border-emerald-500/30">
                Integridade Factual
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === 'radar' 
                ? 'Google Search Grounding: locais, condomínios e estabelecimentos com fontes públicas auditáveis'
                : 'Extração estruturada de comodidades de iluminação, anfitrião e proposta de valorização'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => { setActiveTab('radar'); setErrorMessage(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Radar Grounding (Web)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('airbnb'); setErrorMessage(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'airbnb'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Anúncio Airbnb (URL / Texto)</span>
          </button>
        </div>

        {/* Mode 1: Gemini Search */}
        {activeTab === 'radar' && (
          <>
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl mb-4 leading-relaxed">
                <span className="font-bold block mb-1">Aviso:</span>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
              {/* City / Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Cidade ou Bairro Alvo:
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Jurerê Internacional, Florianópolis - SC"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    'Jurerê Internacional, Florianópolis',
                    'Jurerê Tradicional, Florianópolis',
                    'Canasvieiras, Florianópolis'
                  ].map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setCity(loc)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                    >
                      {loc.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  Segmento de Imóvel:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'all', label: 'Todos os Alvos', icon: Compass },
                    { id: 'mansion_rental', label: 'Mansões de Temporada', icon: Home },
                    { id: 'condo_residential', label: 'Condomínios', icon: Building2 },
                    { id: 'boutique_hotel', label: 'Pousadas Boutique', icon: Hotel },
                    { id: 'commercial_venue', label: 'Beach Clubs / Lounges', icon: Compass },
                    { id: 'architect_partner', label: 'Arquitetos Parceiros', icon: Briefcase }
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id as any)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lighting Focus */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Foco Técnico de Iluminação LED:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'fachada', label: 'Fachada Cênica' },
                    { id: 'patio_piscina', label: 'Pátio & Piscina' },
                    { id: 'paisagismo', label: 'Jardim & Árvores' },
                    { id: 'geral', label: 'Completo / Geral' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setFocus(item.id as any)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                        focus === item.id
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Query or Specific Street */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Termo específico ou Rua (Opcional):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ex: "Av. dos Búzios", "mansões canal", "open shopping"</span>
                </label>
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Ex: casas com piscina ampla na Alameda dos Namorados"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* Submission button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{searchStep || 'Consultando a Web com Gemini...'}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Disparar Radar de Captação</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Mode 2: Airbnb Import */}
        {activeTab === 'airbnb' && (
          <form onSubmit={handleAirbnbImport} className="space-y-4">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Diretriz de Transparência Técnica:</strong> O Airbnb bloqueia leituras automatizadas por robôs. Se a URL direta não responder, copie e cole o título e a descrição pública do anúncio no campo abaixo para extrair comodidades, anfitrião e proposta comercial de LED.
              </div>
            </div>

            {airbnbWarning && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Aviso do Sistema:</span>
                  {airbnbWarning}
                </div>
              </div>
            )}

            {/* Airbnb URL input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                URL ou ID do Anúncio Airbnb:
              </label>
              <input
                type="text"
                value={airbnbUrl}
                onChange={(e) => setAirbnbUrl(e.target.value)}
                placeholder="Ex: https://www.airbnb.com.br/rooms/12345678"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Ex: https://www.airbnb.com.br/rooms/98765432
              </span>
            </div>

            {/* Neighborhood selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bairro / Localidade em Florianópolis:
              </label>
              <select
                value={airbnbNeighborhood}
                onChange={(e) => setAirbnbNeighborhood(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
              >
                <option value="Jurerê Internacional">Jurerê Internacional</option>
                <option value="Jurerê Tradicional">Jurerê Tradicional</option>
                <option value="Canasvieiras">Canasvieiras</option>
              </select>
            </div>

            {/* Pasted text option */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Conteúdo Público do Anúncio (Título, Comodidades, Descrição, Anfitrião):
                </span>
                <span className="text-[10px] text-amber-400 font-normal">Recomendado</span>
              </label>
              <textarea
                value={airbnbText}
                onChange={(e) => setAirbnbText(e.target.value)}
                rows={5}
                placeholder="Cole aqui o texto copiado do anúncio: título da mansão, anfitrião declarado, comodidades (piscina, hidromassagem, espaço gourmet, beirais, jardim), regras e detalhes..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                A IA detecta automaticamente áreas externas (piscina, deck, jardim), estilo arquitetônico e gera o ticket e pitch de iluminação LED.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={airbnbLoading}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {airbnbLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando e Estruturando Imóvel...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Importar e Estruturar Imóvel</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

