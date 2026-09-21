import { 
  ISocialProvider, 
  SocialQueryContext, 
  ProviderResult 
} from './types';

/**
 * Adapter para a ferramenta Open Source Instaloader (Python).
 * 
 * Instaloader (https://github.com/instaloader/instaloader) é uma biblioteca
 * open-source consolidada para download e extração de metadados públicos do Instagram
 * (geotags, perfis públicos e postagens públicas).
 * 
 * Este adapter isola a dependência:
 * 1. Verifica se há um microserviço ponte configurado via INSTALOADER_SERVICE_URL.
 * 2. Se inativo ou não configurado, reporta a limitação de forma transparente sem quebrar o sistema.
 * 3. Segue rigorosamente as diretrizes de privacidade: apenas metadados públicos e geotags.
 */
export class InstaloaderAdapter implements ISocialProvider {
  readonly id = 'instaloader-oss';
  readonly name = 'Instaloader (Open Source Python)';
  readonly platform = 'instagram';
  readonly isOpenSource = true;

  private serviceUrl: string | undefined;

  constructor(serviceUrl?: string) {
    this.serviceUrl = serviceUrl || (typeof process !== 'undefined' ? process.env?.INSTALOADER_SERVICE_URL : undefined);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.serviceUrl) {
      return false;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.serviceUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  async investigate(context: SocialQueryContext): Promise<ProviderResult> {
    const startTime = Date.now();

    // Se o serviço remoto Instaloader estiver configurado, despacha a requisição
    if (this.serviceUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${this.serviceUrl}/api/collect-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `${context.propertyTitle} ${context.address} ${context.neighborhood}`,
            city: context.city,
            coordinates: context.coordinates
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          const remoteData = await response.json();
          return {
            providerId: this.id,
            providerName: this.name,
            platform: this.platform,
            locations: remoteData.locations || [],
            posts: remoteData.posts || [],
            profiles: remoteData.profiles || [],
            evidences: remoteData.evidences || [],
            hypotheses: remoteData.hypotheses || [],
            durationMs: Date.now() - startTime
          };
        }
      } catch (err: any) {
        return {
          providerId: this.id,
          providerName: this.name,
          platform: this.platform,
          locations: [],
          posts: [],
          profiles: [],
          evidences: [],
          hypotheses: [],
          error: `Instaloader service error: ${err.message || String(err)}`,
          limitations: [
            'Falha de comunicação com o serviço Instaloader externo.',
            'O serviço pode estar sofrendo rate-limit ou exigindo renovação de sessão do Instagram.'
          ],
          durationMs: Date.now() - startTime
        };
      }
    }

    // Se não há serviço configurado, documenta a limitação real sem simular dados falsos
    return {
      providerId: this.id,
      providerName: this.name,
      platform: this.platform,
      locations: [],
      posts: [],
      profiles: [],
      evidences: [],
      hypotheses: [],
      limitations: [
        'Instaloader local não ativo (requer ambiente Python com o pacote "instaloader" ou microserviço HTTP).',
        'Para ativar coleta direta via Instaloader, defina INSTALOADER_SERVICE_URL no .env.',
        'Instagram exige sessões públicas ou autenticação rotativa para evitar bloqueios de IP de datacenter.'
      ],
      durationMs: Date.now() - startTime
    };
  }
}
