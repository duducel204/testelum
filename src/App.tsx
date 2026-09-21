import React, { useState, useEffect, useMemo } from 'react';
import { 
  LeadTarget, 
  LeadStatus, 
  LeadCategory,
  AdvancedSearchFilters
} from './types';
import { INITIAL_LEADS } from './data/initialData';
import { 
  auditAndDeduplicateLeads, 
  restoreLatestBackup 
} from './utils/deduplication';
import { Header } from './components/Header';
import { LeadCard } from './components/LeadCard';
import { SearchRadarModal } from './components/SearchRadarModal';
import { AddressInvestigatorModal } from './components/AddressInvestigatorModal';
import { PitchGeneratorModal } from './components/PitchGeneratorModal';
import { PipelineView } from './components/PipelineView';
import { OsintGuideView } from './components/OsintGuideView';
import { PublicDatabaseView } from './components/PublicDatabaseView';
import { AddLeadModal } from './components/AddLeadModal';
import { ExportModal } from './components/ExportModal';
import { InteractiveMapView } from './components/InteractiveMapView';
import { AdvancedSearchFiltersBar } from './components/AdvancedSearchFiltersBar';
import { PropertyProfileModal } from './components/PropertyProfileModal';
import { InstagramIntelligenceModal } from './components/InstagramIntelligenceModal';
import { SocialIntelligenceModal } from './components/SocialIntelligenceModal';
import { AiChatAssistant } from './components/AiChatAssistant';
import { 
  Search, 
  Sparkles, 
  Filter, 
  SlidersHorizontal, 
  PlusCircle, 
  Building2, 
  Home, 
  Hotel, 
  Compass, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Map as MapIcon,
  LayoutGrid,
  FileSpreadsheet,
  Bot
} from 'lucide-react';

const STORAGE_KEY = 'lumina_jurere_leads_v1';
const MIGRATION_FLAG_KEY = 'lumina_jurere_v3_dedup_integrity';

const defaultFilters: AdvancedSearchFilters = {
  searchTerm: '',
  propertyType: 'all',
  minAreaM2: '',
  maxAreaM2: '',
  yearRange: 'all',
  lightingPriority: 'all',
  category: 'all',
  status: 'all',
  zone: 'all',
  neighborhoodFilter: 'all',
  originFilter: 'all',
  evidenceFilter: 'all',
  contactFilter: 'all',
  reviewQueueFilter: 'all'
};

