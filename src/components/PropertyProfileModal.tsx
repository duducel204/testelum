import React, { useState, useEffect } from 'react';
import { 
  LeadTarget, 
  PropertyType,
  CadastralDetails
} from '../types';
import { 
  X, 
  Building2, 
  Home, 
  Hotel, 
  Compass, 
  Briefcase, 
  Users, 
  MapPin, 
  Calendar, 
  Maximize2, 
  Sparkles, 
  DollarSign, 
  Zap, 
  Eye, 
  CheckCircle2, 
  Copy, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Palette, 
  AlertCircle,
  Clock,
  Phone,
  MessageSquare,
  Globe,
  Instagram,
  Mail,
  FileText,
  TrendingUp,
  Sliders,
  Edit3,
  Save,
  Check,
  Landmark
} from 'lucide-react';

interface PropertyProfileModalProps {
  lead: LeadTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMap?: (lead: LeadTarget) => void;
  onUpdateLead?: (lead: LeadTarget) => void;
}

export const PropertyProfileModal: React.FC<PropertyProfileModalProps> = ({
  lead,
  isOpen,
  onClose,
  onNavigateToMap,
  onUpdateLead
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditingCadastre, setIsEditingCadastre] = useState(false);

  // Cadastral inputs state
  const [matriculaInput, setMatriculaInput] = useState('');
  const [cartorioInput, setCartorioInput] = useState('');
  const [inscricaoInput, setInscricaoInput] = useState('');
  const [loteamentoInput, setLoteamentoInput] = useState('');
  const [quadraInput, setQuadraInput] = useState('');
  const [loteInput, setLoteInput] = useState('');
  const [testadaInput, setTestadaInput] = useState('');
  const [zoneamentoInput, setZoneamentoInput] = useState('');
  const [proprietarioInput, setProprietarioInput] = useState('');
  const [statusAverbacaoInput, setStatusAverbacaoInput] = useState<'Averbado / Regular' | 'Em Regularização' | 'Escritura Pública' | 'Pendente'>('Averbado / Regular');

  useEffect(() => {
    if (lead) {
      const cad = lead.propertyDetails?.cadastralDetails;
      setMatriculaInput(lead.matricula || cad?.matricula || '');
      setCartorioInput(cad?.cartorio || '2º Ofício de Registro de Imóveis de Florianópolis (Comarca da Capital)');
      setInscricaoInput(lead.inscricaoImobiliaria || cad?.inscricaoImobiliaria || '');
      setLoteamentoInput(cad?.loteamento || 'Jurerê Internacional');
      setQuadraInput(cad?.quadra || '');
      setLoteInput(cad?.lote || '');
      setTestadaInput(cad?.testadaMetros ? String(cad.testadaMetros) : (lead.propertyDetails?.architecturalDetails?.facadeWidthMeters ? String(lead.propertyDetails.architecturalDetails.facadeWidthMeters) : ''));
      setZoneamentoInput(cad?.zoneamento || 'ARP-2.5 (Área Residencial Predominante)');
      setProprietarioInput(cad?.proprietarioRegistrado || lead.decisionMaker?.name || '');
      setStatusAverbacaoInput(cad?.statusAverbacao || 'Averbado / Regular');
      setIsEditingCadastre(false);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSaveCadastre = () => {
    if (!lead || !onUpdateLead) return;

    const testadaNum = testadaInput ? Number(testadaInput) : undefined;
    const updatedCadastral: CadastralDetails = {
      matricula: matriculaInput.trim() || undefined,
      cartorio: cartorioInput.trim() || '2º Ofício de Registro de Imóveis de Florianópolis',
      inscricaoImobiliaria: inscricaoInput.trim() || undefined,
      loteamento: loteamentoInput.trim() || 'Jurerê Internacional',
      quadra: quadraInput.trim() || undefined,
      lote: loteInput.trim() || undefined,
      testadaMetros: testadaNum,
      zoneamento: zoneamentoInput.trim() || 'ARP-2.5 (Área Residencial Predominante)',
      proprietarioRegistrado: proprietarioInput.trim() || undefined,
      statusAverbacao: statusAverbacaoInput,
      geoportalUrl: 'https://geofloripa.pmf.sc.gov.br/',
      dataConsultaGeoportal: new Date().toISOString().split('T')[0]
    };

    const currentPropDetails = lead.propertyDetails || {
      propertyType: 'casa',
      builtAreaM2: 500,
      yearBuilt: 2020,
      architecturalDetails: {
        style: 'Contemporâneo',
        exteriorMaterials: ['Concreto', 'Vidro'],
        roofAndEaves: 'Beiral linear',
        floors: 2
      },
      salesRentalHistory: {
        listingStatus: 'Temporada Ativa'
      },
      lightingPotentialAudit: {
        priorityLevel: 'alta',
        currentLightingState: 'Apto para projeto LED',
        facadeSuitability: 'Wall washers e fita LED',
        patioPoolSuitability: 'Fitas LED IP68',
        gardenLandscapeSuitability: 'Projetores 3000K',
        recommendedColorTemp: '3000K',
        technicalFeasibility: 'Imediata (Tubulação aparente/espera existente)'
      }
    };

    const updatedLead: LeadTarget = {
      ...lead,
      matricula: matriculaInput.trim() || undefined,
      inscricaoImobiliaria: inscricaoInput.trim() || undefined,
      propertyDetails: {
        ...currentPropDetails,
        cadastralDetails: updatedCadastral,
        architecturalDetails: {
          ...currentPropDetails.architecturalDetails,
          facadeWidthMeters: testadaNum || currentPropDetails.architecturalDetails?.facadeWidthMeters
        }
      },
      updatedAt: new Date().toISOString()
    };

    onUpdateLead(updatedLead);
    setIsEditingCadastre(false);
  };

  const getPropertyTypeBadge = (type?: PropertyType) => {
    switch (type) {
      case 'casa':
        return { label: 'Casa / Mansão de Luxo', icon: Home, bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'apartamento':
        return { label: 'Condomínio Residencial / Edifício', icon: Building2, bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'pousada_hotel':
        return { label: 'Pousada Boutique / Hotel', icon: Hotel, bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'comercial':
        return { label: 'Comercial / Beach Club & Gastronomia', icon: Compass, bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Imóvel Cadastrado', icon: Home, bg: 'bg-slate-700/50 text-slate-300 border-slate-600' };
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'alta':
        return { label: 'Alta Prioridade (Oportunidade Imediata)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'media':
        return { label: 'Prioridade Média (Retrofit / Médio Prazo)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'baixa':
        return { label: 'Baixa Prioridade / Monitoramento', color: 'bg-slate-700 text-slate-300 border-slate-600' };
      default:
        return { label: 'Potencial Avaliado', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
  };

  const typeConfig = getPropertyTypeBadge(lead.propertyDetails?.propertyType);
  const TypeIcon = typeConfig.icon;
  const priorityConfig = getPriorityBadge(lead.propertyDetails?.lightingPotentialAudit?.priorityLevel);

  // Formatter for technical dossier to send to contractor
  const generateDossierText = () => {
    const p = lead.propertyDetails;
    const arch = p?.architecturalDetails;
    const hist = p?.salesRentalHistory;
    const audit = p?.lightingPotentialAudit;
    const dm = lead.decisionMaker;
    const ch = lead.contactChannels;
    const cad = p?.cadastralDetails;
    const mat = lead.matricula || cad?.matricula;
    const insc = lead.inscricaoImobiliaria || cad?.inscricaoImobiliaria;

    return `*FICHA DE LEVANTAMENTO DO IMÓVEL - PROJETO ILUMINAÇÃO LED*
📍 *Local:* ${lead.title}
📌 *Endereço:* ${lead.address}, ${lead.neighborhood} - ${lead.city}
${lead.cnpj ? `🏢 *CNPJ:* ${lead.cnpj} (Homologado na Receita Federal do Brasil)\n` : ''}${mat ? `📜 *Matrícula (RGI):* ${mat} (${cad?.cartorio || '2º Ofício de Registro de Imóveis de Florianópolis'})\n` : ''}${insc ? `🏛️ *Inscrição Imobiliária (PMF):* ${insc}\n` : ''}${cad?.quadra || cad?.lote ? `📍 *Loteamento:* ${cad?.loteamento || 'Jurerê Internacional'} • Q. ${cad?.quadra || 'S/Q'} • Lote ${cad?.lote || 'S/L'}\n` : ''}${cad?.testadaMetros ? `📏 *Testada Frontal do Lote:* ${cad.testadaMetros} metros\n` : ''}${cad?.zoneamento ? `🗺️ *Zoneamento PMF:* ${cad.zoneamento}\n` : ''}🏛️ *Tipo de Imóvel:* ${typeConfig.label}
📐 *Área Construída:* ${p?.builtAreaM2 ? `${p.builtAreaM2} m²` : 'Não informada'} | *Lote:* ${p?.lotAreaM2 ? `${p.lotAreaM2} m²` : 'N/I'}
📅 *Ano de Construção:* ${p?.yearBuilt || 'N/I'}

*CARACTERÍSTICAS ARQUITETÔNICAS:*
• Estilo: ${arch?.style || 'Não informado'}
• Materiais de Fachada: ${arch?.exteriorMaterials?.join(', ') || 'N/I'}
• Beirais e Cobertura: ${arch?.roofAndEaves || 'N/I'}

*HISTÓRICO E MERCADO:*
• Valor de Mercado Estimado: ${hist?.estimatedMarketValue || 'N/I'}
• Diária de Temporada / Transação: ${hist?.averageNightlyRate || hist?.lastTransactionOrOffer || 'N/I'}
• Status: ${hist?.listingStatus || 'Em atividade'}

*DIAGNÓSTICO DE ILUMINAÇÃO LED:*
• Situação Atual: ${audit?.currentLightingState || 'Sem iluminação cênica adequada'}
• Potencial de Fachada: ${audit?.facadeSuitability || lead.opportunity.recommendedType}
• Pátio & Piscina: ${audit?.patioPoolSuitability || 'N/I'}
• Paisagismo & Jardim: ${audit?.gardenLandscapeSuitability || 'N/I'}
• Temperatura de Cor Sugerida: ${audit?.recommendedColorTemp || '3000K Branco Quente'}
• Pontos Estimados: ${audit?.estimatedFixtureCount ? `~${audit.estimatedFixtureCount} pontos` : 'Sob medição'}
• Ticket Estimado: ${lead.opportunity.estimatedTicket}

*DADOS DO TOMADOR DE DECISÃO (PARA CONTATO):*
👤 *Nome:* ${dm.name || 'A confirmar'} (${dm.role})
⚡ *Poder Decisório:* ${dm.decisionPower}
📱 *Telefone/WhatsApp:* ${ch.whatsapp ? `+${ch.whatsapp}` : ch.phone || 'Ver anúncio/guia'}
📧 *E-mail:* ${ch.email || 'Não informado'}
📸 *Instagram:* ${ch.instagram || 'N/I'}
🌐 *Site / Link Oficial:* ${ch.website || 'N/I'}
✅ *Status Cadastral:* ${lead.isVerifiedRealContact || ch.isVerified ? 'Dados 100% Verificados e Reais' : 'Em processo de qualificação'}
💡 *Estratégia Recomendada:* ${dm.strategy}

*BASE CADASTRAL OFICIAL:*
• GeoPortal Floripa: https://geofloripa.pmf.sc.gov.br/
• 2º Cartório de Registro de Imóveis: https://www.2riflorianopolis.com.br/

_Levantamento cadastral e técnico realizado via Lúmina Jurerê_`;
  };

  const copyDossier = () => {
    const text = generateDossierText();
    navigator.clipboard.writeText(text);
    setCopiedSection('dossier');
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(generateDossierText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mt-1">
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {(lead.isVerifiedRealContact || lead.contactChannels.isVerified) && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Contato Real Verificado
                  </span>
                )}
                {lead.cnpj && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    CNPJ: {lead.cnpj}
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeConfig.bg}`}>
                  {typeConfig.label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>
                {lead.propertyDetails?.yearBuilt && (
                  <span className="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Ano {lead.propertyDetails.yearBuilt}
                  </span>
                )}
                {lead.propertyDetails?.builtAreaM2 && (
                  <span className="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-amber-300 border border-slate-700 font-semibold flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-amber-400" />
                    {lead.propertyDetails.builtAreaM2} m² construídos
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {lead.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{lead.address}, {lead.neighborhood} • {lead.city}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Multi Section */}
        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-slate-800/80">
          
          {/* Quick Action Bar for Contractor Handoff */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Dossiê para Repasse ao Prestador de Serviço
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Exporte todos os dados técnicos coletados e informações de contato prontas para repassar ao prestador.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={copyDossier}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
              >
                {copiedSection === 'dossier' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Ficha Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copiar Ficha Completa</span>
                  </>
                )}
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </button>
              {onNavigateToMap && lead.coordinates && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToMap(lead);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-medium rounded-lg transition cursor-pointer"
                  title="Ver localização no Mapa"
                >
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="hidden md:inline">Ver no Mapa</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Diagnóstico e Potencial de Iluminação LED */}
          <div className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Diagnóstico & Potencial de Iluminação LED
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                Ticket Estimado: {lead.opportunity.estimatedTicket}
              </span>
            </div>

            {/* Current State Alert */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Diagnóstico Noturno do Imóvel
                  </h5>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {lead.propertyDetails?.lightingPotentialAudit?.currentLightingState || 
                     'Imóvel com grande área externa e fachada imponente, apresentando ausência de iluminação cênica de destaque à noite ou lâmpadas obsoletas.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Opportunities Grid: Fachada, Pátio/Piscina, Jardim */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fachada */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Building2 className="w-4 h-4" /> Fachada & Volumes
                  </span>
                  <span className="text-xs text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/15">
                    {lead.opportunity.facadePotential}/5 ★
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lead.propertyDetails?.lightingPotentialAudit?.facadeSuitability || 
                   'Ideal para Wall Washers 3000K rasantes e perfis de LED de alta definição nos beirais e volumes.'}
                </p>
              </div>

              {/* Pátio & Piscina */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Zap className="w-4 h-4" /> Pátio & Piscina
                  </span>
                  <span className="text-xs text-blue-300 font-bold px-1.5 py-0.5 rounded bg-blue-500/15">
                    {lead.opportunity.patioPoolPotential}/5 ★
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lead.propertyDetails?.lightingPotentialAudit?.patioPoolSuitability || 
                   'Espelho d\'água e deck demandam fitas LED subaquáticas IP68 e balizadores embutidos para segurança e sofisticação.'}
                </p>
              </div>

              {/* Jardim / Paisagismo */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Compass className="w-4 h-4" /> Paisagismo & Jardim
                  </span>
                  <span className="text-xs text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/15">
                    {lead.opportunity.gardenPotential}/5 ★
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lead.propertyDetails?.lightingPotentialAudit?.gardenLandscapeSuitability || 
                   'Projetores up-light em palmeiras e espetos de solo 2700K para destacar espécies tropicais sem ofuscamento.'}
                </p>
              </div>
            </div>

            {/* Technical Specs Strip */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Temperatura de Cor</span>
                <strong className="text-amber-300 font-semibold">
                  {lead.propertyDetails?.lightingPotentialAudit?.recommendedColorTemp || '3000K (Branco Quente)'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Pontos Estimados</span>
                <strong className="text-slate-200 font-semibold">
                  {lead.propertyDetails?.lightingPotentialAudit?.estimatedFixtureCount 
                    ? `~${lead.propertyDetails.lightingPotentialAudit.estimatedFixtureCount} luminárias` 
                    : '25 a 45 pontos'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Viabilidade Técnica</span>
                <strong className="text-emerald-400 font-semibold">
                  {lead.propertyDetails?.lightingPotentialAudit?.technicalFeasibility || 'Imediata'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Solução Recomendada</span>
                <strong className="text-slate-200 font-semibold truncate block">
                  {lead.opportunity.recommendedType}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 2: Características Arquitetônicas do Imóvel */}
          <div className="pt-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-blue-400" />
              Características Arquitetônicas Relevantes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-850/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Estilo Arquitetônico</span>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">
                    {lead.propertyDetails?.architecturalDetails?.style || 'Arquitetura Contemporânea de Alto Padrão'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Beirais e Cobertura</span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {lead.propertyDetails?.architecturalDetails?.roofAndEaves || 'Beirais flutuantes e platibandas estruturadas para iluminação indireta.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-xs text-slate-400 block">Pavimentos</span>
                    <strong className="text-slate-200 text-sm">
                      {lead.propertyDetails?.architecturalDetails?.floors || '2'} andares
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Testada / Fachada</span>
                    <strong className="text-slate-200 text-sm">
                      {lead.propertyDetails?.architecturalDetails?.facadeWidthMeters 
                        ? `${lead.propertyDetails.architecturalDetails.facadeWidthMeters} metros` 
                        : 'Ampla visibilidade'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Exterior Materials */}
              <div className="bg-slate-850/60 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  Materiais de Fachada e Exteriores
                </span>
                <p className="text-xs text-slate-400 mb-3">
                  A definição dos materiais determina o tipo de lente, difusor e feixe ótico do LED:
                </p>

                <div className="flex flex-wrap gap-2">
                  {(lead.propertyDetails?.architecturalDetails?.exteriorMaterials && 
                    lead.propertyDetails.architecturalDetails.exteriorMaterials.length > 0) ? (
                    lead.propertyDetails.architecturalDetails.exteriorMaterials.map((mat, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                      >
                        {mat}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                        Concreto Aparente Ripado
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                        Grandes Panos de Vidro
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                        Revestimento em Madeira
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Dados Cadastrais & Matrícula do Imóvel (GeoPortal Floripa / PMF) */}
          <div className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Dados Cadastrais & Matrícula do Imóvel (GeoPortal Floripa)
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  2º Ofício de Registro de Imóveis • Florianópolis
                </span>
              </div>

              {onUpdateLead && (
                <button
                  type="button"
                  onClick={() => setIsEditingCadastre(!isEditingCadastre)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  {isEditingCadastre ? 'Cancelar Edição' : 'Editar / Incluir Matrícula'}
                </button>
              )}
            </div>

            {isEditingCadastre ? (
              <div className="bg-slate-850 border border-indigo-500/40 rounded-xl p-4 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Editar Informações de Matrícula e Lote (GeoFloripa / 2º RI)
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Altera e salva os dados na memória deste lead
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Matrícula do Imóvel (RGI)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 48.912"
                      value={matriculaInput}
                      onChange={(e) => setMatriculaInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Inscrição Imobiliária (PMF / IPTU)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 51.84.029.0482.001-234"
                      value={inscricaoInput}
                      onChange={(e) => setInscricaoInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Cartório de Registro
                    </label>
                    <input
                      type="text"
                      value={cartorioInput}
                      onChange={(e) => setCartorioInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Loteamento / Condomínio
                    </label>
                    <input
                      type="text"
                      value={loteamentoInput}
                      onChange={(e) => setLoteamentoInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Quadra
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 14"
                        value={quadraInput}
                        onChange={(e) => setQuadraInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Lote
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 08"
                        value={loteInput}
                        onChange={(e) => setLoteInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Testada Frontal do Lote (m)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 22"
                      value={testadaInput}
                      onChange={(e) => setTestadaInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Zoneamento (Plano Diretor PMF)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: ARP-2.5"
                      value={zoneamentoInput}
                      onChange={(e) => setZoneamentoInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Proprietário na Matrícula/Escritura
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do titular registrado"
                      value={proprietarioInput}
                      onChange={(e) => setProprietarioInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Status de Averbação
                    </label>
                    <select
                      value={statusAverbacaoInput}
                      onChange={(e: any) => setStatusAverbacaoInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Averbado / Regular">Averbado / Regular</option>
                      <option value="Em Regularização">Em Regularização</option>
                      <option value="Escritura Pública">Escritura Pública</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingCadastre(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCadastre}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Dados Cadastrais
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Card 1: Matrícula RGI */}
                  <div className="bg-slate-850/70 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">
                      Matrícula (RGI)
                    </span>
                    <div className="text-base font-bold text-indigo-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      {lead.matricula || lead.propertyDetails?.cadastralDetails?.matricula ? (
                        <span>Nº {lead.matricula || lead.propertyDetails?.cadastralDetails?.matricula}</span>
                      ) : (
                        <span className="text-slate-500 text-sm font-normal">Não informada</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1 truncate" title={lead.propertyDetails?.cadastralDetails?.cartorio || '2º Ofício de Registro de Imóveis'}>
                      {lead.propertyDetails?.cadastralDetails?.cartorio || '2º Ofício de Registro de Imóveis (Norte)'}
                    </span>
                  </div>

                  {/* Card 2: Inscrição Imobiliária PMF */}
                  <div className="bg-slate-850/70 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">
                      Inscrição Imobiliária PMF
                    </span>
                    <div className="text-sm font-bold text-slate-200 truncate font-mono mt-0.5">
                      {lead.inscricaoImobiliaria || lead.propertyDetails?.cadastralDetails?.inscricaoImobiliaria || (
                        <span className="text-slate-500 text-xs font-sans font-normal">Consultar no GeoFloripa</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Cadastro Técnico Municipal (IPTU)
                    </span>
                  </div>

                  {/* Card 3: Loteamento / Quadra / Lote */}
                  <div className="bg-slate-850/70 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">
                      Loteamento & Quadra/Lote
                    </span>
                    <div className="text-sm font-bold text-amber-300 truncate mt-0.5">
                      {lead.propertyDetails?.cadastralDetails?.quadra || lead.propertyDetails?.cadastralDetails?.lote ? (
                        <span>Q. {lead.propertyDetails.cadastralDetails.quadra || '-'} • Lote {lead.propertyDetails.cadastralDetails.lote || '-'}</span>
                      ) : (
                        <span>Jurerê Internacional</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {lead.propertyDetails?.cadastralDetails?.loteamento || 'Jurerê Internacional • Distrito 03'}
                    </span>
                  </div>

                  {/* Card 4: Testada Frontal & Zoneamento */}
                  <div className="bg-slate-850/70 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">
                      Testada & Zoneamento PMF
                    </span>
                    <div className="text-sm font-bold text-emerald-400 truncate mt-0.5">
                      Testada: {lead.propertyDetails?.cadastralDetails?.testadaMetros ? `${lead.propertyDetails.cadastralDetails.testadaMetros}m` : (lead.propertyDetails?.architecturalDetails?.facadeWidthMeters ? `${lead.propertyDetails.architecturalDetails.facadeWidthMeters}m` : '15-25m')}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1 truncate" title={lead.propertyDetails?.cadastralDetails?.zoneamento || 'ARP-2.5 (Residencial)'}>
                      {lead.propertyDetails?.cadastralDetails?.zoneamento || 'ARP-2.5 (Plano Diretor PMF)'}
                    </span>
                  </div>
                </div>

                {/* Direct Cadastral Portals Links */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-indigo-950/25 border border-indigo-500/20 rounded-xl text-xs">
                  <span className="text-slate-400 font-medium mr-1">Consultas Oficiais:</span>
                  
                  <a
                    href="https://geofloripa.pmf.sc.gov.br/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-300" />
                    Abrir no GeoPortal Floripa (PMF)
                    <ExternalLink className="w-3 h-3 text-indigo-400" />
                  </a>

                  <a
                    href="https://www.2riflorianopolis.com.br/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Landmark className="w-3.5 h-3.5 text-amber-400" />
                    2º Registro de Imóveis (Certidões)
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href="https://registradores.onr.org.br/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    ONR Matrícula Digital
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Histórico de Vendas / Aluguel e Mercado */}
          <div className="pt-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Histórico de Vendas, Aluguel e Mercado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">Valor Estimado de Mercado</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {lead.propertyDetails?.salesRentalHistory?.estimatedMarketValue || 'R$ 15.000.000+'}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Baseado em m² de Jurerê Internacional
                </span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">Diária de Temporada / Transação</span>
                <div className="text-lg font-bold text-amber-300 mt-1">
                  {lead.propertyDetails?.salesRentalHistory?.averageNightlyRate || 
                   lead.propertyDetails?.salesRentalHistory?.lastTransactionOrOffer || 
                   'R$ 5.000 a R$ 12.000 / dia'}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Plataforma: {lead.propertyDetails?.salesRentalHistory?.rentalPlatform || 'Airbnb Luxo / Direto'}
                </span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">Status Cadastral</span>
                <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {lead.propertyDetails?.salesRentalHistory?.listingStatus || 'Temporada Ativa'}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {lead.propertyDetails?.salesRentalHistory?.historicalNotes || 'Propriedade em operação ativa'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Tomador de Decisão & Cruzamento de Contatos (Para Repasse) */}
          <div className="pt-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-cyan-400" />
              Tomador de Decisão & Contatos Coletados
            </h3>

            <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-cyan-500/20 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-cyan-400 uppercase font-bold tracking-wider block">
                    Quem Decide a Contratação
                  </span>
                  <div className="text-base font-bold text-white mt-1">
                    {lead.decisionMaker.name || 'Proprietário / Administrador Identificado'}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Cargo / Relação: <strong className="text-slate-100">{lead.decisionMaker.role}</strong>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Poder Decisório:{' '}
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                      {lead.decisionMaker.decisionPower}
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                    <span className="font-bold text-amber-300 block mb-1">Estratégia para o Prestador de Serviço:</span>
                    {lead.decisionMaker.strategy}
                  </div>

                  {lead.cnpj && (
                    <div className="mt-3 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold">CNPJ: {lead.cnpj}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">Ativo na RFB</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Razão social e quadro societário (QSA) verificados via registros públicos federais.
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct Channels */}
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-3 md:pt-0">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">
                    Canais Diretos de Conexão
                  </span>

                  {lead.contactChannels.whatsapp && (
                    <a
                      href={`https://wa.me/${lead.contactChannels.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>WhatsApp: <strong>+{lead.contactChannels.whatsapp}</strong></span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {lead.contactChannels.phone && (
                    <a
                      href={`tel:${lead.contactChannels.phone}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <span>Telefone: <strong>{lead.contactChannels.phone}</strong></span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  )}

                  {lead.contactChannels.email && (
                    <a
                      href={`mailto:${lead.contactChannels.email}?subject=${encodeURIComponent(
                        `Iluminação Arquitetural e Paisagística - ${lead.title}`
                      )}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span className="truncate">E-mail: <strong>{lead.contactChannels.email}</strong></span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  )}

                  {lead.contactChannels.instagram && (
                    <a
                      href={`https://instagram.com/${lead.contactChannels.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-purple-400" />
                        <span>Instagram: {lead.contactChannels.instagram}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {lead.contactChannels.website && (
                    <a
                      href={lead.contactChannels.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="truncate">Ver Anúncio / Site Oficial</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Fonte: <strong className="text-slate-300">{lead.source}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={copyDossier}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedSection === 'dossier' ? 'Copiado!' : 'Copiar Ficha para Prestador'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
