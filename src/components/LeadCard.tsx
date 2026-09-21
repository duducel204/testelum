import React, { useState } from 'react';
import { 
  LeadTarget, 
  LeadStatus, 
  LeadCategory 
} from '../types';
import { 
  Building2, 
  Home, 
  Hotel, 
  Compass, 
  Users, 
  MessageSquare, 
  Phone, 
  Instagram, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Send, 
  Trash2, 
  Calendar,
  DollarSign,
  Briefcase,
  Copy,
  Eye,
  FileText,
  Mail,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  Globe2
} from 'lucide-react';

interface LeadCardProps {
  lead: LeadTarget;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onGeneratePitch: (lead: LeadTarget) => void;
  onInvestigate: (lead: LeadTarget) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateNotes: (leadId: string, notes: string) => void;
  onViewProfile?: (lead: LeadTarget) => void;
  onViewOnMap?: (lead: LeadTarget) => void;
  onVerifyContact?: (leadId: string) => void;
  onResolveReview?: (leadId: string) => void;
  onOpenInstagramIntel?: (lead: LeadTarget) => void;
  onOpenSocialIntel?: (lead: LeadTarget) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onStatusChange,
  onGeneratePitch,
  onInvestigate,
  onDeleteLead,
  onUpdateNotes,
  onViewProfile,
  onViewOnMap,
  onVerifyContact,
  onResolveReview,
  onOpenInstagramIntel,
  onOpenSocialIntel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showNotesEdit, setShowNotesEdit] = useState(false);
  const [tempNotes, setTempNotes] = useState(lead.notes || '');
  const [copiedQuick, setCopiedQuick] = useState(false);

  const getCategoryInfo = (cat: LeadCategory) => {
    switch (cat) {
      case 'mansion_rental':
        return { label: 'Mansão de Temporada', icon: Home, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'condo_residential':
        return { label: 'Condomínio Residencial', icon: Building2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'boutique_hotel':
        return { label: 'Pousada / Hotel Boutique', icon: Hotel, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'commercial_venue':
        return { label: 'Beach Club / Gastronomia', icon: Compass, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'architect_partner':
        return { label: 'Arquiteto / Lighting Partner', icon: Briefcase, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'luxury_broker':
        return { label: 'Imobiliária / Mansões', icon: Users, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: 'Imóvel Alvo', icon: Home, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'contatado':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'visita_agendada':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'proposta_enviada':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'fechado':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'descartado':
        return 'bg-slate-700/50 text-slate-400 border-slate-600';
    }
  };

  const categoryConfig = getCategoryInfo(lead.category);
  const CategoryIcon = categoryConfig.icon;

  const handleSaveNotes = () => {
    onUpdateNotes(lead.id, tempNotes);
    setShowNotesEdit(false);
  };

  const copyQuickDossier = (e: React.MouseEvent) => {
    e.stopPropagation();
    const p = lead.propertyDetails;
    const text = `*FICHA DE LEVANTAMENTO - LÚMINA JURERÊ*
📍 Imóvel: ${lead.title}
Endereço: ${lead.address}, ${lead.neighborhood} - ${lead.city}
Tipo: ${p?.propertyType || lead.category} | ${p?.builtAreaM2 ? `${p.builtAreaM2} m²` : ''} ${p?.yearBuilt ? `(Ano ${p.yearBuilt})` : ''}
Tomador de Decisão: ${lead.decisionMaker.name || 'Proprietário'} (${lead.decisionMaker.role})
Telefone/WhatsApp: ${lead.contactChannels.whatsapp ? `+${lead.contactChannels.whatsapp}` : lead.contactChannels.phone || 'Ver no app'}
Potencial de Iluminação: ${lead.opportunity.recommendedType}
Ticket Estimado: ${lead.opportunity.estimatedTicket}`;

    navigator.clipboard.writeText(text);
    setCopiedQuick(true);
    setTimeout(() => setCopiedQuick(false), 2500);
  };

  const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${lead.title} ${lead.address} ${lead.neighborhood} ${lead.city}`
  )}`;

  const p = lead.propertyDetails;

  // Determine reliability style
  const reliabilityScore = lead.dataReliabilityScore ?? 50;
  const getReliabilityBadge = (score: number) => {
    if (score >= 80) return { label: `${score}% Confiabilidade Alta`, style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (score >= 50) return { label: `${score}% Confiabilidade Média`, style: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    return { label: `${score}% Estimativa / OSINT`, style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  };
  const reliabilityBadge = getReliabilityBadge(reliabilityScore);

  // Evidence sources count
  const allEvidenceCount = (lead.evidenceSources?.length || 0) + (lead.groundingSources?.length || 0);

  return (
    <div className={`bg-slate-900/80 border rounded-xl p-5 hover:border-slate-700/80 transition-all shadow-md relative group flex flex-col justify-between ${
      lead.needsReview ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800'
    }`}>
      <div>
        {/* Review warning if needed */}
        {lead.needsReview && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>Atenção:</strong> Imóvel sinalizado para revisão de conflito ou duplicidade.</span>
            </div>
            {onResolveReview && (
              <button
                type="button"
                onClick={() => onResolveReview(lead.id)}
                className="px-2 py-0.5 rounded bg-rose-500/30 hover:bg-rose-500/50 text-white text-[11px] font-bold transition cursor-pointer"
              >
                Concluir Revisão
              </button>
            )}
          </div>
        )}

        {/* Card Header: Category & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${categoryConfig.color}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              {categoryConfig.label}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400/80" />
              {lead.neighborhood}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusColor(lead.status)}`}
            >
              <option value="novo">Novo Alvo</option>
              <option value="contatado">Contatado</option>
              <option value="visita_agendada">Visita Marcada</option>
              <option value="proposta_enviada">Proposta Enviada</option>
              <option value="fechado">Fechado</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>
        </div>

        {/* Title and Address */}
        <h3 className="text-base font-bold text-white tracking-tight leading-snug mb-1 group-hover:text-amber-300 transition-colors">
          {lead.title}
        </h3>
        <p className="text-xs text-slate-400 mb-2.5 flex items-center gap-1.5">
          <span>{lead.address}</span>
          <a
            href={mapsQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-0.5 text-[11px] underline"
          >
            Maps <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>

        {/* Data Integrity & Contact Verification Badges Strip */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Verification Status (Honest distinction: Verified vs Evidence Found vs Pending) */}
          {lead.contactVerificationStatus === 'manually_confirmed' || lead.isVerifiedRealContact ? (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1" title="Contato validado por operador humano">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Contato Confirmado Manualmente</span>
            </span>
          ) : lead.contactVerificationStatus === 'public_evidence_found' ? (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1" title="Dados com fonte pública em site oficial ou RFB">
              <FileCheck className="w-3 h-3 text-blue-400" />
              <span>Evidência Pública em Fontes Oficiais</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1" title="Imóvel identificado mas canal de contato ainda pendente de validação">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Validação Pendente</span>
            </span>
          )}

          {/* Reliability Score Badge */}
          <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold flex items-center gap-1 ${reliabilityBadge.style}`}>
            <span>{reliabilityBadge.label}</span>
          </span>

          {/* Clickable Evidence Sources Counter */}
          {allEvidenceCount > 0 && (
            <button
              type="button"
              onClick={() => setShowEvidenceModal(!showEvidenceModal)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              title="Clique para inspecionar as fontes e links de evidência"
            >
              <LinkIcon className="w-3 h-3 text-cyan-400" />
              <span>{allEvidenceCount} Fonte{allEvidenceCount > 1 ? 's' : ''} Documentada{allEvidenceCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {lead.cnpj && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] font-mono font-medium flex items-center gap-1" title="Cadastro Nacional da Pessoa Jurídica (Receita Federal)">
              <span>CNPJ: {lead.cnpj}</span>
            </span>
          )}

          {lead.matricula && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] font-mono font-medium flex items-center gap-1" title="Matrícula de Registro de Imóveis (RGI)">
              <span>Matrícula: {lead.matricula}</span>
            </span>
          )}

          {p?.builtAreaM2 && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700/80 text-[11px] font-semibold flex items-center gap-1">
              <span>📐 {p.builtAreaM2} m²</span>
            </span>
          )}
          {p?.lightingPotentialAudit?.priorityLevel === 'alta' && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Alta Prioridade LED</span>
            </span>
          )}

          {lead.instagramIntelligence ? (
            <button
              type="button"
              onClick={() => onOpenInstagramIntel && onOpenInstagramIntel(lead)}
              className="px-2 py-0.5 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Inteligência de Instagram e Geotags mapeada. Clique para abrir."
            >
              <Instagram className="w-3 h-3 text-pink-400" />
              <span>Instagram Intel ({lead.instagramIntelligence.locationTags?.length || 0})</span>
            </button>
          ) : onOpenInstagramIntel ? (
            <button
              type="button"
              onClick={() => onOpenInstagramIntel(lead)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-pink-300/80 border border-pink-500/20 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
              title="Mapear geotags e perfis de Instagram para este imóvel"
            >
              <Instagram className="w-3 h-3 text-pink-400" />
              <span>Instagram Intel</span>
            </button>
          ) : null}
        </div>

        {/* Ficha de Fontes e Evidências Clicável (Expandable Box) */}
        {showEvidenceModal && (
          <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/40 mb-3 space-y-2 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                Ficha de Evidências e Fontes Factual
              </span>
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="text-slate-400 hover:text-white text-[11px]"
              >
                ✕ Fechar
              </button>
            </div>

            {lead.evidenceSources && lead.evidenceSources.length > 0 ? (
              <div className="space-y-2">
                {lead.evidenceSources.map((ev, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-amber-300 hover:underline flex items-center gap-1 truncate"
                      >
                        <span>{ev.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold border shrink-0 ${
                        ev.type === 'fact'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : ev.type === 'inference'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {ev.type === 'fact' ? 'Fato com Fonte' : ev.type === 'inference' ? 'Inferência de Anúncio' : 'Estimativa Comercial'}
                      </span>
                    </div>
                    <p className="text-slate-400 italic">"{ev.snippet}"</p>
                    {ev.collectedAt && (
                      <span className="text-[10px] text-slate-500 block mt-1">Coletado em: {ev.collectedAt}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {lead.groundingSources && lead.groundingSources.length > 0 ? (
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Links do Google Search Grounding:</span>
                <div className="flex flex-wrap gap-1.5">
                  {lead.groundingSources.map((gs, i) => (
                    <a
                      key={i}
                      href={gs.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-300 hover:underline bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{gs.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {lead.canonicalUrl && (
              <div className="pt-1 border-t border-slate-800/80 text-[11px] flex items-center justify-between">
                <span className="text-slate-400">URL Canônica / Anúncio:</span>
                <a
                  href={lead.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Abrir Link Direto</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Highlighted Decision Maker Box */}
        <div className="bg-slate-800/60 border border-amber-500/20 rounded-lg p-3 mb-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Quem Decide?
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 font-medium">
              Poder: <strong className="text-white">{lead.decisionMaker.decisionPower}</strong>
            </span>
          </div>

          <div className="text-xs font-bold text-slate-100 mb-1">
            {lead.decisionMaker.role}
            {lead.decisionMaker.name && lead.decisionMaker.name !== 'A confirmar' && (
              <span className="text-amber-300 font-normal ml-1">
                ({lead.decisionMaker.name})
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-amber-300/90">Estratégia de Abordagem: </strong>
            {lead.decisionMaker.strategy}
          </p>
        </div>

        {/* Direct Contact Channels Bar + Validation Button */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {lead.contactChannels.whatsapp && (
            <a
              href={`https://wa.me/${lead.contactChannels.whatsapp}?text=${encodeURIComponent(
                `Olá, tudo bem? Vi o imóvel ${lead.title} em Jurerê e gostaria de conversar sobre valorização noturna com iluminação em LED.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-md text-xs font-medium transition cursor-pointer"
              title="Abrir conversa no WhatsApp"
            >
              <Send className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}

          {lead.contactChannels.phone && (
            <a
              href={`tel:${lead.contactChannels.phone}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-xs transition"
            >
              <Phone className="w-3 h-3 text-blue-400" />
              <span>{lead.contactChannels.phone}</span>
            </a>
          )}

          {lead.contactChannels.instagram && (
            <a
              href={`https://instagram.com/${lead.contactChannels.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-xs transition"
            >
              <Instagram className="w-3 h-3 text-pink-400" />
              <span>{lead.contactChannels.instagram}</span>
            </a>
          )}

          {lead.contactChannels.email && (
            <a
              href={`mailto:${lead.contactChannels.email}?subject=${encodeURIComponent(
                `Iluminação Arquitetural e Paisagística - ${lead.title}`
              )}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-xs transition"
              title={lead.contactChannels.email}
            >
              <Mail className="w-3 h-3 text-cyan-400" />
              <span>Email</span>
            </a>
          )}

          {lead.contactChannels.website && (
            <a
              href={lead.contactChannels.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md text-xs transition"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>Site / Anúncio</span>
            </a>
          )}

          {/* Quick validation button when in pending queue */}
          {lead.contactVerificationStatus === 'pending' && onVerifyContact && (
            <button
              type="button"
              onClick={() => onVerifyContact(lead.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-md text-xs font-semibold transition cursor-pointer"
              title="Marcar contato como conferido e auditado pelo prestador"
            >
              <CheckCircle className="w-3 h-3 text-amber-400" />
              <span>Validar Contato</span>
            </button>
          )}
        </div>

        {/* Opportunity Summary (Ratings & Ticket) */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 mb-3">
          <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-800 pb-2 mb-2">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Fachada</div>
              <div className="text-xs font-bold text-amber-300">
                {'★'.repeat(lead.opportunity.facadePotential)}
                {'☆'.repeat(5 - lead.opportunity.facadePotential)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pátio/Piscina</div>
              <div className="text-xs font-bold text-amber-300">
                {'★'.repeat(lead.opportunity.patioPoolPotential)}
                {'☆'.repeat(5 - lead.opportunity.patioPoolPotential)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Jardim</div>
              <div className="text-xs font-bold text-amber-300">
                {'★'.repeat(lead.opportunity.gardenPotential)}
                {'☆'.repeat(5 - lead.opportunity.gardenPotential)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Estimativa Comercial de Ticket:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {lead.opportunity.estimatedTicket}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1.5">
            <span className="text-slate-400">Intervenção Técnica Sugerida: </span>
            {lead.opportunity.recommendedType}
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 text-xs">
            <div>
              <span className="font-semibold text-slate-300">Descrição do Imóvel:</span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">{lead.description}</p>
            </div>

            <div>
              <span className="font-semibold text-amber-300">Argumento Chave de Venda:</span>
              <p className="text-slate-300 mt-0.5 italic">"{lead.opportunity.keySellingPoint}"</p>
            </div>

            {/* Custom Notes Section */}
            <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300 text-[11px]">Notas de Contato do Prestador:</span>
                {!showNotesEdit && (
                  <button
                    onClick={() => setShowNotesEdit(true)}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                  >
                    {lead.notes ? 'Editar nota' : '+ Adicionar nota'}
                  </button>
                )}
              </div>
              {showNotesEdit ? (
                <div>
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Ex: Liguei na portaria, zelador falou que a reunião de condomínio é dia 15..."
                    className="w-full bg-slate-900 text-slate-200 text-xs p-2 rounded border border-slate-700 focus:outline-none focus:border-amber-400"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-1.5">
                    <button
                      onClick={() => setShowNotesEdit(false)}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-2.5 py-1 text-[10px] bg-amber-500 text-slate-950 font-bold rounded"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic">
                  {lead.notes || 'Nenhuma nota registrada ainda.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Strip: Perfil do Imóvel, Mapa e Ficha Técnica */}
      <div className="mt-3 pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(lead)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Ficha & Perfil Detalhado</span>
            </button>
          )}

          {onViewOnMap && lead.coordinates && (
            <button
              onClick={() => onViewOnMap(lead)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs transition cursor-pointer"
              title="Localizar no Mapa Interativo"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          <button
            onClick={copyQuickDossier}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Copiar dados para enviar ao prestador"
          >
            {copiedQuick ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 text-[11px]">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Copiar Ficha</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer mr-auto sm:mr-0"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Menos
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Resumo
              </>
            )}
          </button>

          {onOpenSocialIntel && (
            <button
              onClick={() => onOpenSocialIntel(lead)}
              className="px-2 py-1 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 text-indigo-300 text-xs rounded-lg border border-indigo-500/40 transition flex items-center gap-1 cursor-pointer"
              title="Social Intelligence Multi-Provider (OSINT)"
            >
              <Globe2 className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Social Intel</span>
            </button>
          )}

          {onOpenInstagramIntel && (
            <button
              onClick={() => onOpenInstagramIntel(lead)}
              className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 text-xs rounded-lg border border-pink-500/40 transition flex items-center gap-1 cursor-pointer"
              title="Esteira Instagram Location Intelligence"
            >
              <Instagram className="w-3 h-3 text-pink-400" />
              <span className="hidden sm:inline">Instagram</span>
            </button>
          )}

          <button
            onClick={() => onInvestigate(lead)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Investigar mais dados sobre este imóvel com Gemini"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Investigar</span>
          </button>

          <button
            onClick={() => onGeneratePitch(lead)}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer"
            title="Gerar texto de abordagem personalizado para o prestador"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Pitch</span>
          </button>

          <button
            onClick={() => onDeleteLead(lead.id)}
            className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
            title="Remover alvo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

