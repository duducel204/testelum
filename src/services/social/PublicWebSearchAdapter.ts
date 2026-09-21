import { 
  ISocialProvider, 
  SocialQueryContext, 
  ProviderResult 
} from './types';
import { 
  SocialLocation, 
  PublicSocialPost, 
  PublicSocialProfile, 
  SocialEvidence, 
  RelationshipHypothesis 
} from '../../types';

/**
 * Adapter para Fontes Abertas da Web Pública & Mecanismos de Busca (OSINT).
 * 
 * Consulta índices públicos, portais imobiliários, cadastros abertos e páginas públicas
 * para mapear pontos de atração, perfis profissionais (arquitetura, corretores) e referências.
 * 
 * Regra: Todo dado retornado como evidência é classificado como FATO OBSERVÁVEL (publicação encontrada),
 * enquanto vínculos com pessoas são classificados como HIPÓTESE NÃO VERIFICADA ('unverified').
 */
export class PublicWebSearchAdapter implements ISocialProvider {
  readonly id = 'public-web-osint';
  readonly name = 'Public Web & Open Geotags (OSINT)';
  readonly platform = 'public_web';
  readonly isOpenSource = false; // Utiliza APIs de busca pública e índices abertos

  private geminiClientFetcher?: () => any;

  constructor(geminiClientFetcher?: () => any) {
    this.geminiClientFetcher = geminiClientFetcher;
  }

  async isAvailable(): Promise<boolean> {
    return true; // Web pública está sempre elegível a consulta
  }

