import { Person, MutualEvaluation, CompatibilityRanking } from '@/types';
import { INITIAL_ROSTER } from '@/data/roster';
import fs from 'fs';
import path from 'path';

const IS_VERCEL = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const DATA_DIR = process.env.VERCEL === '1'
  ? path.join('/tmp', 'datemind-data')
  : path.join(process.cwd(), 'data');
const BUNDLED_DATA_DIR = path.join(process.cwd(), 'data');

const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const DATES_FILE = path.join(DATA_DIR, 'dates.json');
const BUNDLED_PROFILES_FILE = path.join(BUNDLED_DATA_DIR, 'profiles.json');
const BUNDLED_DATES_FILE = path.join(BUNDLED_DATA_DIR, 'dates.json');

// In-memory cache for instant serverless responsiveness
let memoryProfiles: Person[] | null = null;
let memoryDates: MutualEvaluation[] | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Read-only filesystem warning, in-memory cache will take over
  }
}

export class DataStore {
  static getProfiles(): Person[] {
    if (memoryProfiles && memoryProfiles.length > 0) {
      return memoryProfiles;
    }

    try {
      ensureDataDir();
      // 1. Try reading from writable DATA_DIR
      if (fs.existsSync(PROFILES_FILE)) {
        const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          memoryProfiles = list;
          return list;
        }
      }

      // 2. Try reading from bundled DATA_DIR (Vercel deployment bundle)
      if (fs.existsSync(BUNDLED_PROFILES_FILE)) {
        const raw = fs.readFileSync(BUNDLED_PROFILES_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          memoryProfiles = list;
          // Seed writable directory if possible
          try {
            ensureDataDir();
            fs.writeFileSync(PROFILES_FILE, raw, 'utf-8');
          } catch {}
          return list;
        }
      }
    } catch (e) {
      console.warn('Error reading profiles from file, using initial roster:', e);
    }

