import { IngestedInstagramData } from '@/types';

export interface InstagramIngestionResult {
  success: boolean;
  url: string;
  isPlatformValid: boolean;
  status: 'scraped' | 'public_meta' | 'manual_fallback' | 'failed';
  data?: IngestedInstagramData;
  error?: string;
  sourceDisclaimer: string;
}

export class InstagramAdapter {
  /**
   * Validates Instagram profile URL format
   */
  static validateUrl(url: string): { isValid: boolean; normalizedUrl?: string; username?: string; error?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'Instagram URL is required' };
    }

    const trimmed = url.trim();
    // Support formats: instagram.com/username, https://www.instagram.com/username/
    const pattern = /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/i;
    const match = trimmed.match(pattern);

    if (!match) {
      return {
        isValid: false,
        error: 'Invalid Instagram URL format. Expected: https://instagram.com/username',
      };
    }

    const username = match[3];
    // Filter out generic paths
    if (['p', 'reel', 'stories', 'explore', 'direct'].includes(username.toLowerCase())) {
      return { isValid: false, error: 'URL must point to a profile, not a post or explore page' };
    }

    const normalizedUrl = `https://www.instagram.com/${username}`;
    return { isValid: true, normalizedUrl, username };
  }

  /**
   * Attempts public meta/OG ingestion from Instagram profile URL,
   * falling back gracefully to authorized manual text or caption themes without bypassing platform protections.
   */
  static async ingest(
    url: string,
    fallbackText?: string
  ): Promise<InstagramIngestionResult> {
    const validation = this.validateUrl(url);
    if (!validation.isValid || !validation.normalizedUrl) {
      return {
        success: false,
        url,
        isPlatformValid: false,
        status: 'failed',
        error: validation.error || 'Invalid Instagram URL',
        sourceDisclaimer: 'URL validation failed.',
      };
    }

    const targetUrl = validation.normalizedUrl;

    // If manual fallback text was provided by user/evaluator
    if (fallbackText && fallbackText.trim().length > 10) {
      const parsedData = this.parseExtractedText(fallbackText);
      return {
        success: true,
        url: targetUrl,
        isPlatformValid: true,
        status: 'manual_fallback',
        data: {
          ...parsedData,
          rawText: fallbackText.trim(),
        },
        sourceDisclaimer:
          'Source: User/Evaluator authorized public profile bio & captions (Manual Fallback). Clearly labeled per platform policies.',
      };
    }

    // Attempt direct public metadata fetch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DateMindBot/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();
        const extracted = this.extractFromHtml(html);
        if (extracted && (extracted.bio || (extracted.captionThemes && extracted.captionThemes.length > 0))) {
          return {
            success: true,
            url: targetUrl,
            isPlatformValid: true,
            status: 'public_meta',
            data: extracted,
            sourceDisclaimer: 'Source: Publicly reachable HTML metadata & OpenGraph tags from Instagram.',
          };
        }
      }
    } catch {
      // Network timeout or blocked by platform anti-bot wall
    }

    return {
      success: false,
      url: targetUrl,
      isPlatformValid: true,
      status: 'failed',
      error:
        'Instagram login wall or anti-bot challenge encountered. Please provide verified public bio / caption themes in the assist fallback.',
      sourceDisclaimer:
        'Platform terms and anti-bot protection respected. Direct scrape restricted without authentication cookies.',
    };
  }

  private static extractFromHtml(html: string): IngestedInstagramData {
    const data: IngestedInstagramData = {};

    const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    if (descMatch?.[1]) {
      // Often contains: "X Followers, Y Following, Z Posts - See Instagram photos and videos from Name (@handle) ..."
      data.bio = descMatch[1].trim();
    }

    return data;
  }

  private static parseExtractedText(text: string): IngestedInstagramData {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const data: IngestedInstagramData = {
      bio: lines[0] || '',
      captionThemes: [],
      observableActivities: [],
      publicInterests: [],
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('travel') || line.toLowerCase().includes('coffee') || line.toLowerCase().includes('fitness') || line.toLowerCase().includes('hike') || line.toLowerCase().includes('art')) {
        data.observableActivities?.push(line);
      } else if (line.startsWith('#')) {
        data.captionThemes?.push(line);
      } else {
        data.publicInterests?.push(line);
      }
    }

    return data;
  }
}