export default function App() {
  // Leads list state with local persistence and automatic deduplication
  const [leads, setLeads] = useState<LeadTarget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const audit = auditAndDeduplicateLeads(parsed);
          return audit.cleanedLeads;
        }
      }
    } catch (e) {
      console.warn('Falha ao ler cache local de leads:', e);
    }
    const audit = auditAndDeduplicateLeads(INITIAL_LEADS);
    return audit.cleanedLeads;
  });

  const [currentCity, setCurrentCity] = useState<string>('Jurerê Internacional, Florianópolis - SC');
  const [activeTab, setActiveTab] = useState<'radar' | 'map' | 'pipeline' | 'investigator' | 'public_db' | 'osint' | 'ai_chat'>('radar');

  // Advanced Search & Filter State
  const [filters, setFilters] = useState<AdvancedSearchFilters>(defaultFilters);

  // Modals state
  const [isSearchRadarOpen, setIsSearchRadarOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [pitchTargetLead, setPitchTargetLead] = useState<LeadTarget | null>(null);
  const [investigateLead, setInvestigateLead] = useState<{ name: string; address: string } | null>(null);
  const [selectedProfileLead, setSelectedProfileLead] = useState<LeadTarget | null>(null);
  const [instagramIntelLead, setInstagramIntelLead] = useState<LeadTarget | null>(null);
  const [socialIntelLead, setSocialIntelLead] = useState<LeadTarget | null>(null);
  const [focusMapLeadId, setFocusMapLeadId] = useState<string | null>(null);
  const [chatContextLead, setChatContextLead] = useState<LeadTarget | null>(null);
  const [hasBackup, setHasBackup] = useState<boolean>(() => {
    return !!localStorage.getItem('lumina_jurere_backup_latest');
  });

  // Notification toast banner
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  // Safe initial migration: if not migrated yet, deduplicate existing data and save backup
  useEffect(() => {
    const isMigrated = localStorage.getItem(MIGRATION_FLAG_KEY);
    if (!isMigrated) {
      const auditResult = auditAndDeduplicateLeads(leads);
      setLeads(auditResult.cleanedLeads);
      setHasBackup(true);
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      if (auditResult.duplicatesRemoved > 0) {
        showToast(`Auditoria inicial: ${auditResult.duplicatesRemoved} registro(s) duplicado(s) mesclado(s) com backup salvo.`);
      }
    }
  }, []);

  // Save leads to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.warn('Erro ao salvar leads:', e);
    }
  }, [leads]);

  // Status changer
  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const timestamp = new Date().toISOString().split('T')[0];
          return {
            ...l,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            history: [
              {
                id: `h-${Date.now()}`,
                date: timestamp,
                action: `Status alterado para ${newStatus}`,
                note: `Atualizado no painel de prospecção.`
              },
              ...l.history
            ]
          };
        }
        return l;
      })
    );
    showToast(`Status atualizado para: ${newStatus.toUpperCase()}`);
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Deseja realmente remover este imóvel do radar?')) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      showToast('Imóvel removido.');
    }
  };

  // Update notes
  const handleUpdateNotes = (leadId: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes, updatedAt: new Date().toISOString() } : l))
    );
    showToast('Notas de contato salvas.');
  };

  // Add new leads from Gemini Search Grounding or Airbnb with automatic deduplication
  const handleNewSearchResults = (newLeads: LeadTarget[], summary: string) => {
    setLeads((prev) => {
      const combined = [...newLeads, ...prev];
      const auditResult = auditAndDeduplicateLeads(combined);
      setHasBackup(true);
      return auditResult.cleanedLeads;
    });
    showToast(`Radar concluído! ${newLeads.length} novos alvos identificados com deduplicação aplicada.`);
  };

  // Trigger manual base audit & deduplication
  const handleTriggerDeduplication = () => {
    const result = auditAndDeduplicateLeads(leads);
    setLeads(result.cleanedLeads);
    setHasBackup(true);
    showToast(
      `Auditoria concluída: ${result.duplicatesRemoved} duplicata(s) mesclada(s), ${result.conflictsMarked} conflito(s) em revisão. Backup salvo!`
    );
  };

  // Restore previous snapshot backup
  const handleRestoreBackup = () => {
    const restored = restoreLatestBackup();
    if (restored && restored.length > 0) {
      setLeads(restored);
      showToast(`Backup restaurado com sucesso! (${restored.length} imóveis recuperados)`);
    } else {
      showToast('Nenhum snapshot de backup anterior encontrado.');
    }
  };

  // Mark contact as manually validated by the operator
  const handleVerifyContact = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const timestamp = new Date().toISOString().split('T')[0];
          return {
            ...l,
            contactVerificationStatus: 'manually_confirmed',
            isVerifiedRealContact: true,
            dataReliabilityScore: Math.max(l.dataReliabilityScore ?? 85, 85),
            updatedAt: new Date().toISOString(),
            history: [
              {
                id: `h-val-${Date.now()}`,
                date: timestamp,
                action: 'Contato Conferido e Validado',
                note: 'Auditado manualmente pelo operador antes da abordagem.'
              },
              ...l.history
            ]
          };
        }
        return l;
      })
    );
    showToast('Contato marcado como conferido com sucesso!');
  };

  // Resolve conflict / review flag
  const handleResolveReview = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const timestamp = new Date().toISOString().split('T')[0];
          return {
            ...l,
            needsReview: false,
            updatedAt: new Date().toISOString(),
            history: [
              {
                id: `h-res-${Date.now()}`,
                date: timestamp,
                action: 'Revisão Concluída',
                note: 'Conflito de dados resolvido pelo operador.'
              },
              ...l.history
            ]
          };
        }
        return l;
      })
    );
    showToast('Revisão concluída para este imóvel.');
  };

  // Add single manual lead
  const handleAddSingleLead = (newLead: LeadTarget) => {
    setLeads((prev) => {
      const combined = [newLead, ...prev];
      const auditResult = auditAndDeduplicateLeads(combined);
      return auditResult.cleanedLeads;
    });
    showToast(`Alvo "${newLead.title}" cadastrado com sucesso.`);
  };

  // Import lead from Public Database (CNPJ / GeoFloripa / Matrícula)
  const handleImportPublicLead = (partialLead: Partial<LeadTarget>) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullLead: LeadTarget = {
      id: `pub-lead-${Date.now()}`,
      title: partialLead.title || 'Imóvel / Condomínio Jurerê',
      category: partialLead.category || 'condo_residential',
      city: partialLead.city || 'Florianópolis - SC',
      neighborhood: partialLead.neighborhood || 'Jurerê Internacional',
      address: partialLead.address || 'Jurerê Internacional, Florianópolis - SC',
      description: partialLead.description || 'Cadastrado a partir de dados públicos da Receita Federal e PMF.',
      matricula: partialLead.matricula || partialLead.propertyDetails?.cadastralDetails?.matricula,
      inscricaoImobiliaria: partialLead.inscricaoImobiliaria || partialLead.propertyDetails?.cadastralDetails?.inscricaoImobiliaria,
      coordinates: partialLead.coordinates || {
        lat: -27.4392 + (Math.random() - 0.5) * 0.012,
        lng: -48.4975 + (Math.random() - 0.5) * 0.012,
      },
      propertyDetails: partialLead.propertyDetails || {
        propertyType: partialLead.category === 'commercial_venue' ? 'comercial' : 'apartamento',
        builtAreaM2: 2400,
        lotAreaM2: 3800,
        yearBuilt: 2014,
        cadastralDetails: {
          matricula: partialLead.matricula,
          inscricaoImobiliaria: partialLead.inscricaoImobiliaria,
          cartorio: '2º Ofício de Registro de Imóveis de Florianópolis',
          loteamento: 'Jurerê Internacional',
          zoneamento: 'ARP-2.5 (Área Residencial Predominante)',
        },
        architecturalDetails: {
          style: 'Contemporâneo com Pórtico e Esquadrias Minimalistas',
          exteriorMaterials: ['Concreto Aparente', 'Vidro Duplo', 'Aço com Pintura Naval'],
          roofAndEaves: 'Beirais lineares com recortes para iluminação indireta',
          floors: 3,
          facadeWidthMeters: 38,
        },
        salesRentalHistory: {
          estimatedMarketValue: 'R$ 22.000.000',
          listingStatus: 'Uso Próprio',
          historicalNotes: 'Cadastrado a partir de dados públicos da Receita Federal e PMF.',
        },
        lightingPotentialAudit: {
          priorityLevel: 'alta',
          currentLightingState: 'Iluminação difusa antiga com necessidade de retrofit e realce arquitetônico',
          facadeSuitability: 'Ideal para projetores rasantes em LED 3000K e fitas de alta potência',
          patioPoolSuitability: 'Piscina e áreas sociais aptas para iluminação náutica blindada IP68',
          gardenLandscapeSuitability: 'Palmeiras e vegetação tropical aptas para espetos de foco direcionado',
          recommendedColorTemp: '2700K - 3000K (Branco Quente Nobre)',
          estimatedFixtureCount: 42,
          technicalFeasibility: 'Retrofit Completo',
        },
      },
      decisionMaker: partialLead.decisionMaker || {
        role: 'Síndico(a) / Sócio-Administrador',
        name: 'A confirmar na assembleia',
        decisionPower: 'Direto',
        strategy: 'Apresentar laudo de eficiência energética e valorização estética noturna.',
      },
      contactChannels: partialLead.contactChannels || {},
      opportunity: partialLead.opportunity || {
        facadePotential: 5,
        patioPoolPotential: 5,
        gardenPotential: 4,
        recommendedType: 'Retrofit Geral LED + Cenografia de Fachada e Piscina',
        estimatedTicket: 'R$ 40.000 - R$ 75.000',
        keySellingPoint: 'Redução drástica na manutenção e eliminação de queima precoce por maresia.',
      },
      status: 'novo',
      history: [
        {
          id: `h-pub-${Date.now()}`,
          date: timestamp,
          action: 'Importado de Banco de Dados Público',
          note: `Origem: ${partialLead.source || 'Receita Federal / GeoFloripa'}`,
        },
      ],
      source: partialLead.source || 'Bases Públicas Oficiais',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setLeads((prev) => {
      const combined = [fullLead, ...prev];
      const auditResult = auditAndDeduplicateLeads(combined);
      return auditResult.cleanedLeads;
    });
    showToast(`"${fullLead.title}" adicionado ao Radar de Iluminação!`);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // Jump from Card or Modal directly to the Interactive Map
  const handleNavigateToMap = (lead: LeadTarget) => {
    setFocusMapLeadId(lead.id);
    setActiveTab('map');
  };

  // Filtered leads calculation with Advanced Filtering logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const p = lead.propertyDetails;
      const arch = p?.architecturalDetails;
      const audit = p?.lightingPotentialAudit;

      // 1. Text search across name, address, decision maker, materials, style
      if (filters.searchTerm) {
        const q = filters.searchTerm.toLowerCase();
        const inTitle = lead.title.toLowerCase().includes(q);
        const inAddress = lead.address.toLowerCase().includes(q);
        const inRole = lead.decisionMaker.role.toLowerCase().includes(q);
        const inName = lead.decisionMaker.name ? lead.decisionMaker.name.toLowerCase().includes(q) : false;
        const inStyle = arch?.style ? arch.style.toLowerCase().includes(q) : false;
        const inNotes = lead.notes ? lead.notes.toLowerCase().includes(q) : false;
        const inMaterials = arch?.exteriorMaterials ? arch.exteriorMaterials.some(m => m.toLowerCase().includes(q)) : false;

        if (!inTitle && !inAddress && !inRole && !inName && !inStyle && !inNotes && !inMaterials) {
          return false;
        }
      }

      // 2. Operational Review Queues (Fila Validar Contato / Fila Revisão / Alta Prioridade)
      if (filters.reviewQueueFilter && filters.reviewQueueFilter !== 'all') {
        if (filters.reviewQueueFilter === 'pending_validation') {
          if (lead.contactVerificationStatus !== 'pending' && lead.isVerifiedRealContact) {
            return false;
          }
        } else if (filters.reviewQueueFilter === 'needs_review') {
          if (!lead.needsReview) {
            return false;
          }
        }
      }

      // 3. Property Type filter (casa, apartamento, comercial, pousada_hotel)
      if (filters.propertyType !== 'all') {
        const leadPropType = p?.propertyType || (
          lead.category === 'condo_residential' ? 'apartamento' :
          lead.category === 'commercial_venue' ? 'comercial' :
          lead.category === 'boutique_hotel' ? 'pousada_hotel' : 'casa'
        );
        if (leadPropType !== filters.propertyType) {
          return false;
        }
      }

      // 4. Category Filter
      if (filters.category !== 'all' && lead.category !== filters.category) {
        return false;
      }

      // 5. Funnel Status Filter
      if (filters.status && filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // 6. Bairro / Região Operacional (neighborhoodFilter)
      if (filters.neighborhoodFilter && filters.neighborhoodFilter !== 'all') {
        const neigh = (lead.neighborhood + ' ' + lead.address).toLowerCase();
        if (filters.neighborhoodFilter === 'jurere_internacional' && !neigh.includes('internacional')) return false;
        if (filters.neighborhoodFilter === 'jurere_tradicional' && !neigh.includes('tradicional')) return false;
        if (filters.neighborhoodFilter === 'to_confirm' && (neigh.includes('internacional') || neigh.includes('tradicional'))) return false;
      }

      // 7. Origem do Dado (originFilter)
      if (filters.originFilter && filters.originFilter !== 'all') {
        const orig = (lead.originType || '').toLowerCase();
        const src = (lead.source || '').toLowerCase();
        const url = (lead.canonicalUrl || '').toLowerCase();

        if (filters.originFilter === 'official_site') {
          if (orig !== 'official_site' && !src.includes('site') && !src.includes('grounding')) return false;
        } else if (filters.originFilter === 'airbnb') {
          if (orig !== 'airbnb' && !url.includes('airbnb') && !src.includes('airbnb')) return false;
        } else if (filters.originFilter === 'public_registry') {
          if (orig !== 'public_registry' && orig !== 'receita_federal' && !src.includes('receita') && !src.includes('geofloripa') && !src.includes('rgi')) return false;
        } else if (filters.originFilter === 'manual') {
          if (orig !== 'manual' && !src.includes('manual')) return false;
        }
      }

      // 8. Nível de Evidência Factual (evidenceFilter)
      if (filters.evidenceFilter && filters.evidenceFilter !== 'all') {
        if (filters.evidenceFilter === 'manually_confirmed') {
          if (lead.contactVerificationStatus !== 'manually_confirmed' && !lead.isVerifiedRealContact) return false;
        } else if (filters.evidenceFilter === 'public_evidence_found') {
          if (lead.contactVerificationStatus !== 'public_evidence_found') return false;
        } else if (filters.evidenceFilter === 'pending') {
          if (lead.contactVerificationStatus !== 'pending') return false;
        }
      }

      // 9. Status de Validação do Contato (contactFilter)
      if (filters.contactFilter && filters.contactFilter !== 'all') {
        const hasPhone = !!(lead.contactChannels.phone || lead.contactChannels.whatsapp || lead.contactChannels.email);
        if (filters.contactFilter === 'has_contact' && !hasPhone) return false;
        if (filters.contactFilter === 'no_contact' && hasPhone) return false;
      }

      // 10. Property Size / Built Area (m²)
      if (filters.minAreaM2 !== '') {
        const area = p?.builtAreaM2 || 0;
        if (area < Number(filters.minAreaM2)) return false;
      }
      if (filters.maxAreaM2 !== '') {
        const area = p?.builtAreaM2 || 0;
        if (area > Number(filters.maxAreaM2)) return false;
      }

      // 11. Year of Construction
      if (filters.yearRange !== 'all') {
        const year = p?.yearBuilt || 2015;
        if (filters.yearRange === 'recent_2020' && year < 2020) return false;
        if (filters.yearRange === '2010_2019' && (year < 2010 || year > 2019)) return false;
        if (filters.yearRange === '2000_2009' && (year < 2000 || year > 2009)) return false;
        if (filters.yearRange === 'pre_2000' && year >= 2000) return false;
      }

      // 12. Lighting Potential Priority
      if (filters.lightingPriority !== 'all') {
        const priority = audit?.priorityLevel || 'alta';
        if (priority !== filters.lightingPriority) return false;
      }

      // 13. Micro-Zone / Neighborhood in Jurerê
      if (filters.zone !== 'all') {
        const fullAddr = `${lead.neighborhood} ${lead.address}`.toLowerCase();
        if (filters.zone === 'jurere_internacional' && !fullAddr.includes('internacional')) return false;
        if (filters.zone === 'jurere_tradicional' && !fullAddr.includes('tradicional')) return false;
        if (filters.zone === 'orla' && !fullAddr.includes('orla') && !fullAddr.includes('beira-mar') && !fullAddr.includes('alameda') && !fullAddr.includes('mar')) return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Operational queue counts
  const pendingValidationCount = leads.filter(l => l.contactVerificationStatus === 'pending' || !l.isVerifiedRealContact).length;
  const needsReviewCount = leads.filter(l => !!l.needsReview).length;

  // Calculate high-level pipeline stats
  const contactedCount = leads.filter((l) => l.status === 'contatado').length;
  const scheduledVisits = leads.filter((l) => l.status === 'visita_agendada').length;

  return (
    <div className="min-h-screen bg-[#0c111d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentCity={currentCity}
        onCityChange={setCurrentCity}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalLeads={leads.length}
        contactedCount={contactedCount}
        scheduledVisits={scheduledVisits}
        totalEstimatedPipeline={`R$ ${(leads.length * 32).toLocaleString('pt-BR')}.000`}
        onOpenNewSearch={() => setIsSearchRadarOpen(true)}
        onOpenAddLead={() => setIsAddLeadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Toast notification banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full mx-auto">
        
        {/* TAB 1: Radar de Alvos (Cards View with Advanced Filters) */}
        {activeTab === 'radar' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            
            {/* Top Regional Pitch Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/25 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Prospecção Ativa em {currentCity.split(',')[0]}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Inteligência & Conexão com Tomadores de Decisão para Iluminação LED
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Filtre mansões, condomínios e estabelecimentos por m², ano de construção e características arquitetônicas para levantar dados e repassar contatos qualificados ao prestador.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab('map')}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <MapIcon className="w-4 h-4 text-amber-400" />
                  <span>Abrir Mapa Interativo</span>
                </button>
                <button
                  onClick={() => setIsSearchRadarOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buscar com Gemini IA</span>
                </button>
              </div>
            </div>

            {/* Advanced Search & Multi-criteria Filter Bar with Operational Controls */}
            <AdvancedSearchFiltersBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              totalResults={filteredLeads.length}
              totalDatabaseCount={leads.length}
              pendingValidationCount={pendingValidationCount}
              needsReviewCount={needsReviewCount}
              onTriggerDeduplication={handleTriggerDeduplication}
              onRestoreBackup={handleRestoreBackup}
              hasBackup={hasBackup}
            />

            {/* Grid of Leads */}
            {filteredLeads.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Nenhum imóvel encontrado</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Nenhum alvo corresponde aos filtros operacionais selecionados. Tente ajustar os filtros ou use a busca online com o Gemini.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setIsSearchRadarOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Buscar com Gemini IA
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onStatusChange={handleStatusChange}
                    onGeneratePitch={(l) => setPitchTargetLead(l)}
                    onInvestigate={(l) => setInvestigateLead({ name: l.title, address: l.address })}
                    onDeleteLead={handleDeleteLead}
                    onUpdateNotes={handleUpdateNotes}
                    onViewProfile={(l) => setSelectedProfileLead(l)}
                    onViewOnMap={(l) => handleNavigateToMap(l)}
                    onVerifyContact={handleVerifyContact}
                    onResolveReview={handleResolveReview}
                    onOpenInstagramIntel={(l) => setInstagramIntelLead(l)}
                    onOpenSocialIntel={(l) => setSocialIntelLead(l)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Mapa Interativo */}
        {activeTab === 'map' && (
          <div>
            {/* Sub-header controls for Map */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Visualização Geográfica de Jurerê
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-normal">
                      {filteredLeads.length} imóveis exibidos
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('radar')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Ver em Lista de Cards</span>
                </button>
                <button
                  onClick={() => setIsSearchRadarOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Adicionar Mais Alvos</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <InteractiveMapView
              leads={filteredLeads}
              onSelectLead={(l) => setSelectedProfileLead(l)}
              selectedLeadId={focusMapLeadId}
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>
        )}

        {/* TAB 3: Funil de Captação (Pipeline Kanban) */}
        {activeTab === 'pipeline' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white">Funil Comercial de Captação</h2>
                <p className="text-xs text-slate-400">
                  Acompanhe os imóveis desde o mapeamento até a visita noturna e fechamento de contrato
                </p>
              </div>
              <button
                onClick={() => setIsAddLeadOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 self-start cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Adicionar Alvo</span>
              </button>
            </div>

            <PipelineView
              leads={leads}
              onStatusChange={handleStatusChange}
              onGeneratePitch={(l) => setPitchTargetLead(l)}
              onInvestigate={(l) => setInvestigateLead({ name: l.title, address: l.address })}
            />
          </div>
        )}

        {/* TAB 4: Investigador de Endereço (Deep OSINT) */}
        {activeTab === 'investigator' && (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Investigação Ativa de Imóvel Específico
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Viu uma mansão ou condomínio em Jurerê (ou em outra cidade) e quer descobrir como chegar em quem decide a iluminação? Digite o nome ou endereço para que o Gemini analise fontes públicas na internet:
              </p>
              <button
                onClick={() => setInvestigateLead({ name: '', address: '' })}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Abrir Investigador de Endereço</span>
              </button>
            </div>
            <OsintGuideView />
          </div>
        )}

        {/* TAB 5: Integração com Bancos de Dados Públicos (Receita Federal / GeoFloripa / Matrículas) */}
        {activeTab === 'public_db' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <PublicDatabaseView
              leads={leads}
              onImportLead={handleImportPublicLead}
              onUpdateLead={(updatedLead) => {
                setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
                showToast(`Dados cadastrais atualizados para "${updatedLead.title}"!`);
              }}
              onNavigateToMap={(lat, lng) => {
                setActiveTab('map');
              }}
            />
          </div>
        )}

        {/* TAB 6: Guia Tático OSINT Gratuito */}
        {activeTab === 'osint' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <OsintGuideView />
          </div>
        )}

        {/* TAB 7: Auxílio IA (Multi-turn Gemini Chatbot) */}
        {activeTab === 'ai_chat' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AiChatAssistant
              leads={leads}
              initialContextLead={chatContextLead}
              onClearContextLead={() => setChatContextLead(null)}
            />
          </div>
        )}
      </main>

      {/* MODAL 1: Perfil Detalhado do Imóvel & Ficha Técnica */}
      <PropertyProfileModal
        lead={selectedProfileLead}
        isOpen={!!selectedProfileLead}
        onClose={() => setSelectedProfileLead(null)}
        onNavigateToMap={(l) => handleNavigateToMap(l)}
        onConsultAi={(l) => {
          setChatContextLead(l);
          setActiveTab('ai_chat');
          setSelectedProfileLead(null);
        }}
        onUpdateLead={(updatedLead) => {
          setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
          setSelectedProfileLead(updatedLead);
          showToast(`Matrícula e dados cadastrais de "${updatedLead.title}" salvos!`);
        }}
        onOpenInstagramIntel={(l) => setInstagramIntelLead(l)}
        onOpenSocialIntel={(l) => setSocialIntelLead(l)}
      />

      {/* MODAL: Instagram Location Intelligence */}
      <InstagramIntelligenceModal
        isOpen={!!instagramIntelLead}
        onClose={() => setInstagramIntelLead(null)}
        targetLead={instagramIntelLead}
        onUpdateLead={(updatedLead) => {
          setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
          setInstagramIntelLead(updatedLead);
          if (selectedProfileLead?.id === updatedLead.id) {
            setSelectedProfileLead(updatedLead);
          }
          showToast(`Inteligência de Instagram e evidências salvas para "${updatedLead.title}"!`);
        }}
      />

      {/* MODAL: Social Intelligence Multi-Provider (OSINT) */}
      <SocialIntelligenceModal
        isOpen={!!socialIntelLead}
        onClose={() => setSocialIntelLead(null)}
        targetLead={socialIntelLead}
        onUpdateLead={(updatedLead) => {
          setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
          setSocialIntelLead(updatedLead);
          if (selectedProfileLead?.id === updatedLead.id) {
            setSelectedProfileLead(updatedLead);
          }
          showToast(`Dossiê de Social Intelligence salvo para "${updatedLead.title}"!`);
        }}
      />

      {/* MODAL 2: Radar Search Modal */}
      <SearchRadarModal
        isOpen={isSearchRadarOpen}
        onClose={() => setIsSearchRadarOpen(false)}
        defaultCity={currentCity}
        onSearchResults={handleNewSearchResults}
      />

      {/* MODAL 3: Address Investigator Modal */}
      <AddressInvestigatorModal
        isOpen={!!investigateLead}
        onClose={() => setInvestigateLead(null)}
        defaultCity={currentCity}
        initialTargetName={investigateLead?.name || ''}
        initialAddress={investigateLead?.address || ''}
        onSaveAsLead={handleAddSingleLead}
      />

      {/* MODAL 4: Pitch Generator Modal */}
      <PitchGeneratorModal
        isOpen={!!pitchTargetLead}
        onClose={() => setPitchTargetLead(null)}
        lead={pitchTargetLead}
      />

      {/* MODAL 5: Manual Add Lead */}
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        defaultCity={currentCity}
        onAddLead={handleAddSingleLead}
      />

      {/* MODAL 6: Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        leads={leads}
      />

      {/* Quick Access Floating Chatbot Trigger */}
      {activeTab !== 'ai_chat' && (
        <button
          onClick={() => setActiveTab('ai_chat')}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer border border-amber-300/40"
          title="Abrir Auxílio IA com Gemini"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span className="text-xs font-extrabold hidden sm:inline">Auxílio IA</span>
          <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
        </button>
      )}
    </div>
  );
}
