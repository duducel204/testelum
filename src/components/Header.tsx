import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Lightbulb, 
  TrendingUp, 
  FileSpreadsheet, 
  Search, 
  PlusCircle, 
  BookOpen, 
  Layers,
  Map as MapIcon,
  Database,
  Bot
} from 'lucide-react';

interface HeaderProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  activeTab: 'radar' | 'map' | 'pipeline' | 'investigator' | 'public_db' | 'osint' | 'ai_chat';
  onTabChange: (tab: 'radar' | 'map' | 'pipeline' | 'investigator' | 'public_db' | 'osint' | 'ai_chat') => void;
  totalLeads: number;
  contactedCount: number;
  scheduledVisits: number;
  totalEstimatedPipeline: string;
  onOpenNewSearch: () => void;
  onOpenAddLead: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onCityChange,
  activeTab,
  onTabChange,
  totalLeads,
  contactedCount,
  scheduledVisits,
  totalEstimatedPipeline,
  onOpenNewSearch,
  onOpenAddLead,
  onOpenExport
}) => {
  const popularCities = [
    'Jurerê Internacional, Florianópolis - SC',
    'Jurerê Tradicional, Florianópolis - SC',
    'Balneário Camboriú - SC',
    'Itapema - SC',
    'Praia Brava, Itajaí - SC'
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Brand & Regional Context */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              <Lightbulb className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Lúmina Jurerê
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    Radar LED Pro
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Prospecção e conexão com tomadores de decisão para iluminação cênica e fachadas LED
              </p>
            </div>
          </div>

          {/* City / Target Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 px-2.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-200">Região Alvo:</span>
            </div>
            <select
              value={currentCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-slate-900 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
            >
              {popularCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buscar com Gemini IA</span>
            </button>
            <button
              onClick={onOpenAddLead}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
              title="Cadastrar imóvel manualmente"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Adicionar Alvo</span>
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
              title="Exportar para Google Sheets ou WhatsApp"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Metrics Strip */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onTabChange('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'radar'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Radar de Alvos ({totalLeads})</span>
            </button>

            <button
              onClick={() => onTabChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Mapa Interativo</span>
            </button>

            <button
              onClick={() => onTabChange('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'pipeline'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Funil de Captação</span>
            </button>

            <button
              onClick={() => onTabChange('investigator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'investigator'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Investigar Endereço</span>
            </button>

            <button
              onClick={() => onTabChange('public_db')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'public_db'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bancos Públicos (CNPJ/Geo)</span>
            </button>

            <button
              onClick={() => onTabChange('osint')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'osint'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Métodos Gratuitos OSINT</span>
            </button>

            <button
              onClick={() => onTabChange('ai_chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ai_chat'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Auxílio IA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Chatbot
              </span>
            </button>
          </nav>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs text-slate-400 self-end md:self-auto">
            <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Projetos Potenciais: <strong className="text-amber-200">{totalEstimatedPipeline}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
