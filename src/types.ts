export type LeadCategory = 
  | 'mansion_rental'
  | 'condo_residential'
  | 'boutique_hotel'
  | 'commercial_venue'
  | 'architect_partner'
  | 'luxury_broker';

export type PropertyType = 
  | 'casa'
  | 'apartamento'
  | 'comercial'
  | 'pousada_hotel'
  | 'terreno_obra';

export type LeadStatus = 
  | 'novo'
  | 'contatado'
  | 'visita_agendada'
  | 'proposta_enviada'
  | 'fechado'
  | 'descartado';

export type EvidenceType = 'fact' | 'inference' | 'estimate';

export type ContactVerificationStatus = 
  | 'pending'                  // Nenhum contato comprovado / apenas oportunidade para pesquisa
  | 'public_evidence_found'    // Contato comercial ou cadastral público encontrado com fonte
  | 'manually_confirmed';      // Contato validado manualmente por ligação/conversa

export interface EvidenceSource {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  collectedAt: string;
  type: EvidenceType;
  field?: string; // ex: 'phone', 'whatsapp', 'email', 'decisionMaker', 'amenities', 'address'
}

export interface NextAction {
  task: string;
  dueDate?: string;
  completed?: boolean;
  updatedAt?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DecisionMakerInfo {
  role: string;
  name?: string;
  decisionPower: 'Direto' | 'Intermediário' | 'Influenciador';
  strategy: string;
}

export interface ContactChannels {
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  website?: string;
  bookingUrl?: string;
  isVerified?: boolean;
}

export interface LightingOpportunity {
  facadePotential: number; // 1-5
  patioPoolPotential: number; // 1-5
  gardenPotential: number; // 1-5
  recommendedType: string;
  estimatedTicket: string;
  keySellingPoint: string;
}

export interface ArchitecturalDetails {
  style: string; // ex: 'Contemporâneo Minimalista', 'Neoclássico', 'Modernista com brises'
  exteriorMaterials: string[]; // ex: ['Concreto aparente', 'Pele de vidro', 'Brises de madeira Cumaru', 'Pedra Moledo']
  roofAndEaves: string; // ex: 'Beirais flutuantes com negativos para fitas LED', 'Platibanda com arandelas'
  floors: number;
  facadeWidthMeters?: number;
}

export interface SalesRentalHistory {
  estimatedMarketValue?: string; // ex: 'R$ 18.500.000'
  lastTransactionOrOffer?: string; // ex: 'Vendido em 2022 / Anúncio de Temporada R$ 8.000/dia'
  averageNightlyRate?: string; // ex: 'R$ 6.500 - R$ 9.500 / noite'
  rentalPlatform?: string; // ex: 'Airbnb Luxe / Temporada Jurerê'
  listingStatus?: 'Temporada Ativa' | 'Venda Exclusiva' | 'Uso Próprio' | 'Locação Comercial';
  historicalNotes?: string;
}

export interface LightingPotentialAudit {
  priorityLevel: 'alta' | 'media' | 'baixa';
  currentLightingState: string; // ex: 'Fachada apagada à noite, sem valorização dos beirais e volumes'
  facadeSuitability: string; // ex: 'Ideal para Wall Washers rasantes em pedra e perfis embutidos'
  patioPoolSuitability: string; // ex: 'Piscina de borda infinita com ausência de LED subaquático de alto rendimento'
  gardenLandscapeSuitability: string; // ex: 'Palmeiras e jardim tropical perfeitos para up-lights 3000K'
  recommendedColorTemp: string; // ex: '2700K - 3000K (Branco Quente Sofisticado)'
  estimatedFixtureCount?: number;
  technicalFeasibility: 'Imediata (Tubulação aparente/espera existente)' | 'Retrofit Completo' | 'Obra/Instalação Nova';
}

export interface CadastralDetails {
  matricula?: string; // Número da Matrícula no Cartório de Registro de Imóveis (RGI)
  cartorio?: string; // ex: '2º Ofício de Registro de Imóveis de Florianópolis'
  inscricaoImobiliaria?: string; // Inscrição Municipal / IPTU (Prefeitura de Florianópolis)
  loteamento?: string; // ex: 'Jurerê Internacional'
  quadra?: string; // ex: 'Quadra 14'
  lote?: string; // ex: 'Lote 08'
  areaTerrenoM2?: number; // Metragem do lote/terreno (m²)
  testadaMetros?: number; // Largura frontal do lote (metros)
  zoneamento?: string; // ex: 'ARP-2.5 (Área Residencial Predominante)'
  distritoSetor?: string; // ex: 'Distrito 03 - Canasvieiras / Jurerê'
  geoportalUrl?: string; // Link de consulta direta no GeoPortal Floripa
  proprietarioRegistrado?: string; // Titular registrado ou compromissário comprador
  statusAverbacao?: 'Averbado / Regular' | 'Em Regularização' | 'Escritura Pública' | 'Pendente';
  dataConsultaGeoportal?: string;
  observacoesCadastrais?: string;
}

export interface PropertyDetails {
  propertyType: PropertyType;
  builtAreaM2: number; // Metragem construída
  lotAreaM2?: number; // Metragem do lote/terreno
  yearBuilt: number; // Ano de construção
  architecturalDetails: ArchitecturalDetails;
  salesRentalHistory: SalesRentalHistory;
  lightingPotentialAudit: LightingPotentialAudit;
  cadastralDetails?: CadastralDetails;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface FunnelHistoryItem {
  id: string;
  date: string;
  action: string;
  note: string;
}

export interface LeadTarget {
  id: string;
  title: string;
  category: LeadCategory;
  city: string;
  neighborhood: string;
  address: string;
  description: string;
  decisionMaker: DecisionMakerInfo;
  contactChannels: ContactChannels;
  opportunity: LightingOpportunity;
  propertyDetails?: PropertyDetails;
  matricula?: string;
  inscricaoImobiliaria?: string;
  coordinates?: GeoCoordinates;
  status: LeadStatus;
  history: FunnelHistoryItem[];
  source: string;
  canonicalUrl?: string;
  listingId?: string;
  originType?: 'airbnb' | 'official_site' | 'public_registry' | 'manual' | 'other';
  contactVerificationStatus?: ContactVerificationStatus;
  evidenceSources?: EvidenceSource[];
  groundingSources?: GroundingSource[];
  notes?: string;
  customPitch?: string;
  isFavorite?: boolean;
  cnpj?: string;
  isVerifiedRealContact?: boolean;
  needsReview?: boolean;
  reviewReason?: string;
  nextAction?: NextAction;
  ledSuitabilityScore?: number; // 0-100 (pontuação explicável técnica de iluminação)
  dataReliabilityScore?: number; // 0-100 (confiabilidade baseada em fatos vs inferências)
  managementCompany?: {
    name: string;
    website?: string;
    phone?: string;
    evidenceUrl?: string;
  };
  cachedAt?: string;
  isQuotaFallback?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdvancedSearchFilters {
  searchTerm: string;
  propertyType: 'all' | PropertyType;
  minAreaM2: number | '';
  maxAreaM2: number | '';
  yearRange: 'all' | 'recent_2020' | '2010_2019' | '2000_2009' | 'pre_2000';
  lightingPriority: 'all' | 'alta' | 'media' | 'baixa';
  category: LeadCategory | 'all';
  status: LeadStatus | 'all';
  zone: string;
  neighborhoodFilter?: 'all' | 'jurere_internacional' | 'jurere_tradicional' | 'to_confirm';
  originFilter?: 'all' | 'airbnb' | 'official_site' | 'public_registry' | 'manual';
  evidenceFilter?: 'all' | 'manually_confirmed' | 'public_evidence_found' | 'pending';
  contactFilter?: 'all' | 'has_contact' | 'no_contact';
  reviewQueueFilter?: 'all' | 'needs_review' | 'pending_validation';
}

export interface SearchFilterState {
  city: string;
  category: LeadCategory | 'all';
  focus: 'geral' | 'fachada' | 'patio_piscina' | 'paisagismo';
  query: string;
  propertyType?: PropertyType | 'all';
  minAreaM2?: number;
  yearBuiltRange?: string;
}

export interface OsintGuideStep {
  title: string;
  portal: string;
  url?: string;
  explanation: string;
  howToUse: string;
  proTip: string;
}

export interface CnpjPartner {
  nome_socio: string;
  qualificacao_socio: string;
  faixa_etaria?: string;
  data_entrada_sociedade?: string;
}

export interface CnpjQueryResult {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral: string;
  data_inicio_atividade: string;
  cnae_fiscal_descricao: string;
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1?: string;
  correio_eletronico?: string;
  capital_social?: number;
  qsa?: CnpjPartner[];
  source?: string;
}

export interface CepQueryResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  coordinates?: GeoCoordinates;
  source?: string;
}

export interface GeocodeQueryResult {
  place_id?: number | string;
  display_name: string;
  lat: string | number;
  lon: string | number;
  type?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}
