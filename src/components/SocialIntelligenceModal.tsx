import React, { useState, useEffect } from 'react';
import { 
  LeadTarget, 
  SocialIntelligenceData, 
  SocialLocation, 
  PublicSocialPost, 
  PublicSocialProfile, 
  SocialEvidence, 
  RelationshipHypothesis,
  HypothesisStatus
} from '../types';
import { 
  investigateSocialIntelligence, 
  fetchSocialProviders 
} from '../services/social/client';
import { ProviderResult, ProviderStatusReport } from '../services/social/types';
import { 
  Globe2, 
  Sparkles, 
  MapPin, 
  Share2, 
  Users, 
  FileCheck2, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Clock, 
  HelpCircle,
  RefreshCw,
  Layers,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface SocialIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLead: LeadTarget | null;
  onUpdateLead: (updatedLead: LeadTarget) => void;
}

type TabType = 'locations' | 'posts' | 'profiles' | 'evidence' | 'hypotheses' | 'providers';

export const SocialIntelligenceModal: React.FC<SocialIntelligenceModalProps> = ({
  isOpen,
  onClose,
  targetLead,
  onUpdateLead,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('locations');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socialData, setSocialData] = useState<SocialIntelligenceData | null>(null);
  const [providerReports, setProviderReports] = useState<ProviderResult[]>([]);
  const [registeredProviders, setRegisteredProviders] = useState<ProviderStatusReport[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Carrega provedores registrados ao abrir
  useEffect(() => {
    if (isOpen) {
      fetchSocialProviders().then(setRegisteredProviders);
    }
  }, [isOpen]);

  // Sincroniza dados existentes do lead ou dispara investigação
  useEffect(() => {
    if (!isOpen || !targetLead) return;

    if (targetLead.socialIntelligence && targetLead.socialIntelligence.locations.length > 0) {
      setSocialData(targetLead.socialIntelligence);
    } else {
      runInvestigation();
    }
  }, [isOpen, targetLead?.id]);

  const runInvestigation = async () => {
    if (!targetLead) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await investigateSocialIntelligence({
        leadId: targetLead.id,
        propertyTitle: targetLead.title,
        address: targetLead.address,
        neighborhood: targetLead.neighborhood || 'Jurerê Internacional',
        city: targetLead.city || 'Florianópolis',
        coordinates: targetLead.coordinates,
        architecturalStyle: targetLead.propertyDetails?.architecturalDetails?.style
      });

      if (response.success && response.data) {
        setSocialData(response.data);
        setProviderReports(response.reports || []);
      } else {
        throw new Error(response.error || 'Não foi possível concluir a investigação.');
      }
    } catch (err: any) {
      console.error('Erro na investigação de Social Intelligence:', err);
      setErrorMessage(err.message || 'Erro de conexão com os provedores de inteligência social.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHypothesisStatus = (hypothesisId: string, newStatus: HypothesisStatus) => {
    if (!socialData) return;
    const updatedHypotheses = socialData.relationshipHypotheses.map(hyp => {
      if (hyp.id === hypothesisId) {
        return { ...hyp, status: newStatus };
      }
      return hyp;
    });

    setSocialData({
      ...socialData,
      relationshipHypotheses: updatedHypotheses
    });
  };

  const handleSaveToLead = () => {
    if (!targetLead || !socialData) return;
    setIsSaving(true);

    const updatedLead: LeadTarget = {
      ...targetLead,
      socialIntelligence: socialData
    };

    onUpdateLead(updatedLead);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen || !targetLead) return null;

  const isMock = !!socialData?.metadata?.mock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* CABEÇALHO */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Globe2 className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Social Intelligence
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Multi-Provider OSINT
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {targetLead.title} • <span className="text-slate-300">{targetLead.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={runInvestigation}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Atualizar dados de inteligência social"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Investigando...' : 'Re-investigar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* REGRA EPISTEMOLÓGICA & BANNER DE DEMONSTRAÇÃO */}
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-start gap-2 text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Regra de Inteligência:</strong> Postagens públicas em um local geográfico registram fatos da publicação, não posse ou poder decisório.
            </span>
          </div>

          {isMock && (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold tracking-wide shrink-0">
              DADOS DE DEMONSTRAÇÃO (MODO FALLBACK)
            </span>
          )}
        </div>

        {/* NAVEGAÇÃO POR ETAPAS / TABS */}
        <div className="px-4 border-b border-slate-800 bg-slate-900/60 overflow-x-auto flex gap-1">
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'locations'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>1. Locais & Geotags ({socialData?.locations?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'posts'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>2. Conteúdo Público ({socialData?.posts?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Perfis Públicos ({socialData?.profiles?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>4. Evidências Fatuais ({socialData?.evidence?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('hypotheses')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'hypotheses'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>5. Hipóteses Relacionais ({socialData?.relationshipHypotheses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ml-auto ${
              activeTab === 'providers'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Status Provedores ({registeredProviders.length})</span>
          </button>
        </div>

        {/* CORPO DO MODAL */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">Consultando Provedores de Social Intelligence...</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Consultando índices abertos, geolocalização e referências públicas em Jurerê Internacional.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-semibold">Erro ao processar inteligência social</p>
                <p className="text-slate-300">{errorMessage}</p>
              </div>
            </div>
          ) : !socialData ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma investigação social realizada para este imóvel ainda.
            </div>
          ) : (
            <>
              {/* TAB 1: LOCAIS & GEOTAGS */}
              {activeTab === 'locations' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Locais e Pontos de Referência Georreferenciados
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {socialData.locations.length} localizações mapeadas
                    </span>
                  </div>

                  {socialData.locations.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Nenhum local registrado.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {socialData.locations.map((loc) => (
                        <div key={loc.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2 hover:border-indigo-500/40 transition">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                              {loc.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700 text-indigo-300 border border-slate-600">
                              {loc.platform}
                            </span>
                          </div>

                          {loc.address && (
                            <p className="text-xs text-slate-300">{loc.address}</p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                            <span>
                              {loc.latitude && loc.longitude
                                ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                                : 'Coordenadas aproximadas'}
                            </span>
                            {loc.sourceUrl && (
                              <a
                                href={loc.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                Ver fonte <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CONTEÚDO PÚBLICO */}
              {activeTab === 'posts' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Publicações Públicas Encontradas
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {socialData.posts.length} postagens catalogadas
                    </span>
                  </div>

                  {socialData.posts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Nenhuma publicação pública registrada.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {socialData.posts.map((post) => (
                        <div key={post.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">
                                {post.authorPublicHandle || 'Autor não informado'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 uppercase">
                                {post.platform}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') : 'Data n/d'}
                            </span>
                          </div>

                          {post.captionSnippet && (
                            <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 italic">
                              "{post.captionSnippet}"
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Coletado em: {new Date(post.collectedAt).toLocaleDateString('pt-BR')}</span>
                            {post.url && (
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                Acessar post público <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PERFIS PÚBLICOS */}
              {activeTab === 'profiles' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Perfis Profissionais e Públicos Identificados
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {socialData.profiles.length} perfis mapeados
                    </span>
                  </div>

                  {socialData.profiles.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Nenhum perfil público catalogado.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {socialData.profiles.map((prof) => (
                        <div key={prof.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-indigo-300">{prof.publicHandle}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 uppercase">
                              {prof.platform}
                            </span>
                          </div>

                          {prof.displayName && (
                            <p className="text-xs font-semibold text-slate-100">{prof.displayName}</p>
                          )}

                          {prof.profileType && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                              Tipo: {prof.profileType}
                            </span>
                          )}

                          {prof.profileUrl && (
                            <div className="pt-2 border-t border-slate-800">
                              <a
                                href={prof.profileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                Ver perfil público <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EVIDÊNCIAS FATUAIS */}
              {activeTab === 'evidence' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Evidências Fatuais Coletadas
                    </h3>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Fatos Verificáveis
                    </span>
                  </div>

                  {socialData.evidence.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Nenhuma evidência registrada.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {socialData.evidence.map((ev) => (
                        <div key={ev.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Fato Observado
                            </span>
                            <span className="text-[11px] text-slate-400 uppercase font-mono">
                              Fonte: {ev.sourceType} • Confiança: {String(ev.confidence)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-200">{ev.description}</p>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                            <span>Observado: {ev.observedAt ? new Date(ev.observedAt).toLocaleDateString('pt-BR') : 'Data não informada'}</span>
                            {ev.sourceUrl && (
                              <a
                                href={ev.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                Link da Evidência <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: HIPÓTESES RELACIONAIS */}
              {activeTab === 'hypotheses' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Hipóteses de Relacionamento (Sob Validação)
                    </h3>
                    <span className="text-[11px] text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Exige Validação Humana / Oficial
                    </span>
                  </div>

                  {socialData.relationshipHypotheses.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Nenhuma hipótese formulada.</p>
                  ) : (
                    <div className="space-y-3">
                      {socialData.relationshipHypotheses.map((hyp) => (
                        <div key={hyp.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-indigo-300">
                                {hyp.subjectProfileId}
                              </span>
                              <span className="text-slate-400 text-xs">→</span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-200 border border-indigo-800">
                                {hyp.relationshipType}
                              </span>
                            </div>

                            {/* Seletor de Status da Hipótese */}
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-slate-400 text-[11px]">Status:</span>
                              <select
                                value={hyp.status}
                                onChange={(e) => handleUpdateHypothesisStatus(hyp.id, e.target.value as HypothesisStatus)}
                                className={`text-xs rounded-lg px-2 py-1 font-semibold border cursor-pointer ${
                                  hyp.status === 'supported'
                                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                                    : hyp.status === 'under_review'
                                    ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                                    : hyp.status === 'rejected'
                                    ? 'bg-red-950/80 border-red-500/40 text-red-300'
                                    : 'bg-slate-800 border-slate-600 text-slate-300'
                                }`}
                              >
                                <option value="unverified">Não Verificado (unverified)</option>
                                <option value="under_review">Em Análise (under_review)</option>
                                <option value="supported">Suportado por Fatos (supported)</option>
                                <option value="rejected">Descartado (rejected)</option>
                              </select>
                            </div>
                          </div>

                          {hyp.notes && (
                            <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                              {hyp.notes}
                            </p>
                          )}

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                            <span>Evidências Vinculadas: {hyp.evidenceIds.length}</span>
                            <span>Grau de Confiança: {String(hyp.confidence)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: STATUS DOS PROVEDORES */}
              {activeTab === 'providers' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Provedores e Adaptadores de Inteligência Social
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {registeredProviders.map((prov) => (
                      <div key={prov.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{prov.name}</span>
                          {prov.isOpenSource && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono">
                              Open Source
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400">Plataforma: {prov.platform}</p>

                        <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-xs">
                          <span className={`w-2 h-2 rounded-full ${prov.available ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-slate-300">{prov.statusMessage}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {providerReports.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">Relatório da Última Execução:</h4>
                      {providerReports.map((r, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{r.providerName}</span>
                            <span className="text-slate-400 text-[11px]">{r.durationMs || 0} ms</span>
                          </div>
                          {r.limitations && r.limitations.length > 0 && (
                            <div className="text-[11px] text-amber-400/90 space-y-0.5 pl-2 border-l border-amber-500/30">
                              {r.limitations.map((lim, j) => (
                                <p key={j}>• {lim}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* RODAPÉ DE AÇÕES */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToLead}
              disabled={isSaving || !socialData}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar no Dossiê do Imóvel</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