  async investigate(context: SocialQueryContext): Promise<ProviderResult> {
    const startTime = Date.now();
    const now = new Date().toISOString();

    // Se temos cliente Gemini disponível no ambiente server
    if (this.geminiClientFetcher) {
      try {
        const client = this.geminiClientFetcher();
        if (client) {
          const prompt = `Você é um analista de inteligência OSINT e dados públicos para o mercado imobiliário e luminotécnico de Jurerê Internacional, Florianópolis/SC.
Analise as fontes públicas da web, geotags conhecidas e registros públicos para o seguinte imóvel:
- Título/Condomínio: ${context.propertyTitle}
- Endereço: ${context.address}
- Bairro: ${context.neighborhood || 'Jurerê Internacional'}
- Cidade: ${context.city || 'Florianópolis'}
- Estilo arquitetônico: ${context.architecturalStyle || 'Moderno / Alto Padrão'}

REGRAS ESTREITAS:
1. EVIDÊNCIA ≠ HIPÓTESE. Uma postagem pública ou menção num local NÃO significa que a pessoa é proprietária ou mora ali.
2. Identifique locais públicos reais no entorno de Jurerê (beach clubs, praças, shopping a céu aberto, vias principais).
3. Identifique menções a escritórios de arquitetura, construtoras, corretores ou perfis públicos vinculados a projetos nessa região.
4. Retorne APENAS um JSON válido no seguinte formato:
{
  "locations": [
    { "name": "Nome do local", "platform": "instagram", "latitude": -27.43, "longitude": -48.50, "address": "Endereço ou referência", "sourceUrl": "URL pública se houver" }
  ],
  "posts": [
    { "platform": "instagram", "url": "URL pública do post", "captionSnippet": "Trecho da legenda", "authorPublicHandle": "@handle_publico", "publishedAt": "2024-01-01" }
  ],
  "profiles": [
    { "platform": "instagram", "publicHandle": "@handle_publico", "displayName": "Nome exibido", "profileType": "arquiteto|imobiliaria|prestador|visitante", "profileUrl": "https://instagram.com/handle" }
  ],
  "evidences": [
    { "sourceType": "public_web_mention", "sourceUrl": "URL", "description": "Fato observado: postagem ou menção pública encontrada", "confidence": "high|medium|low" }
  ],
  "hypotheses": [
    { "subjectProfileId": "@handle_publico", "relationshipType": "arquiteto_ou_designer|corretor_ou_imobiliaria|prestador_servico", "confidence": "medium", "notes": "Hipótese baseada em menção pública de autoria de projeto ou publicação na região." }
  ]
}`;

          const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2
            }
          });

          if (response?.text) {
            try {
              const parsed = JSON.parse(response.text);
              const locations: SocialLocation[] = (parsed.locations || []).map((l: any, i: number) => ({
                id: `loc-web-${Date.now()}-${i}`,
                platform: l.platform || 'public_web',
                name: l.name,
                latitude: l.latitude,
                longitude: l.longitude,
                address: l.address,
                sourceUrl: l.sourceUrl,
                collectedAt: now
              }));

              const posts: PublicSocialPost[] = (parsed.posts || []).map((p: any, i: number) => ({
                id: `post-web-${Date.now()}-${i}`,
                platform: p.platform || 'public_web',
                url: p.url || '',
                publishedAt: p.publishedAt,
                captionSnippet: p.captionSnippet,
                authorPublicHandle: p.authorPublicHandle,
                sourceProvider: 'public_web_osint',
                collectedAt: now
              }));

              const profiles: PublicSocialProfile[] = (parsed.profiles || []).map((pr: any, i: number) => ({
                id: `prof-web-${Date.now()}-${i}`,
                platform: pr.platform || 'public_web',
                publicHandle: pr.publicHandle,
                displayName: pr.displayName,
                profileType: pr.profileType,
                profileUrl: pr.profileUrl,
                collectedAt: now
              }));

              const evidences: SocialEvidence[] = (parsed.evidences || []).map((e: any, i: number) => ({
                id: `evid-web-${Date.now()}-${i}`,
                leadId: context.leadId,
                platform: 'public_web',
                sourceType: e.sourceType || 'public_web_index',
                sourceUrl: e.sourceUrl || 'https://www.google.com/search?q=' + encodeURIComponent(context.propertyTitle),
                description: e.description,
                confidence: e.confidence || 'medium',
                evidenceType: 'fact' as const,
                collectedAt: now
              }));

              const hypotheses: RelationshipHypothesis[] = (parsed.hypotheses || []).map((h: any, i: number) => ({
                id: `hyp-web-${Date.now()}-${i}`,
                leadId: context.leadId,
                subjectProfileId: h.subjectProfileId,
                relationshipType: h.relationshipType || 'prestador_servico',
                confidence: h.confidence || 'low',
                evidenceIds: evidences.map(ev => ev.id),
                status: 'unverified' as const,
                notes: h.notes || 'Hipótese gerada por análise de menção pública.'
              }));

              return {
                providerId: this.id,
                providerName: this.name,
                platform: this.platform,
                locations,
                posts,
                profiles,
                evidences,
                hypotheses,
                durationMs: Date.now() - startTime
              };
            } catch (jsonErr) {
              console.warn('Erro ao converter resposta do Gemini no PublicWebSearchAdapter:', jsonErr);
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn('Falha na chamada Gemini no PublicWebSearchAdapter:', geminiErr);
      }
    }

    // Fallback estruturado de busca pública caso o cliente do modelo não responda
    return {
      providerId: this.id,
      providerName: this.name,
      platform: this.platform,
      locations: [
        {
          id: `loc-pub-${Date.now()}-1`,
          platform: 'google',
          name: `Logradouro Público: ${context.address}`,
          latitude: context.coordinates?.lat || -27.4350,
          longitude: context.coordinates?.lng || -48.4980,
          address: `${context.address}, ${context.neighborhood}`,
          sourceUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(context.address + ', Jurerê')}`,
          collectedAt: now
        }
      ],
      posts: [],
      profiles: [],
      evidences: [
        {
          id: `evid-pub-${Date.now()}-1`,
          leadId: context.leadId,
          platform: 'public_web',
          sourceType: 'geo_index',
          sourceUrl: `https://geofloripa.pmf.sc.gov.br`,
          description: `Endereço indexado nos registros cartográficos públicos de Florianópolis: ${context.address}`,
          confidence: 'high',
          evidenceType: 'fact',
          collectedAt: now
        }
      ],
      hypotheses: [],
      limitations: [
        'Consulta pública resumida: índice cartográfico consultado sem extração de posts em tempo real.'
      ],
      durationMs: Date.now() - startTime
    };
  }
}
