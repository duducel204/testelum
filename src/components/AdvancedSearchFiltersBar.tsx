import React, { useState } from 'react';
import { 
  AdvancedSearchFilters, 
  PropertyType, 
  LeadCategory 
} from '../types';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  Home, 
  Building2, 
  Hotel, 
  Compass, 
  Maximize2, 
  Calendar, 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Database,
  RefreshCw,
  Undo2
} from 'lucide-react';

interface AdvancedSearchFiltersBarProps {
  filters: AdvancedSearchFilters;
  onFilterChange: (filters: AdvancedSearchFilters) => void;
  onResetFilters: () => void;
  totalResults: number;
  totalDatabaseCount: number;
  pendingValidationCount?: number;
  needsReviewCount?: number;
  onTriggerDeduplication?: () => void;
  onRestoreBackup?: () => void;
  hasBackup?: boolean;
}

export const AdvancedSearchFiltersBar: React.FC<AdvancedSearchFiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  totalDatabaseCount,
  pendingValidationCount = 0,
  needsReviewCount = 0,
  onTriggerDeduplication,
  onRestoreBackup,
  hasBackup = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    filters.searchTerm ? 1 : 0,
    filters.propertyType !== 'all' ? 1 : 0,
    filters.minAreaM2 !== '' || filters.maxAreaM2 !== '' ? 1 : 0,
    filters.yearRange !== 'all' ? 1 : 0,
    filters.lightingPriority !== 'all' ? 1 : 0,
    filters.category !== 'all' ? 1 : 0,
    filters.zone !== 'all' ? 1 : 0,
    filters.neighborhoodFilter && filters.neighborhoodFilter !== 'all' ? 1 : 0,
    filters.originFilter && filters.originFilter !== 'all' ? 1 : 0,
    filters.evidenceFilter && filters.evidenceFilter !== 'all' ? 1 : 0,
    filters.contactFilter && filters.contactFilter !== 'all' ? 1 : 0,
    filters.reviewQueueFilter && filters.reviewQueueFilter !== 'all' ? 1 : 0,
  ].reduce((acc, curr) => acc + curr, 0);

  const handleSizeQuickFilter = (min: number | '', max: number | '') => {
    onFilterChange({
      ...filters,
      minAreaM2: min,
      maxAreaM2: max
    });
  };

  const togglePendingValidationQueue = () => {
    if (filters.reviewQueueFilter === 'pending_validation') {
      onFilterChange({ ...filters, reviewQueueFilter: 'all' });
    } else {
      onFilterChange({ ...filters, reviewQueueFilter: 'pending_validation' });
    }
  };

  const toggleNeedsReviewQueue = () => {
    if (filters.reviewQueueFilter === 'needs_review') {
      onFilterChange({ ...filters, reviewQueueFilter: 'all' });
    } else {
      onFilterChange({ ...filters, reviewQueueFilter: 'needs_review' });
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-lg mb-6 transition-all">
      {/* Primary Search Bar + Key Filter Quick Switches */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            placeholder="Buscar por imóvel, alameda, síndico, CNPJ, matrícula..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/90 text-sm text-white placeholder-slate-400 rounded-xl border border-slate-700/80 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
          {filters.searchTerm && (
            <button
              onClick={() => onFilterChange({ ...filters, searchTerm: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Queues and Property Type Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {/* Quick Queue: Validar Contato Antes da Abordagem */}
          <button
            onClick={togglePendingValidationQueue}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
              filters.reviewQueueFilter === 'pending_validation'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                : 'bg-slate-800/90 text-amber-300 border-amber-500/30 hover:bg-amber-500/15'
            }`}
            title="Fila de alvos que necessitam de conferência de contato antes do disparo"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fila Validar Contato</span>
            {pendingValidationCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.reviewQueueFilter === 'pending_validation'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {pendingValidationCount}
              </span>
            )}
          </button>

          {/* Quick Queue: Necessitam Revisão (se houver conflitos) */}
          {needsReviewCount > 0 && (
            <button
              onClick={toggleNeedsReviewQueue}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                filters.reviewQueueFilter === 'needs_review'
                  ? 'bg-rose-500 text-white font-bold border-rose-400 shadow-sm'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              }`}
              title="Alvos com divergência cadastral ou status mesclado para auditoria"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Revisão ({needsReviewCount})</span>
            </button>
          )}

          {/* Quick Property Types */}
          <button
            onClick={() => onFilterChange({ ...filters, propertyType: 'all', reviewQueueFilter: 'all' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filters.propertyType === 'all' && (!filters.reviewQueueFilter || filters.reviewQueueFilter === 'all')
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, propertyType: 'casa' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filters.propertyType === 'casa'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Mansões</span>
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, propertyType: 'apartamento' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filters.propertyType === 'apartamento'
                ? 'bg-blue-500 text-white font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Condomínios</span>
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, propertyType: 'comercial' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filters.propertyType === 'comercial'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Comerciais</span>
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, propertyType: 'pousada_hotel' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filters.propertyType === 'pousada_hotel'
                ? 'bg-purple-500 text-white font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <Hotel className="w-3.5 h-3.5" />
            <span>Pousadas</span>
          </button>

          {/* Toggle Advanced Filters Drawer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              isExpanded || activeFiltersCount > 0
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtros Operacionais</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Advanced Filters Panel */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
          
          {/* 1. Bairro (Filtro de Operação) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Bairro / Região</span>
            </label>
            <select
              value={filters.neighborhoodFilter || 'all'}
              onChange={(e) => onFilterChange({ ...filters, neighborhoodFilter: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Bairros</option>
              <option value="jurere_internacional">Jurerê Internacional</option>
              <option value="jurere_tradicional">Jurerê Tradicional</option>
              <option value="to_confirm">Canasvieiras / Outros</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Segmentação territorial direta para rotas de visita técnica.
            </p>
          </div>

          {/* 2. Origem do Dado */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Origem do Dado</span>
            </label>
            <select
              value={filters.originFilter || 'all'}
              onChange={(e) => onFilterChange({ ...filters, originFilter: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todas as Origens</option>
              <option value="official_site">Google Search Grounding / Sites Oficiais</option>
              <option value="airbnb">Anúncio Airbnb (Temporada)</option>
              <option value="public_registry">Receita Federal / GeoFloripa PMF</option>
              <option value="manual">Prospecção Manual</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Filtre pela procedência documental de cada registro.
            </p>
          </div>

          {/* 3. Nível de Evidência / Confiabilidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nível de Evidência Factual</span>
            </label>
            <select
              value={filters.evidenceFilter || 'all'}
              onChange={(e) => onFilterChange({ ...filters, evidenceFilter: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Níveis</option>
              <option value="manually_confirmed">Alta Confiabilidade (Auditado Manualmente)</option>
              <option value="public_evidence_found">Média/Alta (Evidência Pública em Links/RFB)</option>
              <option value="pending">Pendente de Validação Documental</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Separação rigorosa entre fatos documentados e estimativas.
            </p>
          </div>

          {/* 4. Status de Validação do Contato */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Validação do Contato</span>
            </label>
            <select
              value={filters.contactFilter || 'all'}
              onChange={(e) => onFilterChange({ ...filters, contactFilter: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Contatos</option>
              <option value="has_contact">Apenas com Telefone ou WhatsApp Cadastrado</option>
              <option value="no_contact">Contatos a Pesquisar / Sem Telefone Direto</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Foque nos alvos prontos para ligação ou nos que exigem OSINT.
            </p>
          </div>

          {/* 5. Tamanho do Imóvel (m²) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Tamanho do Imóvel (m² construídos)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín m²"
                value={filters.minAreaM2}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  minAreaM2: e.target.value ? Number(e.target.value) : '' 
                })}
                className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
              />
              <span className="text-slate-500 text-xs">até</span>
              <input
                type="number"
                placeholder="Máx m²"
                value={filters.maxAreaM2}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  maxAreaM2: e.target.value ? Number(e.target.value) : '' 
                })}
                className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              <button
                onClick={() => handleSizeQuickFilter(500, '')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                +500 m²
              </button>
              <button
                onClick={() => handleSizeQuickFilter(800, '')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                +800 m²
              </button>
            </div>
          </div>

          {/* 6. Prioridade Técnica LED */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Prioridade de Iluminação</span>
            </label>
            <select
              value={filters.lightingPriority}
              onChange={(e) => onFilterChange({ ...filters, lightingPriority: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todas as prioridades</option>
              <option value="alta">Alta Prioridade (Oportunidade Imediata)</option>
              <option value="media">Prioridade Média (Retrofit / Médio Prazo)</option>
              <option value="baixa">Baixa Prioridade / Monitoramento</option>
            </select>
          </div>

          {/* 7. Ações de Integridade e Deduplicação */}
          <div className="sm:col-span-2 space-y-1.5 bg-slate-850 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Auditoria & Deduplicação Cadastral</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Normaliza nomes e endereços, unifica fontes documentais e previne duplicidade. Gera backup automático em cache antes de qualquer ajuste.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {onTriggerDeduplication && (
                <button
                  type="button"
                  onClick={onTriggerDeduplication}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auditar & Deduplicar Base</span>
                </button>
              )}
              {hasBackup && onRestoreBackup && (
                <button
                  type="button"
                  onClick={onRestoreBackup}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                  title="Reverter para o backup salvo antes da última normalização"
                >
                  <Undo2 className="w-3 h-3 text-slate-400" />
                  <span>Restaurar Backup</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Results Bar & Active Filter Reset */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Exibindo <strong className="text-white">{totalResults}</strong> de <strong className="text-slate-300">{totalDatabaseCount}</strong> imóveis coletados
          </span>
          {activeFiltersCount > 0 && (
            <span className="text-amber-400 font-medium">
              ({activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''})
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>
    </div>
  );
};

