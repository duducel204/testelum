import { 
  SocialLocation, 
  PublicSocialPost, 
  PublicSocialProfile, 
  SocialEvidence, 
  RelationshipHypothesis, 
  SocialPlatform, 
  SocialIntelligenceData 
} from '../../types';

export interface SocialQueryContext {
  leadId: string;
  propertyTitle: string;
  address: string;
  neighborhood: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  architecturalStyle?: string;
  knownTags?: string[];
  decisionMakerHint?: string;
}

export interface ProviderResult {
  providerId: string;
  providerName: string;
  platform: SocialPlatform;
  locations: SocialLocation[];
  posts: PublicSocialPost[];
  profiles: PublicSocialProfile[];
  evidences: SocialEvidence[];
  hypotheses: RelationshipHypothesis[];
  limitations?: string[];
  isMock?: boolean;
  durationMs?: number;
  error?: string;
}

export interface ISocialProvider {
  readonly id: string;
  readonly name: string;
  readonly platform: SocialPlatform;
  readonly isOpenSource: boolean;
  isAvailable(): Promise<boolean>;
  investigate(context: SocialQueryContext): Promise<ProviderResult>;
}

export interface ProviderStatusReport {
  id: string;
  name: string;
  platform: SocialPlatform;
  isOpenSource: boolean;
  available: boolean;
  statusMessage: string;
}
