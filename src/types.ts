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
  instagramIntelligence?: InstagramIntelligenceData;
  socialIntelligence?: SocialIntelligenceData;
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

export type GeminiModelId = 
  | 'gemini-3.8-flash'
  | 'gemini-3.5-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-pro-preview';

export type ChatRole = 'luminotecnico' | 'copywriter' | 'osint' | 'commercial';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

// ==========================================
// INSTAGRAM LOCATION INTELLIGENCE TYPES
// Pipeline: IMÓVEL -> LOCALIZAÇÃO -> LOCAIS PÚBLICOS -> POSTS PÚBLICOS -> PERFIS PÚBLICOS -> EVIDÊNCIAS
// ==========================================

export interface InstagramLocationTag {
  id: string;
  name: string; // ex: "Jurerê Internacional", "Avenida dos Búzios", "Jurerê Open Shopping", "Donna Jurerê"
  category: 'beach_club' | 'street_hotspot' | 'condo_neighborhood' | 'restaurant_bar' | 'landmark';
  distanceApproxMeters?: number;
  instagramLocationUrl?: string;
  relevanceScore: number; // 0-100
  description: string;
}

export interface InstagramPublicPost {
  id: string;
  postUrl: string;
  authorUsername: string;
  authorName?: string;
  postType: 'photo' | 'carousel' | 'reel' | 'video';
  caption: string;
  postedAtApprox?: string;
  locationName?: string;
  relevanceReason: string; // ex: "Menciona mansão na Av. dos Búzios e projeto luminotécnico"
  tags: string[];
  visualAesthetics?: {
    hasNightShot?: boolean;
    poolLightingVisible?: boolean;
    facadeArchitectureVisible?: boolean;
    gardenLightingVisible?: boolean;
  };
}

export interface InstagramPublicProfile {
  id: string;
  username: string;
  fullName: string;
  profileUrl: string;
  profileType: 'architect' | 'broker_agency' | 'property_manager' | 'owner_influencer' | 'lighting_designer' | 'hospitality';
  followerCountApprox?: string;
  bioSnippet?: string;
  correlationReason: string; // ex: "Arquiteto autor do projeto da residência em Jurerê"
  contactMatch?: {
    whatsappOrPhone?: string;
    email?: string;
    website?: string;
  };
}

export interface InstagramIntelligenceData {
  analyzedAt: string;
  targetAddress: string;
  targetNeighborhood: string;
  summary: string;
  suggestedAction: string;
  locationTags: InstagramLocationTag[];
  publicPosts: InstagramPublicPost[];
  publicProfiles: InstagramPublicProfile[];
  derivedEvidences: EvidenceSource[];
}

// ==========================================
// CANONICAL SOCIAL INTELLIGENCE DATA CONTRACTS
// ==========================================

export type SocialPlatform = 
  | 'instagram'
  | 'airbnb'
  | 'google'
  | 'public_web'
  | 'real_estate'
  | 'directory'
  | string;

/**
 * Representa um local público associado a uma fonte social/web.
 */
export interface SocialLocation {
  id: string;
  platform: SocialPlatform;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  sourceUrl?: string;
  collectedAt?: string;
}

/**
 * Representa conteúdo ou postagem pública encontrada em fonte aberta.
 */
export interface PublicSocialPost {
  id: string;
  platform: SocialPlatform;
  url: string;
  publishedAt?: string;
  location?: string | SocialLocation;
  captionSnippet?: string;
  authorPublicHandle?: string;
  collectedAt: string;
  sourceProvider?: string;
}

/**
 * Representa somente informações públicas mínimas sobre um perfil encontrado.
 * Sem perfilamento comportamental ou deduções de intimidade.
 */
export interface PublicSocialProfile {
  id: string;
  platform: SocialPlatform;
  publicHandle: string;
  profileUrl?: string;
  displayName?: string;
  profileType?: string; // ex: 'arquiteto', 'imobiliaria', 'turista', 'influenciador', 'comercio'
  collectedAt: string;
}

/**
 * Representa uma evidência verificável encontrada em fonte pública.
 * Interopera com a taxonomia nativa EvidenceSource do Lúmina (fact vs inference vs estimate).
 * REGRA: O fato de uma postagem pública marcar o local X comprova unicamente
 * a existência daquela publicação, não posse, residência ou poder de decisão.
 */
export interface SocialEvidence {
  id: string;
  leadId: string;
  platform: SocialPlatform;
  sourceType: string; // ex: 'post_location_tag', 'caption_mention', 'profile_bio', 'geo_tag'
  sourceUrl: string;
  observedAt?: string;
  collectedAt: string;
  description: string;
  confidence: 'high' | 'medium' | 'low' | number;
  evidenceType?: EvidenceType; // 'fact' (conteúdo público observável) | 'inference' (relação sugerida)
}

export type RelationshipType =
  | 'morador_presumido'
  | 'proprietario_presumido'
  | 'arquiteto_ou_designer'
  | 'corretor_ou_imobiliaria'
  | 'prestador_servico'
  | 'visitante_ou_turista'
  | 'inquilino_temporada'
  | string;

export type HypothesisStatus =
  | 'unverified'
  | 'under_review'
  | 'supported'
  | 'rejected';

/**
 * Representa estritamente uma HIPÓTESE relacional, NUNCA um fato comprovado.
 * Vincula evidências verificáveis a um perfil sem assumir automaticamente decisão ou propriedade.
 */
export interface RelationshipHypothesis {
  id: string;
  leadId: string;
  subjectProfileId: string;
  relationshipType: RelationshipType;
  confidence: 'high' | 'medium' | 'low' | number;
  evidenceIds: string[];
  status: HypothesisStatus;
  notes?: string;
}

export interface SocialIntelligenceMetadata {
  provider?: string;
  platform?: SocialPlatform;
  investigationId?: string;
  startedAt?: string;
  finishedAt?: string;
  status?: 'idle' | 'running' | 'completed' | 'failed' | string;
  mock?: boolean;
}

/**
 * Container genérico de Inteligência Social do Lead/Imóvel.
 * Agrupa fontes públicas (Instagram, Airbnb, Google, portais) sem acoplamento a um provedor específico.
 */
export interface SocialIntelligenceData {
  locations: SocialLocation[];
  posts: PublicSocialPost[];
  profiles: PublicSocialProfile[];
  evidence: SocialEvidence[];
  relationshipHypotheses: RelationshipHypothesis[];
  metadata?: SocialIntelligenceMetadata;
}


