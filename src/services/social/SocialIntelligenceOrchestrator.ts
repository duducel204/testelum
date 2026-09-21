import { 
  ISocialProvider, 
  SocialQueryContext, 
  ProviderResult, 
  ProviderStatusReport 
} from './types';
import { 
  SocialIntelligenceData, 
  SocialLocation, 
  PublicSocialPost, 
  PublicSocialProfile, 
  SocialEvidence, 
  RelationshipHypothesis 
} from '../../types';
import { InstaloaderAdapter } from './InstaloaderAdapter';
import { PublicWebSearchAdapter } from './PublicWebSearchAdapter';
import { MockDemonstrationAdapter } from './MockDemonstrationAdapter';

export interface OrchestratorOptions {
  preferredProviders?: string[];
  allowFallback?: boolean;
  timeoutMs?: number;
}

/**
 * Orquestrador central da camada de Social Intelligence.
 * 
 * Responsabilidades:
 * - Gerenciar ciclo de vida e registro de providers plugáveis.
 * - Executar consultas com timeout e tratamento de isolamento de falhas.
 * - Normalizar e desduplicar entidades (Locais, Posts, Perfis, Evidências, Hipóteses).
 * - Garantir a regra epistemológica: Evidência (Fato) ≠ Hipótese Relacional.
 * - Manter rastreabilidade e metadados no SocialIntelligenceData.
 */
export class SocialIntelligenceOrchestrator {
  private providers: Map<string, ISocialProvider> = new Map();

  constructor(geminiClientFetcher?: () => any) {
    // 1. Instaloader (Open Source Python para Instagram)
    this.registerProvider(new InstaloaderAdapter());

    // 2. Public Web & OSINT (Google Search Grounding / Web Aberta)
    this.registerProvider(new PublicWebSearchAdapter(geminiClientFetcher));

    // 3. Fallback de Demonstração (Sempre disponível)
    this.registerProvider(new MockDemonstrationAdapter());
  }

  registerProvider(provider: ISocialProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): ISocialProvider | undefined {
    return this.providers.get(id);
  }

  async getStatusReport(): Promise<ProviderStatusReport[]> {
    const reports: ProviderStatusReport[] = [];
    for (const provider of this.providers.values()) {
      let available = false;
      let statusMessage = 'Verificando';
      try {
        available = await provider.isAvailable();
        statusMessage = available ? 'Operacional' : 'Indisponível / Aguardando Configuração';
      } catch (e: any) {
        statusMessage = `Erro: ${e.message || String(e)}`;
      }

      reports.push({
        id: provider.id,
        name: provider.name,
        platform: provider.platform,
        isOpenSource: provider.isOpenSource,
        available,
        statusMessage
      });
    }
    return reports;
  }

