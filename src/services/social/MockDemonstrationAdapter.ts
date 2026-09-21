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
 * Adapter de Demonstração / Fallback Estruturado.
 * 
 * ATENÇÃO: Todos os dados gerados por este adapter são estritamente identificados como:
 * "DADOS DE DEMONSTRAÇÃO".
 * 
 * Utilizado para testes locais, offline, desenvolvimento e quando os coletores
 * externos enfrentam indisponibilidade temporária.
 */
export class MockDemonstrationAdapter implements ISocialProvider {
  readonly id = 'mock-demo-provider';
  readonly name = 'Demonstração Controlada (Offline / Fallback)';
  readonly platform = 'public_web';
  readonly isOpenSource = true;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async investigate(context: SocialQueryContext): Promise<ProviderResult> {
    const startTime = Date.now();
    const now = new Date().toISOString();

    const mockLocations: SocialLocation[] = [
      {
        id: `mock-loc-1`,
        platform: 'instagram',
        name: `[DADOS DE DEMONSTRAÇÃO] Jurerê Open Shopping - Plataforma Central`,
        latitude: -27.4398,
        longitude: -48.4985,
        address: 'Av. das Raias, 400 - Jurerê Internacional, Florianópolis - SC',
        sourceUrl: 'https://www.instagram.com/explore/locations/237248174/jurere-open-shopping/',
        collectedAt: now
      },
      {
        id: `mock-loc-2`,
        platform: 'instagram',
        name: `[DADOS DE DEMONSTRAÇÃO] Donna Jurerê (Orla Internacional)`,
        latitude: -27.4332,
        longitude: -48.4921,
        address: 'Av. dos Pampos, s/n - Jurerê Internacional, Florianópolis - SC',
        sourceUrl: 'https://www.instagram.com/explore/locations/255018671/donna-jurere/',
        collectedAt: now
      },
      {
        id: `mock-loc-3`,
        platform: 'google',
        name: `[DADOS DE DEMONSTRAÇÃO] Eixo Residencial: ${context.address}`,
        latitude: context.coordinates?.lat || -27.4365,
        longitude: context.coordinates?.lng || -48.4950,
        address: `${context.address}, Jurerê Internacional`,
        sourceUrl: 'https://maps.google.com/?q=Jurere+Internacional',
        collectedAt: now
      }
    ];

    const mockPosts: PublicSocialPost[] = [
      {
        id: `mock-post-1`,
        platform: 'instagram',
        url: 'https://www.instagram.com/p/DEMO_POST_01/',
        publishedAt: '2024-11-15T21:30:00Z',
        location: mockLocations[0],
        captionSnippet: '[DADOS DE DEMONSTRAÇÃO] Sunset e iluminação cênica de verão em Jurerê. Projeto arquitetônico sofisticado.',
        authorPublicHandle: '@studio_arquitetura_demo',
        sourceProvider: this.id,
        collectedAt: now
      },
      {
        id: `mock-post-2`,
        platform: 'instagram',
        url: 'https://www.instagram.com/p/DEMO_POST_02/',
        publishedAt: '2024-12-02T19:45:00Z',
        location: mockLocations[1],
        captionSnippet: '[DADOS DE DEMONSTRAÇÃO] Noite agradável à beira-mar de Jurerê.',
        authorPublicHandle: '@turista_visitante_demo',
        sourceProvider: this.id,
        collectedAt: now
      }
    ];

    const mockProfiles: PublicSocialProfile[] = [
      {
        id: `mock-prof-1`,
        platform: 'instagram',
        publicHandle: '@studio_arquitetura_demo',
        displayName: '[DADOS DE DEMONSTRAÇÃO] Studio Arquitetura Contemporânea',
        profileType: 'arquiteto_designer',
        profileUrl: 'https://www.instagram.com/studio_arquitetura_demo',
        collectedAt: now
      },
      {
        id: `mock-prof-2`,
        platform: 'instagram',
        publicHandle: '@imoveis_luxo_jurere_demo',
        displayName: '[DADOS DE DEMONSTRAÇÃO] Curadoria Imobiliária Jurerê',
        profileType: 'corretor_imobiliaria',
        profileUrl: 'https://www.instagram.com/imoveis_luxo_jurere_demo',
        collectedAt: now
      },
      {
        id: `mock-prof-3`,
        platform: 'instagram',
        publicHandle: '@turista_visitante_demo',
        displayName: '[DADOS DE DEMONSTRAÇÃO] Visitante de Verão',
        profileType: 'visitante_turista',
        profileUrl: 'https://www.instagram.com/turista_visitante_demo',
        collectedAt: now
      }
    ];

    const mockEvidences: SocialEvidence[] = [
      {
        id: `mock-evid-1`,
        leadId: context.leadId,
        platform: 'instagram',
        sourceType: 'public_post_geotag',
        sourceUrl: mockPosts[0].url,
        observedAt: mockPosts[0].publishedAt,
        collectedAt: now,
        description: '[DADOS DE DEMONSTRAÇÃO] Publicação pública na tag do local com menção a projeto arquitetônico na micro-região.',
        confidence: 'medium',
        evidenceType: 'fact' // FATO: A publicação pública existe
      },
      {
        id: `mock-evid-2`,
        leadId: context.leadId,
        platform: 'instagram',
        sourceType: 'public_post_geotag',
        sourceUrl: mockPosts[1].url,
        observedAt: mockPosts[1].publishedAt,
        collectedAt: now,
        description: '[DADOS DE DEMONSTRAÇÃO] Foto pública em beach club a 650m do imóvel.',
        confidence: 'low',
        evidenceType: 'fact' // FATO: A publicação pública no beach club existe
      }
    ];

    const mockHypotheses: RelationshipHypothesis[] = [
      {
        id: `mock-hyp-1`,
        leadId: context.leadId,
        subjectProfileId: mockProfiles[0].publicHandle,
        relationshipType: 'arquiteto_ou_designer',
        confidence: 'medium',
        evidenceIds: [mockEvidences[0].id],
        status: 'unverified',
        notes: '[DADOS DE DEMONSTRAÇÃO] HIPÓTESE: O perfil publicou sobre arquitetura na região, mas a autoria do projeto deste imóvel específico não foi confirmada por ART/CREA ou RGI.'
      },
      {
        id: `mock-hyp-2`,
        leadId: context.leadId,
        subjectProfileId: mockProfiles[2].publicHandle,
        relationshipType: 'visitante_ou_turista',
        confidence: 'low',
        evidenceIds: [mockEvidences[1].id],
        status: 'rejected',
        notes: '[DADOS DE DEMONSTRAÇÃO] HIPÓTESE DESCARTADA: Postagem no beach club vizinho corresponde a turista/frequentador eventual, sem qualquer vínculo com o imóvel ou decisão patrimonial.'
      }
    ];

    return {
      providerId: this.id,
      providerName: this.name,
      platform: this.platform,
      locations: mockLocations,
      posts: mockPosts,
      profiles: mockProfiles,
      evidences: mockEvidences,
      hypotheses: mockHypotheses,
      isMock: true,
      limitations: [
        'Conjunto gerado exclusivamente como DADOS DE DEMONSTRAÇÃO para validação de esteira.',
        'Nenhum perfil real foi monitorado ou indexado nesta simulação.'
      ],
      durationMs: Date.now() - startTime
    };
  }
}
