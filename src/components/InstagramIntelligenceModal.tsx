import React, { useState, useEffect } from 'react';
import { 
  X, 
  Instagram, 
  MapPin, 
  Sparkles, 
  Loader2, 
  ExternalLink, 
  CheckCircle2, 
  Compass, 
  Building2, 
  Camera, 
  Users, 
  Lightbulb, 
  Tag, 
  Check, 
  Save, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Share2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  LeadTarget, 
  InstagramIntelligenceData, 
  InstagramLocationTag, 
  InstagramPublicPost, 
  InstagramPublicProfile, 
  EvidenceSource 
} from '../types';

interface InstagramIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLead: LeadTarget | null;
  onUpdateLead: (updatedLead: LeadTarget) => void;
}

type PipelineStep = 'pipeline' | 'geotags' | 'posts' | 'profiles' | 'evidences';

export const InstagramIntelligenceModal: React.FC<InstagramIntelligenceModalProps> = ({
  isOpen,
  onClose,
  targetLead,
  onUpdateLead,
}) => {
  const [activeStep, setActiveStep] = useState<PipelineStep>('pipeline');
  const [searchFocus, setSearchFocus] = useState<'all' | 'architecture' | 'rentals' | 'hotspots'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [intelData, setIntelData] = useState<InstagramIntelligenceData | null>(null);
  const [selectedEvidences, setSelectedEvidences] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaNotice, setIsQuotaNotice] = useState(false);

  // Load existing intelligence if already captured on target lead
  useEffect(() => {
    if (!isOpen || !targetLead) return;

    if (targetLead.instagramIntelligence) {
      setIntelData(targetLead.instagramIntelligence);
      // Select all evidences by default
      const initialMap: Record<string, boolean> = {};
      targetLead.instagramIntelligence.derivedEvidences?.forEach((ev) => {
        initialMap[ev.id] = true;
      });
      setSelectedEvidences(initialMap);
      setIsSaved(true);
    } else {
      // Trigger automatic initial analysis for convenience
      handleRunAnalysis();
    }
  }, [isOpen, targetLead?.id]);

  if (!isOpen || !targetLead) return null;

  const handleRunAnalysis = async (focusOverride?: 'all' | 'architecture' | 'rentals' | 'hotspots') => {
    const focus = focusOverride || searchFocus;
    setIsLoading(true);
    setErrorMessage(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/instagram/location-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTitle: targetLead.title,
          address: targetLead.address,
          neighborhood: targetLead.neighborhood,
          coordinates: targetLead.coordinates,
          propertyType: targetLead.propertyDetails?.propertyType || 'casa',
          architecturalDetails: targetLead.propertyDetails?.architecturalDetails,
          decisionMaker: targetLead.decisionMaker,
          searchFocus: focus,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na análise (${response.status})`);
      }

      const data = await response.json();
      if (data.intel) {
        setIntelData(data.intel);
        setIsQuotaNotice(Boolean(data.isQuotaFallback));
        
        // Select all newly generated evidences
        const newMap: Record<string, boolean> = {};
        data.intel.derivedEvidences?.forEach((ev: EvidenceSource) => {
          newMap[ev.id] = true;
        });
        setSelectedEvidences(newMap);
      } else {
        throw new Error('Formato de resposta inesperado do servidor.');
      }
    } catch (err: any) {
      console.error('Erro ao buscar Instagram Location Intel:', err);
      setErrorMessage(err.message || 'Falha ao executar a esteira investigativa.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEvidence = (evId: string) => {
    setSelectedEvidences((prev) => ({
      ...prev,
      [evId]: !prev[evId],
    }));
  };

  const handleSaveToLead = () => {
    if (!intelData || !targetLead) return;

    // Filter evidences marked by user
    const confirmedEvidences = intelData.derivedEvidences.filter(
      (ev) => selectedEvidences[ev.id]
    );

    // Merge evidences deduplicating by ID/URL
    const existingEvidences = targetLead.evidenceSources || [];
    const existingUrls = new Set(existingEvidences.map((e) => e.url));
    const mergedEvidences = [
      ...existingEvidences,
      ...confirmedEvidences.filter((e) => !existingUrls.has(e.url)),
    ];

    // Check if any Instagram contact or profile can enrich contact channels
    let enrichedInstagram = targetLead.contactChannels.instagram;
    const prominentProfile = intelData.publicProfiles.find((p) => p.profileType === 'broker_agency' || p.profileType === 'architect');
    if (!enrichedInstagram && prominentProfile) {
      enrichedInstagram = `@${prominentProfile.username}`;
    }

    const updatedLead: LeadTarget = {
      ...targetLead,
      instagramIntelligence: intelData,
      evidenceSources: mergedEvidences,
      contactChannels: {
        ...targetLead.contactChannels,
        instagram: enrichedInstagram,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateLead(updatedLead);
    setIsSaved(true);
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    beach_club: { label: 'Beach Club / Dining', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    street_hotspot: { label: 'Via / Eixo Principal', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    condo_neighborhood: { label: 'Bairro / Loteamento', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    restaurant_bar: { label: 'Gastronomia Noturna', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    landmark: { label: 'Ponto Turístico / Orla', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  };

  const profileTypeLabels: Record<string, string> = {
    architect: 'Arquiteto / Studio Autor',
    broker_agency: 'Boutique Imobiliária / Corretor',
    property_manager: 'Administradora de Temporada',
    lighting_designer: 'Lighting Designer / Iluminação',
    owner_influencer: 'Proprietário / Morador',
    hospitality: 'Hotelaria / Concierge',
  };

  return (
    <div 
      id="instagram-intel-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div 
        id="instagram-intel-modal-container" 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden"
      >
        {/* Header com Branding e Pipeline */}
        <div id="instagram-intel-header" className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">Instagram Location Intelligence</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    OSINT Georreferenciado
                  </span>
                </div>
                <p className="text-sm text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-medium text-white">{targetLead.title}</span>
                  <span className="text-slate-400">• {targetLead.address}</span>
                </p>
              </div>
            </div>

            <button
              id="btn-close-instagram-intel"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner da Esteira Investigativa */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between overflow-x-auto text-xs font-medium text-slate-300 gap-2">
            <span className="flex items-center gap-1 text-pink-400 font-semibold whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5" /> 1. Imóvel
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="flex items-center gap-1 text-indigo-300 font-semibold whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5" /> 2. Localização
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="flex items-center gap-1 text-amber-300 font-semibold whitespace-nowrap">
              <Compass className="w-3.5 h-3.5" /> 3. Geotags & Locais
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="flex items-center gap-1 text-cyan-300 font-semibold whitespace-nowrap">
              <Camera className="w-3.5 h-3.5" /> 4. Posts Públicos
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="flex items-center gap-1 text-emerald-300 font-semibold whitespace-nowrap">
              <Users className="w-3.5 h-3.5" /> 5. Perfis Públicos
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="flex items-center gap-1 text-pink-300 font-semibold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5" /> 6. Evidências
            </span>
          </div>
        </div>

        {/* Barra de Filtro de Foco & Abas de Navegação */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Abas de Navegação */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveStep('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeStep === 'pipeline'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveStep('geotags')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeStep === 'geotags'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Locais ({intelData?.locationTags.length || 0})
            </button>
            <button
              onClick={() => setActiveStep('posts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeStep === 'posts'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Posts ({intelData?.publicPosts.length || 0})
            </button>
            <button
              onClick={() => setActiveStep('profiles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeStep === 'profiles'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Perfis ({intelData?.publicProfiles.length || 0})
            </button>
            <button
              onClick={() => setActiveStep('evidences')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeStep === 'evidences'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Evidências ({intelData?.derivedEvidences.length || 0})
            </button>
          </div>

          {/* Seletor de Foco & Botão de Re-análise */}
          <div className="flex items-center gap-2">
            <select
              value={searchFocus}
              onChange={(e) => {
                const newFocus = e.target.value as any;
                setSearchFocus(newFocus);
                handleRunAnalysis(newFocus);
              }}
              disabled={isLoading}
              className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">Foco: Completo (Todos)</option>
              <option value="architecture">Foco: Arquitetura & Obras</option>
              <option value="rentals">Foco: Locação & Temporada</option>
              <option value="hotspots">Foco: Hotspots & Beach Clubs</option>
            </select>

            <button
              onClick={() => handleRunAnalysis()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50 shadow-xs"
              title="Reexecutar varredura OSINT no Instagram"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Notificação de Cota/Contingência se aplicável */}
        {isQuotaNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Modo Contingência Ativo:</strong> Dados curados de alta precisão baseados na cartografia e acervo de Jurerê Internacional.
              </span>
            </div>
            <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
              Confiabilidade Garantida
            </span>
          </div>
        )}

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Conteúdo Principal do Modal com Scroll */}
        <div id="instagram-intel-body" className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-500 animate-pulse flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-800">Executando Esteira OSINT de Localização...</h4>
                <p className="text-sm text-slate-500 max-w-md mt-1">
                  Varrendo geotags de Jurerê, cruzando postagens de arquitetura noturna, perfis de arquitetos e extraindo evidências de iluminação.
                </p>
              </div>
            </div>
          ) : !intelData ? (
            <div className="text-center py-12 text-slate-500">
              <p>Nenhuma inteligência coletada ainda. Clique em Atualizar para iniciar.</p>
            </div>
          ) : (
            <>
              {/* ABA 1: VISÃO GERAL / RESUMO DA ESTEIRA */}
              {activeStep === 'pipeline' && (
                <div className="space-y-6">
                  {/* Resumo Analítico */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50/70 via-white to-pink-50/50 border border-indigo-100 shadow-xs">
                    <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Diagnóstico de Presença Social & Localização</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{intelData.summary}</p>

                    <div className="mt-4 p-3.5 rounded-lg bg-white border border-indigo-200/70 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-0.5">
                          Estratégia de Abordagem Luminotécnica Recomendada:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {intelData.suggestedAction}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Resumo das 4 Dimensões */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dimensão 1: Geotags */}
                    <div 
                      onClick={() => setActiveStep('geotags')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white shadow-xs cursor-pointer transition-all hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                          <Compass className="w-4 h-4" />
                          <span>Locais & Geotags</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                          {intelData.locationTags.length} locais
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {intelData.locationTags.map((l) => l.name).join(', ')}
                      </p>
                      <div className="mt-3 flex items-center text-xs text-indigo-600 font-medium group-hover:underline">
                        <span>Ver mapa de calor social</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>

                    {/* Dimensão 2: Posts */}
                    <div 
                      onClick={() => setActiveStep('posts')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-pink-400 bg-white shadow-xs cursor-pointer transition-all hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-pink-700 font-semibold text-sm">
                          <Camera className="w-4 h-4" />
                          <span>Posts Noturnos & Obras</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-pink-600">
                          {intelData.publicPosts.length} posts
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        Evidências fotográficas de arquitetura, beirais e locação de alto padrão.
                      </p>
                      <div className="mt-3 flex items-center text-xs text-pink-600 font-medium group-hover:underline">
                        <span>Examinar posts públicos</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>

                    {/* Dimensão 3: Perfis */}
                    <div 
                      onClick={() => setActiveStep('profiles')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white shadow-xs cursor-pointer transition-all hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                          <Users className="w-4 h-4" />
                          <span>Perfis Mapeados</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                          {intelData.publicProfiles.length} perfis
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        Arquitetos autores, corretores exclusivos e administradores com contatos.
                      </p>
                      <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium group-hover:underline">
                        <span>Explorar tomadores</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Prévia das Evidências com Botão de Ação Rápida */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
                        <span>Evidências Derivadas para o Dossiê</span>
                      </div>
                      <button
                        onClick={() => setActiveStep('evidences')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Gerenciar ({intelData.derivedEvidences.length})
                      </button>
                    </div>

                    <div className="space-y-2">
                      {intelData.derivedEvidences.slice(0, 2).map((ev) => (
                        <div key={ev.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ev.type === 'fact' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ev.type === 'fact' ? 'Fato' : 'Inferência'}
                            </span>
                            <span className="font-semibold text-slate-800">{ev.title}</span>
                          </div>
                          <p className="text-slate-600">{ev.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: LOCAIS PÚBLICOS & GEOTAGS DO INSTAGRAM */}
              {activeStep === 'geotags' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Locais Públicos e Geotags Correlacionadas</h4>
                      <p className="text-xs text-slate-500">
                        Pólos de atração social, beach clubs e eixos de tráfego a menos de 1km do imóvel.
                      </p>
                    </div>
                    <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full font-semibold">
                      {intelData.locationTags.length} locais identificados
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {intelData.locationTags.map((tag) => {
                      const categoryInfo = categoryLabels[tag.category] || {
                        label: tag.category,
                        color: 'bg-slate-100 text-slate-700 border-slate-200',
                      };

                      return (
                        <div 
                          key={tag.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryInfo.color}`}>
                                {categoryInfo.label}
                              </span>
                              {tag.distanceApproxMeters !== undefined && (
                                <span className="text-[11px] font-semibold text-slate-500">
                                  ~{tag.distanceApproxMeters}m de distância
                                </span>
                              )}
                            </div>

                            <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span>{tag.name}</span>
                            </h5>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              {tag.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-400">Relevância:</span>
                              <span className="text-xs font-bold text-slate-700">{tag.relevanceScore}%</span>
                            </div>

                            {tag.instagramLocationUrl && (
                              <a
                                href={tag.instagramLocationUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-800 transition-colors"
                              >
                                <Instagram className="w-3.5 h-3.5" />
                                <span>Abrir no Instagram</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABA 3: POSTS PÚBLICOS GEORREFERENCIADOS */}
              {activeStep === 'posts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Postagens Públicas de Arquitetura & Locação</h4>
                      <p className="text-xs text-slate-500">
                        Publicações geolocalizadas na vizinhança evidenciando soluções luminotécnicas e anúncios.
                      </p>
                    </div>
                    <span className="text-xs text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-full font-semibold">
                      {intelData.publicPosts.length} posts mapeados
                    </span>
                  </div>

                  <div className="space-y-3">
                    {intelData.publicPosts.map((post) => (
                      <div 
                        key={post.id} 
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-pink-300 transition-all shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {post.authorUsername.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900">@{post.authorUsername}</span>
                              {post.authorName && (
                                <span className="text-[11px] text-slate-500 ml-1.5">• {post.authorName}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {post.locationName && (
                              <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-pink-500" />
                                {post.locationName}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-medium">
                              {post.postedAtApprox}
                            </span>
                          </div>
                        </div>

                        {/* Legenda do Post */}
                        <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-lg border border-slate-100 italic leading-relaxed">
                          "{post.caption}"
                        </p>

                        {/* Badges Estéticas Visuais */}
                        {post.visualAesthetics && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            {post.visualAesthetics.hasNightShot && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                                🌙 Fotografia Noturna
                              </span>
                            )}
                            {post.visualAesthetics.poolLightingVisible && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                                💧 Piscina Iluminada
                              </span>
                            )}
                            {post.visualAesthetics.facadeArchitectureVisible && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                🏛️ Fachada Arquitetônica
                              </span>
                            )}
                            {post.visualAesthetics.gardenLightingVisible && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                🌴 Iluminação Paisagística
                              </span>
                            )}
                          </div>
                        )}

                        {/* Justificativa de Relevância */}
                        <div className="mt-3 text-xs text-slate-600 flex items-start gap-2 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-800">Conexão Técnica com o Imóvel: </span>
                            <span>{post.relevanceReason}</span>
                          </div>
                        </div>

                        {/* Ações do Post */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
                            {post.tags.slice(0, 4).map((t, idx) => (
                              <span key={idx}>{t}</span>
                            ))}
                          </div>

                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-800"
                          >
                            <span>Ver Publicação Completa</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 4: PERFIS PÚBLICOS IDENTIFICADOS */}
              {activeStep === 'profiles' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Perfis de Arquitetos, Corretores e Gestores</h4>
                      <p className="text-xs text-slate-500">
                        Profissionais atuantes na micro-região com canais de contato mapeados para abordagem.
                      </p>
                    </div>
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                      {intelData.publicProfiles.length} perfis vinculados
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {intelData.publicProfiles.map((prof) => (
                      <div 
                        key={prof.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {profileTypeLabels[prof.profileType] || prof.profileType}
                            </span>
                            {prof.followerCountApprox && (
                              <span className="text-[11px] font-medium text-slate-500">
                                {prof.followerCountApprox}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                              {prof.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">{prof.fullName}</h5>
                              <span className="text-xs text-slate-500 font-medium">@{prof.username}</span>
                            </div>
                          </div>

                          {prof.bioSnippet && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2.5 leading-relaxed">
                              {prof.bioSnippet}
                            </p>
                          )}

                          <div className="text-xs text-slate-600 mb-2">
                            <span className="font-semibold text-slate-800">Correlação: </span>
                            <span>{prof.correlationReason}</span>
                          </div>

                          {/* Contatos Mapeados */}
                          {prof.contactMatch && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                              {prof.contactMatch.whatsappOrPhone && (
                                <a
                                  href={`https://wa.me/${prof.contactMatch.whatsappOrPhone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100"
                                >
                                  WhatsApp: {prof.contactMatch.whatsappOrPhone}
                                </a>
                              )}
                              {prof.contactMatch.email && (
                                <a
                                  href={`mailto:${prof.contactMatch.email}`}
                                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                                >
                                  {prof.contactMatch.email}
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                          <a
                            href={prof.profileUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            <span>Abrir Perfil no Instagram</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 5: EVIDÊNCIAS PRONTAS & SELEÇÃO */}
              {activeStep === 'evidences' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Evidências OSINT Validadas</h4>
                      <p className="text-xs text-slate-500">
                        Marque as evidências que deseja incorporar permanentemente à ficha cadastral do imóvel.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const allSelected = intelData.derivedEvidences.every((e) => selectedEvidences[e.id]);
                        const updated: Record<string, boolean> = {};
                        intelData.derivedEvidences.forEach((e) => {
                          updated[e.id] = !allSelected;
                        });
                        setSelectedEvidences(updated);
                      }}
                      className="text-xs text-indigo-600 font-medium hover:underline"
                    >
                      {intelData.derivedEvidences.every((e) => selectedEvidences[e.id])
                        ? 'Desmarcar Todos'
                        : 'Selecionar Todos'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {intelData.derivedEvidences.map((ev) => {
                      const isChecked = Boolean(selectedEvidences[ev.id]);

                      return (
                        <div
                          key={ev.id}
                          onClick={() => toggleEvidence(ev.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                            isChecked
                              ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                              : 'bg-white border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="pt-0.5">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isChecked
                                  ? 'bg-amber-600 border-amber-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  ev.type === 'fact'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ev.type === 'fact' ? 'Fato' : 'Inferência'}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                              </div>

                              {ev.url && (
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-medium"
                                >
                                  <span>Fonte Original</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed mt-1">
                              {ev.snippet}
                            </p>

                            <div className="mt-2 text-[11px] text-slate-400">
                              Coletado em: {new Date(ev.collectedAt).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé com Botões de Ação */}
        <div id="instagram-intel-footer" className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {intelData && (
              <span>
                Última varredura: {new Date(intelData.analyzedAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(intelData.analyzedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Fechar
            </button>

            {intelData && (
              <button
                id="btn-save-instagram-intel-to-lead"
                onClick={handleSaveToLead}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  isSaved
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvo no Imóvel!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Vincular Evidências ao Imóvel</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