  /**
   * Executa a esteira de Social Intelligence para um imóvel.
   * IMÓVEL -> LOCALIZAÇÃO -> FONTES PÚBLICAS -> CONTEÚDO PÚBLICO -> PERFIS -> EVIDÊNCIAS -> HIPÓTESES
   */
  async investigate(
    context: SocialQueryContext, 
    options: OrchestratorOptions = {}
  ): Promise<{ data: SocialIntelligenceData; reports: ProviderResult[] }> {
    const startedAt = new Date().toISOString();
    const timeoutMs = options.timeoutMs || 10000;
    const reports: ProviderResult[] = [];

    // Determina quais provedores consultar
    const activeProviders: ISocialProvider[] = [];
    if (options.preferredProviders && options.preferredProviders.length > 0) {
      for (const id of options.preferredProviders) {
        const p = this.providers.get(id);
        if (p) activeProviders.push(p);
      }
    } else {
      // Por padrão tenta os provedores primários: Instaloader e Public Web
      const instaloader = this.providers.get('instaloader-oss');
      const publicWeb = this.providers.get('public-web-osint');
      if (instaloader) activeProviders.push(instaloader);
      if (publicWeb) activeProviders.push(publicWeb);
    }

    // Executa em paralelo com timeout individual
    for (const provider of activeProviders) {
      try {
        const resultPromise = provider.investigate(context);
        const timeoutPromise = new Promise<ProviderResult>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout de ${timeoutMs}ms excedido no provedor ${provider.name}`)), timeoutMs)
        );
        const result = await Promise.race([resultPromise, timeoutPromise]);
        reports.push(result);
      } catch (err: any) {
        reports.push({
          providerId: provider.id,
          providerName: provider.name,
          platform: provider.platform,
          locations: [],
          posts: [],
          profiles: [],
          evidences: [],
          hypotheses: [],
          error: err.message || String(err),
          durationMs: timeoutMs
        });
      }
    }

    // Se nenhum provider ativo produziu locais ou evidências, aciona o MockDemonstrationAdapter
    const totalLocations = reports.reduce((acc, r) => acc + r.locations.length, 0);
    const totalEvidences = reports.reduce((acc, r) => acc + r.evidences.length, 0);

    let usedMockFallback = false;
    if (totalLocations === 0 && totalEvidences === 0 && (options.allowFallback !== false)) {
      const mockProvider = this.providers.get('mock-demo-provider');
      if (mockProvider) {
        const mockResult = await mockProvider.investigate(context);
        reports.push(mockResult);
        usedMockFallback = true;
      }
    }

    // Normalização e consolidação das coleções
    const consolidatedLocations: SocialLocation[] = [];
    const locationKeySet = new Set<string>();
    for (const r of reports) {
      for (const loc of r.locations) {
        const key = `${loc.platform}:${loc.name.toLowerCase().trim()}`;
        if (!locationKeySet.has(key)) {
          locationKeySet.add(key);
          consolidatedLocations.push(loc);
        }
      }
    }

    const consolidatedPosts: PublicSocialPost[] = [];
    const postUrlSet = new Set<string>();
    for (const r of reports) {
      for (const p of r.posts) {
        const key = p.url || p.captionSnippet || p.id;
        if (!postUrlSet.has(key)) {
          postUrlSet.add(key);
          consolidatedPosts.push(p);
        }
      }
    }

    const consolidatedProfiles: PublicSocialProfile[] = [];
    const profileKeySet = new Set<string>();
    for (const r of reports) {
      for (const prof of r.profiles) {
        const key = `${prof.platform}:${prof.publicHandle.toLowerCase().trim()}`;
        if (!profileKeySet.has(key)) {
          profileKeySet.add(key);
          consolidatedProfiles.push(prof);
        }
      }
    }

    const consolidatedEvidences: SocialEvidence[] = [];
    const evidenceKeySet = new Set<string>();
    for (const r of reports) {
      for (const ev of r.evidences) {
        const key = `${ev.sourceType}:${ev.sourceUrl}:${ev.description}`;
        if (!evidenceKeySet.has(key)) {
          evidenceKeySet.add(key);
          consolidatedEvidences.push(ev);
        }
      }
    }

    // HIPÓTESES: Consolidação estrita com status explícito
    const consolidatedHypotheses: RelationshipHypothesis[] = [];
    const hypothesisKeySet = new Set<string>();
    for (const r of reports) {
      for (const hyp of r.hypotheses) {
        const key = `${hyp.subjectProfileId}:${hyp.relationshipType}`;
        if (!hypothesisKeySet.has(key)) {
          hypothesisKeySet.add(key);
          // Assegura que o status não seja automaticamente promovido para aceito
          const status = hyp.status || 'unverified';
          consolidatedHypotheses.push({
            ...hyp,
            status
          });
        }
      }
    }

    const finishedAt = new Date().toISOString();
    const providerNames = reports.map(r => r.providerName).join('; ');

    const data: SocialIntelligenceData = {
      locations: consolidatedLocations,
      posts: consolidatedPosts,
      profiles: consolidatedProfiles,
      evidence: consolidatedEvidences,
      relationshipHypotheses: consolidatedHypotheses,
      metadata: {
        provider: providerNames,
        platform: reports[0]?.platform || 'public_web',
        investigationId: `inv-soc-${Date.now()}`,
        startedAt,
        finishedAt,
        status: 'completed',
        mock: usedMockFallback
      }
    };

    return { data, reports };
  }
}
