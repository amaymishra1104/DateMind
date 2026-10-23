import { IngestedLinkedInData } from '@/types';

export interface LinkedInIngestionResult {
  success: boolean;
  url: string;
  isPlatformValid: boolean;
  status: 'scraped' | 'public_meta' | 'manual_fallback' | 'failed';
  data?: IngestedLinkedInData;
  error?: string;
  sourceDisclaimer: string;
}

export class LinkedInAdapter {
  /**
   * Validates LinkedIn profile URL format
   */
  static validateUrl(url: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'LinkedIn URL is required' };
    }

    const trimmed = url.trim();
    // Support formats: linkedin.com/in/username, https://www.linkedin.com/in/username/
    const pattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/i;
    const match = trimmed.match(pattern);

    if (!match) {
      return {
        isValid: false,
        error: 'Invalid LinkedIn URL format. Expected: https://linkedin.com/in/username',
      };
    }

    const username = match[3];
    const normalizedUrl = `https://www.linkedin.com/in/${username}`;
    return { isValid: true, normalizedUrl };
  }

  /**
   * Attempts public meta/OG ingestion from LinkedIn URL, falling back gracefully
   * to authorized manual text or structured metadata without bypassing terms or bot protections.
   */
  static async ingest(
    url: string,
    fallbackText?: string
  ): Promise<LinkedInIngestionResult> {
    const validation = this.validateUrl(url);
    if (!validation.isValid || !validation.normalizedUrl) {
      return {
        success: false,
        url,
        isPlatformValid: false,
        status: 'failed',
        error: validation.error || 'Invalid LinkedIn URL',
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
          'Source: User/Evaluator authorized public profile text (Manual Fallback). Clearly labeled per platform policies.',
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
        if (extracted && (extracted.headline || extracted.summary)) {
          return {
            success: true,
            url: targetUrl,
            isPlatformValid: true,
            status: 'public_meta',
            data: extracted,
            sourceDisclaimer:
              'Source: Publicly reachable HTML metadata & OpenGraph tags from LinkedIn.',
          };
        }
      }
    } catch {
      // Network timeout or blocked by platform anti-bot wall
    }

    // In accordance with guidelines: do not invent data or claim to have scraped if restricted.
    return {
      success: false,
      url: targetUrl,
      isPlatformValid: true,
      status: 'failed',
      error:
        'LinkedIn anti-bot / authentication wall encountered. Please provide verified public profile text or headline in the assist fallback.',
      sourceDisclaimer:
        'Platform terms and anti-bot protection respected. Direct scrape restricted without authentication cookies.',
    };
  }

  private static extractFromHtml(html: string): IngestedLinkedInData {
    const data: IngestedLinkedInData = {};

    // OpenGraph Title & Description
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);

    if (titleMatch?.[1]) {
      data.headline = titleMatch[1].replace(/\| LinkedIn$/i, '').trim();
    }
    if (descMatch?.[1]) {
      data.summary = descMatch[1].trim();
    }

    return data;
  }

  private static parseExtractedText(text: string): IngestedLinkedInData {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const data: IngestedLinkedInData = {
      headline: lines[0] || '',
      summary: lines.slice(1, 4).join(' '),
      experience: [],
      skills: [],
      publicInterests: [],
    };

    // Extract potential sections
    let currentSection = '';
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('experience') || lower.includes('work')) {
        currentSection = 'exp';
      } else if (lower.includes('skill') || lower.includes('technologies')) {
        currentSection = 'skills';
      } else if (lower.includes('education')) {
        currentSection = 'edu';
      } else if (lower.includes('interest')) {
        currentSection = 'interests';
      } else if (line.startsWith('-') || line.startsWith('•') || line.length > 5) {
        const item = line.replace(/^[-•*]\s*/, '').trim();
        if (currentSection === 'exp') data.experience?.push(item);
        else if (currentSection === 'skills') data.skills?.push(item);
        else if (currentSection === 'interests') data.publicInterests?.push(item);
      }
    }

    return data;
  }
}
