import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  PlusCircle, 
  Check, 
  Copy, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Compass, 
  Sparkles,
  ArrowRight,
  Landmark,
  Save,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CnpjQueryResult, CepQueryResult, GeocodeQueryResult, LeadTarget, CadastralDetails } from '../types';

interface PublicDatabaseViewProps {
  leads?: LeadTarget[];
  onImportLead?: (newLead: Partial<LeadTarget>) => void;
  onUpdateLead?: (updatedLead: LeadTarget) => void;
  onNavigateToMap?: (lat: number, lng: number) => void;
}

export const PublicDatabaseView: React.FC<PublicDatabaseViewProps> = ({
  leads = [],
  onImportLead,
  onUpdateLead,
  onNavigateToMap
}) => {
  const [activeTab, setActiveTab] = useState<'cnpj' | 'geofloripa' | 'nominatim' | 'portals'>('cnpj');
  
  // CNPJ Search state
  const [cnpjInput, setCnpjInput] = useState('');
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjResult, setCnpjResult] = useState<CnpjQueryResult | null>(null);
  const [cnpjImported, setCnpjImported] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // CEP / GeoFloripa state
  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepResult, setCepResult] = useState<CepQueryResult | null>(null);

  // Nominatim Geocoding state
  const [geoInput, setGeoInput] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResults, setGeoResults] = useState<GeocodeQueryResult[]>([]);
  const [geoSearched, setGeoSearched] = useState(false);

  // Cadastral / Matrícula workflow state
  const [cadMode, setCadMode] = useState<'existing' | 'new'>('existing');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [cadTitle, setCadTitle] = useState('');
  const [cadAddress, setCadAddress] = useState('');
  const [cadMatricula, setCadMatricula] = useState('');
  const [cadInscricao, setCadInscricao] = useState('');
  const [cadQuadra, setCadQuadra] = useState('');
  const [cadLote, setCadLote] = useState('');
  const [cadTestada, setCadTestada] = useState('20');
  const [cadTitular, setCadTitular] = useState('');
  const [cadCartorio, setCadCartorio] = useState('2º Ofício de Registro de Imóveis de Florianópolis');
  const [cadAverbacao, setCadAverbacao] = useState<'Averbado / Regular' | 'Em Regularização' | 'Escritura Pública' | 'Pendente'>('Averbado / Regular');
  const [cadSavedNotice, setCadSavedNotice] = useState<string | null>(null);

  // When selected lead changes, populate fields
  const handleSelectLeadForCadastre = (id: string) => {
    setSelectedLeadId(id);
    const found = leads.find((l) => l.id === id);
    if (found) {
      const cad = found.propertyDetails?.cadastralDetails;
      setCadMatricula(found.matricula || cad?.matricula || '');
      setCadInscricao(found.inscricaoImobiliaria || cad?.inscricaoImobiliaria || '');
      setCadQuadra(cad?.quadra || '');
      setCadLote(cad?.lote || '');
      setCadTestada(cad?.testadaMetros ? String(cad.testadaMetros) : '20');
      setCadCartorio(cad?.cartorio || '2º Ofício de Registro de Imóveis de Florianópolis');
      setCadAverbacao((cad?.statusAverbacao as any) || 'Averbado / Regular');
      setCadTitular(found.decisionMaker?.name || '');
    }
  };

  const handleSaveCadastral = () => {
    if (cadMode === 'existing') {
      const target = leads.find((l) => l.id === selectedLeadId);
      if (!target) return;

      const testadaNum = cadTestada ? Number(cadTestada) : 20;

      const newCad: CadastralDetails = {
        matricula: cadMatricula.trim() || undefined,
        inscricaoImobiliaria: cadInscricao.trim() || undefined,
        cartorio: cadCartorio,
        loteamento: 'Jurerê Internacional',
        quadra: cadQuadra.trim() || undefined,
        lote: cadLote.trim() || undefined,
        testadaMetros: testadaNum,
        zoneamento: 'ARP-2.5 (Área Residencial Predominante)',
        geoportalUrl: 'https://geofloripa.pmf.sc.gov.br/',
        statusAverbacao: cadAverbacao
      };

      const updatedLead: LeadTarget = {
        ...target,
        matricula: cadMatricula.trim() || undefined,
        inscricaoImobiliaria: cadInscricao.trim() || undefined,
        propertyDetails: {
          ...target.propertyDetails,
          cadastralDetails: newCad,
          architecturalDetails: {
            ...target.propertyDetails?.architecturalDetails,
            facadeWidthMeters: testadaNum,
            style: target.propertyDetails?.architecturalDetails?.style || 'Contemporâneo de Alto Padrão',
            exteriorMaterials: target.propertyDetails?.architecturalDetails?.exteriorMaterials || ['Concreto', 'Vidro'],
            roofAndEaves: target.propertyDetails?.architecturalDetails?.roofAndEaves || 'Beirais lineares',
            floors: target.propertyDetails?.architecturalDetails?.floors || 2
          }
        },
        decisionMaker: cadTitular.trim() ? {
          ...target.decisionMaker,
          name: cadTitular.trim()
        } : target.decisionMaker,
        history: [
          {
            id: `h-cad-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            action: 'Atualização Cadastral & Matrícula',
            note: cadMatricula.trim()
              ? `Matrícula nº ${cadMatricula.trim()} vinculada via GeoFloripa / 2º RI.`
              : 'Dados cadastrais atualizados.'
          },
          ...target.history
        ],
        updatedAt: new Date().toISOString()
      };

      if (onUpdateLead) {
        onUpdateLead(updatedLead);
      }
      setCadSavedNotice(`Matrícula e dados cadastrais salvos com sucesso no alvo "${target.title}"!`);
      setTimeout(() => setCadSavedNotice(null), 4000);
    } else {
      // New lead creation with cadastre
      if (!cadTitle.trim()) {
        alert('Por favor, informe o título ou nome do imóvel.');
        return;
      }
      const timestamp = new Date().toISOString().split('T')[0];
      const testadaNum = cadTestada ? Number(cadTestada) : 20;

      const newCad: CadastralDetails = {
        matricula: cadMatricula.trim() || undefined,
        inscricaoImobiliaria: cadInscricao.trim() || undefined,
        cartorio: cadCartorio,
        loteamento: 'Jurerê Internacional',
        quadra: cadQuadra.trim() || undefined,
        lote: cadLote.trim() || undefined,
        testadaMetros: testadaNum,
        zoneamento: 'ARP-2.5 (Área Residencial Predominante)',
        geoportalUrl: 'https://geofloripa.pmf.sc.gov.br/',
        statusAverbacao: cadAverbacao
      };

      if (onImportLead) {
        onImportLead({
          title: cadTitle.trim(),
          category: 'mansion_rental',
          city: 'Florianópolis - SC',
          neighborhood: 'Jurerê Internacional',
          address: cadAddress.trim() || 'Jurerê Internacional, Florianópolis - SC',
          description: `Imóvel cadastrado com base nas informações do GeoFloripa e 2º RI. Matrícula: ${cadMatricula || 'A confirmar'}.`,
          matricula: cadMatricula.trim() || undefined,
          inscricaoImobiliaria: cadInscricao.trim() || undefined,
          propertyDetails: {
            propertyType: 'casa',
            builtAreaM2: 600,
            lotAreaM2: 750,
            yearBuilt: 2022,
            cadastralDetails: newCad,
            architecturalDetails: {
              style: 'Contemporâneo de Luxo',
              exteriorMaterials: ['Pele de Vidro', 'Concreto Ripado', 'Mármore'],
              roofAndEaves: 'Beirais modernos lineares',
              floors: 2,
              facadeWidthMeters: testadaNum
            },
            salesRentalHistory: {
              estimatedMarketValue: 'R$ 16.000.000',
              listingStatus: 'Temporada Ativa',
              historicalNotes: 'Cadastrado no módulo GeoFloripa.'
            },
            lightingPotentialAudit: {
              priorityLevel: 'alta',
              currentLightingState: 'Projeto de iluminação de destaque a desenvolver',
              facadeSuitability: 'Wall Washers LED 3000K + Beirais Lineares',
              patioPoolSuitability: 'Fitas LED náuticas IP68 e balizadores',
              gardenLandscapeSuitability: 'Up-lights em palmeiras imperiais',
              recommendedColorTemp: '2700K - 3000K',
              estimatedFixtureCount: 32,
              technicalFeasibility: 'Imediata (Tubulação aparente/espera existente)'
            }
          },
          decisionMaker: {
            role: 'Proprietário(a) / Titular da Matrícula',
            name: cadTitular.trim() || 'A confirmar na certidão',
            decisionPower: 'Direto',
            strategy: 'Apresentar simulação 3D luminotécnica personalizada.'
          },
          opportunity: {
            facadePotential: 5,
            patioPoolPotential: 5,
            gardenPotential: 4,
            recommendedType: 'Iluminação Cênica de Fachada LED + Jardim',
            estimatedTicket: 'R$ 30.000 - R$ 55.000',
            keySellingPoint: 'Valorização imediata do patrimônio e elegância noturna.'
          },
          source: 'GeoFloripa / 2º RI de Florianópolis'
        });
      }
      setCadSavedNotice(`Novo imóvel "${cadTitle.trim()}" cadastrado com sucesso no Pipeline!`);
      setCadTitle('');
      setCadAddress('');
      setTimeout(() => setCadSavedNotice(null), 4000);
    }
  };

  const jurereCeps = [
    { cep: '88053-300', label: 'Av. dos Búzios (Mansões & Beach Clubs)' },
    { cep: '88053-310', label: 'Alameda das Algas (Condomínios de Luxo)' },
    { cep: '88053-320', label: 'Av. das Lagostas (Residências Contemporâneas)' },
    { cep: '88053-350', label: 'Rua dos Salmões (Jurerê Tradicional)' },
  ];

  const handleSearchCnpj = async (targetCnpj?: string) => {
    const raw = targetCnpj || cnpjInput;
    const clean = raw.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjError('O CNPJ deve conter exatamente 14 dígitos.');
      return;
    }

    setCnpjLoading(true);
    setCnpjError(null);
    setCnpjResult(null);
    setCnpjImported(false);

    try {
      const res = await fetch(`/api/public-data/cnpj/${clean}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível localizar o CNPJ informado.');
      }
      setCnpjResult(data);
    } catch (err: any) {
      setCnpjError(err.message || 'Erro ao consultar banco público da Receita Federal.');
    } finally {
      setCnpjLoading(false);
    }
  };

  const handleSearchCep = async (targetCep?: string) => {
    const raw = targetCep || cepInput;
    const clean = raw.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepError('O CEP deve conter 8 dígitos.');
      return;
    }

    setCepLoading(true);
    setCepError(null);
    setCepResult(null);

    try {
      const res = await fetch(`/api/public-data/cep/${clean}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'CEP não encontrado nas bases oficiais.');
      }
      setCepResult(data);
    } catch (err: any) {
      setCepError(err.message || 'Erro ao consultar CEP na base oficial.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSearchNominatim = async () => {
    if (!geoInput.trim()) return;
    setGeoLoading(true);
    setGeoSearched(true);
    try {
      const res = await fetch(`/api/public-data/geocode?q=${encodeURIComponent(geoInput)}`);
      const data = await res.json();
      setGeoResults(data.results || []);
    } catch (err) {
      setGeoResults([]);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleImportToPipeline = () => {
    if (!cnpjResult || !onImportLead) return;

    const isCondo = cnpjResult.cnae_fiscal_descricao.toLowerCase().includes('condom') || 
                    cnpjResult.razao_social.toLowerCase().includes('condom');
    
    // Identifica o síndico ou sócio
    const leadPartner = cnpjResult.qsa?.[0];
    const decisionMakerName = leadPartner?.nome_socio || 'A confirmar';
    const decisionMakerRole = leadPartner?.qualificacao_socio || (isCondo ? 'Síndico(a)' : 'Sócio-Administrador');

    const newLead: Partial<LeadTarget> = {
      title: cnpjResult.nome_fantasia || cnpjResult.razao_social,
      category: isCondo ? 'condo_residential' : 'commercial_venue',
      city: `${cnpjResult.municipio} - ${cnpjResult.uf}`,
      neighborhood: cnpjResult.bairro || 'Jurerê Internacional',
      address: `${cnpjResult.logradouro}, ${cnpjResult.numero}${cnpjResult.complemento ? ' - ' + cnpjResult.complemento : ''}, CEP ${cnpjResult.cep}`,
      description: `Identificado via base pública da Receita Federal (CNPJ: ${cnpjResult.cnpj}). Atividade: ${cnpjResult.cnae_fiscal_descricao}.`,
      status: 'novo',
      decisionMaker: {
        role: decisionMakerRole,
        name: decisionMakerName,
        decisionPower: 'Direto',
        strategy: isCondo 
          ? `Apresentar ao síndico laudo de redução energética (ROI) e modernização do pórtico e piscina.`
          : `Demonstrar valorização estética noturna da fachada e atração de público qualificado.`,
      },
      contactChannels: {
        phone: cnpjResult.ddd_telefone_1 || '',
        email: cnpjResult.correio_eletronico || '',
      },
      opportunity: {
        facadePotential: 5,
        patioPoolPotential: isCondo ? 5 : 4,
        gardenPotential: 4,
        recommendedType: isCondo 
          ? 'Retrofit LED Condominial + Iluminação Cênica de Fachada e Piscina'
          : 'Iluminação Cênica Externa de Alto Impacto',
        estimatedTicket: isCondo ? 'R$ 45.000 - R$ 80.000' : 'R$ 30.000 - R$ 50.000',
        keySellingPoint: isCondo 
          ? 'Redução de até 65% na conta de luz das áreas comuns com luminárias náuticas anti-maresia.'
          : 'Destaque visual noturno que atrai clientes e valoriza o ticket médio.',
      },
      source: `Bases Públicas (Receita Federal / CNPJ: ${cnpjResult.cnpj})`,
    };

    onImportLead(newLead);
    setCnpjImported(true);
  };

  const copyCnpjData = () => {
    if (!cnpjResult) return;
    const text = `DADOS PÚBLICOS - RECEITA FEDERAL
Razão Social: ${cnpjResult.razao_social}
Nome Fantasia: ${cnpjResult.nome_fantasia || 'N/A'}
CNPJ: ${cnpjResult.cnpj}
Situação: ${cnpjResult.situacao_cadastral}
Endereço: ${cnpjResult.logradouro}, ${cnpjResult.numero} - ${cnpjResult.bairro}, ${cnpjResult.municipio}/${cnpjResult.uf} - CEP ${cnpjResult.cep}
Telefone: ${cnpjResult.ddd_telefone_1 || 'Não informado'}
E-mail: ${cnpjResult.correio_eletronico || 'Não informado'}
Sócios/Síndico:
${(cnpjResult.qsa || []).map(s => `- ${s.nome_socio} (${s.qualificacao_socio})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-amber-950/30 border border-cyan-800/40 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">
                  Consulta Integrada em Bancos de Dados Públicos
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  APIs Públicas & Gratuitas
                </span>
              </div>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                Acesse diretamente dados cadastrais da <strong>Receita Federal (BrasilAPI)</strong>, 
                mapeamento municipal oficial do <strong>GeoFloripa (PMF)</strong> e 
                geocodificação aberta do <strong>OpenStreetMap</strong> para identificar síndicos, 
                sócios-administradores, metragens e contatos formais sem custo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Receita Federal Online
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-cyan-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              GeoFloripa PMF
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('cnpj')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'cnpj'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Receita Federal / CNPJ & Síndicos
          </button>

          <button
            onClick={() => setActiveTab('geofloripa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'geofloripa'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            GeoFloripa (PMF) & CEP
          </button>

          <button
            onClick={() => setActiveTab('nominatim')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'nominatim'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            OpenStreetMap (Geocodificador Aberto)
          </button>

          <button
            onClick={() => setActiveTab('portals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'portals'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Guia de Portais Oficiais
          </button>
        </div>
      </div>

      {/* TAB 1: CONSULTA CNPJ & SÍNDICOS */}
      {activeTab === 'cnpj' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Pesquisar CNPJ de Condomínio ou Empresa em Florianópolis
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Informe o CNPJ (com ou sem pontuação) para consultar em tempo real a base pública da Receita Federal e obter o Quadro de Sócios e Administradores (QSA).
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={cnpjInput}
                  onChange={(e) => setCnpjInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCnpj()}
                  placeholder="Ex: 08.383.824/0001-00 ou 14728993000192"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                onClick={() => handleSearchCnpj()}
                disabled={cnpjLoading}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                {cnpjLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consultando Receita...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Consultar Dados Públicos
                  </>
                )}
              </button>
            </div>

            {/* Informational tip for querying real CNPJs */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>💡 Dica: Digite o CNPJ de qualquer condomínio edilício ou empresa real para obter o Quadro de Sócios (QSA), síndicos e dados cadastrais oficiais.</span>
            </div>
          </div>

          {/* Error Notice */}
          {cnpjError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{cnpjError}</span>
            </div>
          )}

          {/* Result Card */}
          {cnpjResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative">
              {/* Header result */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 uppercase">
                      Situação: {cnpjResult.situacao_cadastral}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                      CNPJ: {cnpjResult.cnpj}
                    </span>
                    <span className="text-xs text-slate-400">
                      Abertura: {cnpjResult.data_inicio_atividade}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {cnpjResult.nome_fantasia || cnpjResult.razao_social}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Razão Social: {cnpjResult.razao_social}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyCnpjData}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Ficha
                      </>
                    )}
                  </button>

                  {onImportLead && (
                    <button
                      onClick={handleImportToPipeline}
                      disabled={cnpjImported}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-emerald-600 text-slate-950 disabled:text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      {cnpjImported ? (
                        <>
                          <Check className="w-4 h-4" />
                          Adicionado aos Leads!
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Importar para o Radar de Iluminação
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Endereço */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Localização & Endereço Oficial
                  </div>
                  <p className="text-sm text-white font-medium">
                    {cnpjResult.logradouro}, {cnpjResult.numero} {cnpjResult.complemento && `(${cnpjResult.complemento})`}
                  </p>
                  <p className="text-xs text-slate-300">
                    Bairro: <span className="text-cyan-300 font-semibold">{cnpjResult.bairro}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    CEP: {cnpjResult.cep} • {cnpjResult.municipio} - {cnpjResult.uf}
                  </p>
                </div>

                {/* Contatos Oficiais */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Contatos Cadastrados
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{cnpjResult.ddd_telefone_1 || 'Telefone não declarado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="font-mono truncate">{cnpjResult.correio_eletronico || 'E-mail não declarado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Início de Atividades: {cnpjResult.data_inicio_atividade}</span>
                    </div>
                  </div>
                </div>

                {/* Atividade & Natureza */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    CNAE & Natureza Jurídica
                  </div>
                  <p className="text-xs text-white font-medium">
                    {cnpjResult.cnae_fiscal_descricao}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {cnpjResult.natureza_juridica}
                  </p>
                  {cnpjResult.capital_social ? (
                    <p className="text-xs text-amber-300 font-mono font-semibold">
                      Capital Social: R$ {cnpjResult.capital_social.toLocaleString('pt-BR')}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Quadro de Sócios e Administradores (QSA) - O GRANDE DIFERENCIAL */}
              <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-800/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">
                      Quadro de Sócios e Administradores (QSA) - Decisores Oficiais
                    </h4>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                    Fonte Oficial: Receita Federal
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Em condomínios edilícios, o QSA revela formalmente o <strong>Síndico Eleito</strong> e/ou a 
                  <strong> Administradora Homologada</strong> responsável pela contratação de serviços e obras elétricas.
                </p>

                {cnpjResult.qsa && cnpjResult.qsa.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {cnpjResult.qsa.map((partner, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                          {partner.nome_socio.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">
                            {partner.nome_socio}
                          </h5>
                          <span className="text-[11px] font-semibold text-cyan-400 block">
                            {partner.qualificacao_socio}
                          </span>
                          {partner.data_entrada_sociedade && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Mandato / Entrada: {partner.data_entrada_sociedade}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum sócio ou administrador listado publicamente para esta inscrição.
                  </p>
                )}
              </div>

              {/* Dica Técnica de Vendas */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200 leading-relaxed">
                  <strong>Estratégia de Captação para este Alvo:</strong> Aborde o decisor acima mencionado fazendo 
                  referência ao nome exato do condomínio/empresa. Em condomínios, aponte que a modernização da iluminação 
                  externa com LED blindado náutico IP67 reduz a taxa condominial mensal e valoriza o patrimônio dos condôminos 
                  sem necessitar de chamada de capital extraordinária.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GEOFLORIPA (PREFEITURA DE FLORIANÓPOLIS) & MATRÍCULA DE LOTES */}
      {activeTab === 'geofloripa' && (
        <div className="space-y-6">
          {/* Main GeoFloripa Header & Official Access Hub */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-cyan-400" />
                  GeoFloripa (PMF) - Geoprocessamento, Lotes & Matrículas Imobiliárias
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  O <strong>GeoFloripa</strong> é o sistema oficial de dados espaciais da Prefeitura de Florianópolis.
                  Aqui você obtém a <strong>Inscrição Imobiliária Municipal</strong>, número de <strong>Quadra e Lote</strong>, 
                  medidas exatas de testada e área, e vincula a <strong>Matrícula Registral</strong> do 
                  2º Ofício de Registro de Imóveis da Comarca da Capital.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://geofloripa.pmf.sc.gov.br/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir GeoFloripa (PMF)
                </a>
              </div>
            </div>

            {/* Quick Access Ribbons for Registry and Cadastre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
              <a
                href="https://geofloripa.pmf.sc.gov.br/"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">PMF Geoprocessamento</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                </div>
                <h4 className="text-xs font-bold text-white">GeoFloripa Web</h4>
                <p className="text-[11px] text-slate-400 mt-1">Inscrição Imobiliária, quadra, lote e ortofoto oficial 2023.</p>
              </a>

              <a
                href="https://www.2riflorianopolis.com.br/"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Cartório Competente</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
                </div>
                <h4 className="text-xs font-bold text-white">2º Registro de Imóveis</h4>
                <p className="text-[11px] text-slate-400 mt-1">Circunscrição de Jurerê e Norte da Ilha. Emissão de certidão de matrícula.</p>
              </a>

              <a
                href="https://registradores.onr.org.br/"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Nacional / Online</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                </div>
                <h4 className="text-xs font-bold text-white">ONR Registradores</h4>
                <p className="text-[11px] text-slate-400 mt-1">Pedido digital de matrícula imobiliária de inteiro teor com CPF/CNPJ.</p>
              </a>

              <a
                href="https://planejamento.pmf.sc.gov.br/"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-xl transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Plano Diretor PMF</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition" />
                </div>
                <h4 className="text-xs font-bold text-white">Consulta Prévia</h4>
                <p className="text-[11px] text-slate-400 mt-1">Zoneamento ARP-2.5, taxa de ocupação, recuos e viabilidade construtiva.</p>
              </a>
            </div>
          </div>

          {/* Interactive Tool: Cadastrar / Vincular Matrícula ao Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Módulo de Registro Cadastral & Matrícula de Lote
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha as informações levantadas no GeoFloripa ou cartório para vincular diretamente aos alvos comerciais.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
                <button
                  type="button"
                  onClick={() => setCadMode('existing')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    cadMode === 'existing' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Vincular a Alvo Existente ({leads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCadMode('new')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    cadMode === 'new' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Cadastrar Novo Lote/Imóvel
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {cadSavedNotice && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{cadSavedNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Target Selection or New Target Info */}
              {cadMode === 'existing' ? (
                <div className="md:col-span-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <label className="block text-slate-300 font-bold mb-1">
                    Selecione o Imóvel no Radar Comercial:
                  </label>
                  {leads.length > 0 ? (
                    <select
                      value={selectedLeadId}
                      onChange={(e) => handleSelectLeadForCadastre(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title} — {l.address} {l.matricula ? `(Matrícula: ${l.matricula})` : '(Sem matrícula)'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-400 text-xs italic">Nenhum imóvel disponível no radar. Use a opção "+ Cadastrar Novo Lote/Imóvel".</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nome / Identificação do Imóvel:</label>
                    <input
                      type="text"
                      value={cadTitle}
                      onChange={(e) => setCadTitle(e.target.value)}
                      placeholder="Ex: Mansão Alameda das Algas - Lote 12"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Endereço Completo em Jurerê:</label>
                    <input
                      type="text"
                      value={cadAddress}
                      onChange={(e) => setCadAddress(e.target.value)}
                      placeholder="Ex: Alameda das Algas, 340, Jurerê Internacional"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </>
              )}

              {/* Matrícula (RGI) & Inscrição Imobiliária (PMF) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>Matrícula do Imóvel (RGI):</span>
                  <span className="text-[10px] text-amber-400 font-normal">2º Ofício de Registro de Imóveis</span>
                </label>
                <input
                  type="text"
                  value={cadMatricula}
                  onChange={(e) => setCadMatricula(e.target.value)}
                  placeholder="Ex: 48.912 ou 52.104"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>Inscrição Imobiliária (PMF / IPTU):</span>
                  <span className="text-[10px] text-cyan-400 font-normal">GeoFloripa Oficial</span>
                </label>
                <input
                  type="text"
                  value={cadInscricao}
                  onChange={(e) => setCadInscricao(e.target.value)}
                  placeholder="Ex: 51.84.029.0482.001-234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Quadra, Lote & Testada */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Quadra:</label>
                  <input
                    type="text"
                    value={cadQuadra}
                    onChange={(e) => setCadQuadra(e.target.value)}
                    placeholder="Ex: 14"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Lote:</label>
                  <input
                    type="text"
                    value={cadLote}
                    onChange={(e) => setCadLote(e.target.value)}
                    placeholder="Ex: 08"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Testada (m):</label>
                  <input
                    type="number"
                    value={cadTestada}
                    onChange={(e) => setCadTestada(e.target.value)}
                    placeholder="Ex: 22"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Status de Averbação & Titular */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Status de Averbação da Edificação:</label>
                <select
                  value={cadAverbacao}
                  onChange={(e) => setCadAverbacao(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Averbado / Regular">Averbado / Regular (Habite-se Concluído)</option>
                  <option value="Em Regularização">Em Regularização de Obra</option>
                  <option value="Escritura Pública">Escritura Pública Lavrada</option>
                  <option value="Pendente">Pendente de Averbação</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">
                  Proprietário(a) / Titular na Matrícula (se obtido via certidão):
                </label>
                <input
                  type="text"
                  value={cadTitular}
                  onChange={(e) => setCadTitular(e.target.value)}
                  placeholder="Ex: Família Silveira / Holding Patrimonial Jurerê Participações LTDA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Os dados cadastrais enriquecem o Dossiê Técnico e o Laudo Luminotécnico do imóvel.
              </span>

              <button
                type="button"
                onClick={handleSaveCadastral}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{cadMode === 'existing' ? 'Salvar Matrícula no Alvo' : 'Cadastrar Imóvel no Pipeline'}</span>
              </button>
            </div>
          </div>

          {/* Roteiro Prático: Como Obter a Matrícula e Inscrição Imobiliária */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Roteiro Passo a Passo: Obtenção de Matrícula de Lotes em Jurerê Internacional
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Passo 1: Localizar Lote</span>
                <h5 className="text-xs font-bold text-white">GeoFloripa (PMF)</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Acesse <a href="https://geofloripa.pmf.sc.gov.br/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">geofloripa.pmf.sc.gov.br</a>, digite o nome da alameda/avenida e ative a camada "Lotes e Quadras".
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Passo 2: Inscrição Imobiliária</span>
                <h5 className="text-xs font-bold text-white">Atributos do Lote</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Clique com o cursor sobre o lote da mansão. O balão de informações exibirá a Inscrição Imobiliária Municipal, Quadra, Lote e testada frontal.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Passo 3: Cartório de Registro</span>
                <h5 className="text-xs font-bold text-white">2º Ofício de Florianópolis</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Todo o bairro de Jurerê Internacional pertence à circunscrição do 2º Ofício de Registro de Imóveis (Norte da Ilha).
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Passo 4: Certidão de Matrícula</span>
                <h5 className="text-xs font-bold text-white">ONR ou Balcão Online</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Pelo ONR (<a href="https://registradores.onr.org.br/" target="_blank" rel="noreferrer" className="text-purple-400 underline">registradores.onr.org.br</a>) solicite a certidão de inteiro teor para verificar o proprietário e averbação da residência.
                </p>
              </div>
            </div>
          </div>

          {/* CEP Search Bar (Real ViaCEP integration) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Consulta Rápida de CEP & Logradouro Oficial (ViaCEP Florianópolis)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Informe o CEP para obter a nomenclatura exata cadastrada nos Correios e abrir o logradouro no GeoFloripa.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={cepInput}
                onChange={(e) => setCepInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchCep()}
                placeholder="Ex: 88053-300 ou 88053310"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleSearchCep()}
                disabled={cepLoading}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {cepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Localizar Logradouro
              </button>
            </div>

            {/* CEP Shortcuts */}
            <div className="mt-3 flex flex-wrap gap-2">
              {jurereCeps.map((c) => (
                <button
                  key={c.cep}
                  onClick={() => {
                    setCepInput(c.cep);
                    handleSearchCep(c.cep);
                  }}
                  className="text-[11px] px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-slate-300 transition cursor-pointer font-mono"
                >
                  {c.cep} ({c.label.split(' ')[0]})
                </button>
              ))}
            </div>

            {cepError && (
              <p className="mt-3 text-xs text-red-400">{cepError}</p>
            )}

            {cepResult && (
              <div className="mt-4 p-4 bg-slate-950 border border-cyan-800/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {cepResult.logradouro}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Bairro: <span className="text-cyan-300 font-semibold">{cepResult.bairro}</span> • {cepResult.localidade} - {cepResult.uf}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    CEP: {cepResult.cep} • Base: {cepResult.source}
                  </p>
                </div>

                <a
                  href={`https://geofloripa.pmf.sc.gov.br/`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/40 transition shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir no GeoFloripa
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OPENSTREETMAP NOMINATIM */}
      {activeTab === 'nominatim' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Geocodificador Aberto OpenStreetMap Nominatim
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Localize logradouros, praças, condomínios fechados e pontos de interesse em Florianópolis para extrair coordenadas geográficas precisas (latitude e longitude).
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={geoInput}
                onChange={(e) => setGeoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchNominatim()}
                placeholder="Ex: Alameda das Algas, Avenida dos Búzios, Jurerê..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSearchNominatim}
                disabled={geoLoading}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar Coordenadas
              </button>
            </div>

            {/* Results list */}
            {geoSearched && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400">
                  {geoResults.length} locais encontrados no OpenStreetMap:
                </span>

                {geoResults.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-950 rounded-xl">
                    Nenhum resultado localizado para a busca. Tente digitar o nome da rua ou avenida em Jurerê.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {geoResults.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white mb-0.5">
                            {item.display_name}
                          </h4>
                          <span className="text-[11px] font-mono text-cyan-400">
                            Lat: {Number(item.lat).toFixed(5)} • Lng: {Number(item.lon).toFixed(5)}
                          </span>
                        </div>

                        {onNavigateToMap && (
                          <button
                            onClick={() => onNavigateToMap(Number(item.lat), Number(item.lon))}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/30 transition shrink-0 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Ver no Mapa do App
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GUIA DE PORTAIS PÚBLICOS & APIS */}
      {activeTab === 'portals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Prefeitura de Florianópolis
              </span>
              <a href="https://geofloripa.pmf.sc.gov.br/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <h4 className="text-base font-bold text-white">GeoFloripa (IDE Florianópolis)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Infraestrutura de Dados Espaciais da Prefeitura Municipal de Florianópolis. Contém ortofotos de alta precisão, limites de lotes, zoneamento (Plano Diretor) e numeração predial oficial de Jurerê.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              API / Acesso: WMS, WFS e Portal Web Aberto
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Receita Federal do Brasil
              </span>
              <a href="https://brasilapi.com.br/" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <h4 className="text-base font-bold text-white">BrasilAPI (Base Oficial CNPJ & QSA)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              API pública gratuita e de código aberto que consulta diretamente a base pública da Receita Federal. Revela razão social, e-mail de contato e o Quadro de Sócios e Administradores (QSA) de qualquer condomínio de Jurerê.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              API: brasilapi.com.br/api/cnpj/v1/{'{cnpj}'} (100% Gratuita)
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Governo Federal & JUCESC
              </span>
              <a href="https://www.redesim.gov.br/" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <h4 className="text-base font-bold text-white">Redesim & Junta Comercial SC</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Portal nacional de registro de empresas e pessoas jurídicas. Permite a consulta de atas de assembleias condominiais, alterações contratuais e identificação dos representantes legais perante a lei.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Acesso: Consulta de Pessoa Jurídica via Gov.br
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Cartório de Registro de Imóveis
              </span>
              <a href="https://www.2riflorianopolis.com.br/" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <h4 className="text-base font-bold text-white">2º Ofício de Registro de Imóveis de Florianópolis</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cartório com circunscrição registral sobre Jurerê Internacional, Jurerê Tradicional, Canasvieiras e todo o Norte da Ilha. Emite certidões de matrícula, buscas de bens por CPF/CNPJ e certidões de inteiro teor.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Portal: 2riflorianopolis.com.br • Comarca da Capital
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ONR / Conselho Nacional de Justiça
              </span>
              <a href="https://registradores.onr.org.br/" target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <h4 className="text-base font-bold text-white">ONR - Operador Nacional do Registro de Imóveis</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Plataforma oficial nacional que interliga todos os cartórios de registro de imóveis do Brasil. Permite solicitar certidões eletrônicas com validade jurídica de qualquer lote ou mansão em Florianópolis.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Acesso: registradores.onr.org.br (Serviço de Atendimento Eletrônico Compartilhado - SAEC)
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                OpenStreetMap Foundation
              </span>
              <a href="https://nominatim.org/" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <h4 className="text-base font-bold text-white">Nominatim Geocoding API</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Motor de busca e geocodificação mundial gratuito e sem chave de API obrigatória. Permite converter nomes de alamedas, praças e condomínios de Florianópolis em coordenadas geográficas exatas.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              API: nominatim.openstreetmap.org/search (Uso livre c/ User-Agent)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