    // 3. Fallback to code-defined INITIAL_ROSTER
    memoryProfiles = [...INITIAL_ROSTER];
    try {
      ensureDataDir();
      fs.writeFileSync(PROFILES_FILE, JSON.stringify(INITIAL_ROSTER, null, 2), 'utf-8');
    } catch {}
    return memoryProfiles;
  }

  static saveProfiles(profiles: Person[]): void {
    memoryProfiles = profiles;
    try {
      ensureDataDir();
      fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist profiles to filesystem (relying on memory cache):', e);
    }
  }

  static getProfileById(id: string): Person | undefined {
    const list = this.getProfiles();
    return list.find(p => p.id === id);
  }

  static addProfile(newPerson: Person): Person {
    const list = [...this.getProfiles()];
    const existingIndex = list.findIndex(p => p.id === newPerson.id);
    if (existingIndex >= 0) {
      list[existingIndex] = newPerson;
    } else {
      list.unshift(newPerson);
    }
    this.saveProfiles(list);
    return newPerson;
  }

  static deleteProfile(id: string): boolean {
    const list = this.getProfiles();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length !== list.length) {
      this.saveProfiles(filtered);
      return true;
    }
    return false;
  }

  static getDates(): MutualEvaluation[] {
    if (memoryDates && memoryDates.length > 0) {
      return memoryDates;
    }

    try {
      ensureDataDir();
      // 1. Try reading from writable DATA_DIR
      if (fs.existsSync(DATES_FILE)) {
        const raw = fs.readFileSync(DATES_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          memoryDates = list;
          return list;
        }
      }

      // 2. Try reading from bundled DATA_DIR
      if (fs.existsSync(BUNDLED_DATES_FILE)) {
        const raw = fs.readFileSync(BUNDLED_DATES_FILE, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          memoryDates = list;
          try {
            ensureDataDir();
            fs.writeFileSync(DATES_FILE, raw, 'utf-8');
          } catch {}
          return list;
        }
      }
    } catch (e) {
      console.warn('Error reading dates from file:', e);
    }
    memoryDates = [];
    return [];
  }

  static saveDate(evalData: MutualEvaluation): void {
    try {
      const dates = [...this.getDates()];
      dates.unshift(evalData);
      const trimmed = dates.slice(0, 50);
      memoryDates = trimmed;
      ensureDataDir();
      fs.writeFileSync(DATES_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist date to filesystem (relying on memory cache):', e);
    }
  }

  /**
   * Generates ranked compatibility for a selected person against all others
   */
  static getRankingsForPerson(targetId: string): CompatibilityRanking[] {
    const profiles = this.getProfiles();
    const target = profiles.find(p => p.id === targetId);
    if (!target) return [];

    const others = profiles.filter(p => p.id !== targetId);
    const completedDates = this.getDates();

    const rankings: CompatibilityRanking[] = others.map(candidate => {
      // Check if actual simulated date exists between target and candidate
      const existingDate = completedDates.find(
        d =>
          (d.personA?.id === targetId && d.personB?.id === candidate.id) ||
          (d.personA?.id === candidate.id && d.personB?.id === targetId)
      );

      // 1. Shared interests overlap
      const targetInterests = target.analysis.interests.map(i => i.toLowerCase());
      const candInterests = candidate.analysis.interests.map(i => i.toLowerCase());

      const shared = candidate.analysis.interests.filter(ci =>
        targetInterests.some(ti => ti.includes(ci.toLowerCase()) || ci.toLowerCase().includes(ti))
      );

      // 2. Lifestyle similarity
      const targetLifestyles = target.analysis.lifestyleSignals.map(l => l.toLowerCase());
      const candLifestyles = candidate.analysis.lifestyleSignals.map(l => l.toLowerCase());
      const sharedLifestyle = candidate.analysis.lifestyleSignals.filter(cl =>
        targetLifestyles.some(tl => tl.includes(cl.toLowerCase()) || cl.toLowerCase().includes(tl))
      );

      // 3. Score calculation
      let score: number;
      const highlights: string[] = [];

      if (existingDate) {
        // Use actual empirical date simulation score
        score = existingDate.mutualScore;
        highlights.push(`Actual Simulated Date: ${existingDate.dateVerdict} (${existingDate.mutualScore}% mutual)`);
        if (existingDate.sharedStrengths?.length) {
          highlights.push(`Empirical Strength: ${existingDate.sharedStrengths[0]}`);
        }
      } else {
        // Preliminary score from profile evidence
        const baseScore = 62;
        const interestBonus = Math.min(22, shared.length * 6);
        const lifestyleBonus = Math.min(12, sharedLifestyle.length * 4);
        score = Math.min(97, Math.max(50, baseScore + interestBonus + lifestyleBonus));
        highlights.push(
          `Preliminary evidence match between ${target.analysis.profession.split('|')[0].trim()} and ${candidate.analysis.profession.split('|')[0].trim()}`
        );
        highlights.push(
          `Evidence-backed overlap in ${shared[0] || candidate.analysis.interests[0] || 'innovation'}`
        );
      }

      const commA = target.analysis.communicationStyle[0] || 'Thoughtful';
      const commB = candidate.analysis.communicationStyle[0] || 'Warm';

      return {
        targetPerson: candidate,
        score,
        sharedInterestsCount: shared.length,
        sharedInterests: shared.length > 0 ? shared : [candidate.analysis.interests[0] || 'Innovation'],
        communicationMatch: `${commA} + ${commB} dynamic`,
        lifestyleMatch: sharedLifestyle.length > 0 ? sharedLifestyle.join(', ') : 'Complementary routines',
        highlights,
        hasCompletedDate: !!existingDate,
        dateVerdict: existingDate?.dateVerdict,
        dateId: existingDate?.dateId,
      };
    });

    // Sort descending by score
    return rankings.sort((a, b) => b.score - a.score);
  }

  /**
   * Export all profiles to CSV
   */
  static exportProfilesToCsv(): string {
    const profiles = this.getProfiles();
    const headers = [
      'id',
      'name',
      'handle',
      'linkedinUrl',
      'instagramUrl',
      'identityVerified',
      'sourceStatus',
      'analysisStatus',
      'profession',
      'interests',
      'hobbies',
      'lifestyleSignals',
      'overallSummary',
    ];

    const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    const rows = profiles.map(p => [
      escapeCsv(p.id),
      escapeCsv(p.name),
      escapeCsv(p.handle),
      escapeCsv(p.linkedinUrl),
      escapeCsv(p.instagramUrl),
      p.identityVerified ? 'true' : 'false',
      escapeCsv(p.sourceStatus),
      escapeCsv(p.analysisStatus),
      escapeCsv(p.analysis?.profession || ''),
      escapeCsv((p.analysis?.interests || []).join('; ')),
      escapeCsv((p.analysis?.hobbies || []).join('; ')),
      escapeCsv((p.analysis?.lifestyleSignals || []).join('; ')),
      escapeCsv(p.analysis?.overallSummary || ''),
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Import profiles from JSON or CSV
   */
  static importProfiles(imported: Person[]): number {
    const current = this.getProfiles();
    let addedCount = 0;

    for (const item of imported) {
      if (!item.id || !item.name) continue;
      const idx = current.findIndex(c => c.id === item.id);
      if (idx >= 0) {
        current[idx] = item;
      } else {
        current.push(item);
        addedCount++;
      }
    }

    this.saveProfiles(current);
    return addedCount;
  }
}
