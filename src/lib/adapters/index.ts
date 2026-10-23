import { LinkedInAdapter, LinkedInIngestionResult } from './linkedin';
import { InstagramAdapter, InstagramIngestionResult } from './instagram';

export * from './linkedin';
export * from './instagram';

export interface DualSourceIngestionRequest {
  linkedinUrl: string;
  instagramUrl: string;
  linkedinFallbackText?: string;
  instagramFallbackText?: string;
}

export interface DualSourceIngestionResult {
  success: boolean;
  linkedin: LinkedInIngestionResult;
  instagram: InstagramIngestionResult;
  errors: string[];
}

export class SourceIngestionManager {
  static async ingestBoth(params: DualSourceIngestionRequest): Promise<DualSourceIngestionResult> {
    const [linkedinRes, instagramRes] = await Promise.all([
      LinkedInAdapter.ingest(params.linkedinUrl, params.linkedinFallbackText),
      InstagramAdapter.ingest(params.instagramUrl, params.instagramFallbackText),
    ]);

    const errors: string[] = [];
    if (!linkedinRes.success) {
      errors.push(`LinkedIn: ${linkedinRes.error || 'Failed to ingest'}`);
    }
    if (!instagramRes.success) {
      errors.push(`Instagram: ${instagramRes.error || 'Failed to ingest'}`);
    }

    return {
      success: linkedinRes.success && instagramRes.success,
      linkedin: linkedinRes,
      instagram: instagramRes,
      errors,
    };
  }
}
