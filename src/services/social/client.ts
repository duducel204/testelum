import { SocialIntelligenceData } from '../../types';
import { ProviderResult, ProviderStatusReport, SocialQueryContext } from './types';

export interface SocialInvestigateResponse {
  success: boolean;
  data: SocialIntelligenceData;
  reports: ProviderResult[];
  error?: string;
}

export async function fetchSocialProviders(): Promise<ProviderStatusReport[]> {
  try {
    const res = await fetch('/api/social/providers');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.providers || [];
  } catch (err) {
    console.warn('Erro ao obter provedores de Social Intelligence:', err);
    return [];
  }
}

export async function investigateSocialIntelligence(
  context: Partial<SocialQueryContext> & { leadId: string; propertyTitle: string; address: string },
  preferredProviders?: string[]
): Promise<SocialInvestigateResponse> {
  const res = await fetch('/api/social/investigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leadId: context.leadId,
      propertyTitle: context.propertyTitle,
      address: context.address,
      neighborhood: context.neighborhood || 'Jurerê Internacional',
      city: context.city || 'Florianópolis',
      coordinates: context.coordinates,
      architecturalStyle: context.architecturalStyle,
      preferredProviders
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro na investigação social (${res.status}): ${errorText}`);
  }

  return await res.json();
}
