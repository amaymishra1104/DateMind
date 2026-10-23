import { Person, MutualEvaluation, CompatibilityRanking } from '@/types';
import { DataStore } from './storage';
import {
  simulateRound1,
  simulateRound2,
  simulateRound3,
  evaluateAgent,
  synthesizeMutualCompatibility,
} from './ai/arena';

export interface PairMatch {
  pairId: string; // e.g. "person_001__person_002"
  personA: Person;
  personB: Person;
  preliminaryScore: number;
  sharedInterests: string[];
  communicationMatch: string;
  hasCompletedDate: boolean;
  completedDate?: MutualEvaluation;
  actualMutualScore?: number;
  dateVerdict?: string;
}

export class PairMatrixEngine {
  /**
   * Generates a canonical pair key (idA < idB)
   */
  static getPairKey(idA: string, idB: string): string {
    return idA < idB ? `${idA}__${idB}` : `${idB}__${idA}`;
  }

  /**
   * Computes preliminary compatibility between two people based purely on profile evidence
   */
  static computePreliminaryScore(personA: Person, personB: Person): {
    score: number;
    sharedInterests: string[];
    communicationMatch: string;
  } {
    const interestsA = personA.analysis.interests.map(i => i.toLowerCase());
    const interestsB = personB.analysis.interests.map(i => i.toLowerCase());

    const shared = personB.analysis.interests.filter(b =>
      interestsA.some(a => a.includes(b.toLowerCase()) || b.toLowerCase().includes(a))
    );

    const lifestylesA = personA.analysis.lifestyleSignals.map(l => l.toLowerCase());
    const lifestylesB = personB.analysis.lifestyleSignals.map(l => l.toLowerCase());
    const sharedLifestyle = personB.analysis.lifestyleSignals.filter(b =>
      lifestylesA.some(a => a.includes(b.toLowerCase()) || b.toLowerCase().includes(a))
    );

    const baseScore = 60;
    const interestBonus = Math.min(22, shared.length * 6);
    const lifestyleBonus = Math.min(12, sharedLifestyle.length * 4);
    const score = Math.min(97, Math.max(50, baseScore + interestBonus + lifestyleBonus));

    const commA = personA.analysis.communicationStyle[0] || 'Thoughtful';
    const commB = personB.analysis.communicationStyle[0] || 'Curious';

    return {
      score,
      sharedInterests: shared.length > 0 ? shared : [personA.analysis.interests[0] || 'Innovation'],
      communicationMatch: `${commA} + ${commB}`,
    };
  }

  /**
   * Returns all 300 unique pairs for the current roster
   * (N * (N-1) / 2 = 300 pairs for 25 people)
   */
  static getAllPairs(): PairMatch[] {
    const profiles = DataStore.getProfiles();
    const completedDates = DataStore.getDates();

    // Map completed dates by canonical pair key
    const dateMap = new Map<string, MutualEvaluation>();
    for (const d of completedDates) {
      if (d.personA?.id && d.personB?.id) {
        const key = this.getPairKey(d.personA.id, d.personB.id);
        dateMap.set(key, d);
      }
    }

    const pairs: PairMatch[] = [];

    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const personA = profiles[i];
        const personB = profiles[j];
        const pairId = this.getPairKey(personA.id, personB.id);

        const prelim = this.computePreliminaryScore(personA, personB);
        const completedDate = dateMap.get(pairId);

        pairs.push({
          pairId,
          personA,
          personB,
          preliminaryScore: prelim.score,
          sharedInterests: prelim.sharedInterests,
          communicationMatch: prelim.communicationMatch,
          hasCompletedDate: !!completedDate,
          completedDate,
          actualMutualScore: completedDate ? completedDate.mutualScore : undefined,
          dateVerdict: completedDate ? completedDate.dateVerdict : undefined,
        });
      }
    }

    // Sort descending by effective score (completed actual score if available, else preliminary)
    return pairs.sort((a, b) => {
      const scoreA = a.actualMutualScore ?? a.preliminaryScore;
      const scoreB = b.actualMutualScore ?? b.preliminaryScore;
      return scoreB - scoreA;
    });
  }

  /**
   * Runs an actual LLM dating simulation for a given pair and stores the real result
   */
  static async simulatePair(personAId: string, personBId: string): Promise<MutualEvaluation> {
    const personA = DataStore.getProfileById(personAId);
    const personB = DataStore.getProfileById(personBId);

    if (!personA || !personB) {
      throw new Error(`One or both profiles not found: ${personAId}, ${personBId}`);
    }

    // Round 1
    const r1 = await simulateRound1(personA, personB);
    // Round 2
    const r2 = await simulateRound2(personA, personB, r1);
    // Round 3
    const r3 = await simulateRound3(personA, personB, [...r1, ...r2]);

    const transcript = [...r1, ...r2, ...r3];

    // Round 4
    const [evalA, evalB] = await Promise.all([
      evaluateAgent(personA, personB, transcript),
      evaluateAgent(personB, personA, transcript),
    ]);

    // Round 5
    const mutual = await synthesizeMutualCompatibility(personA, personB, evalA, evalB, transcript);

    DataStore.saveDate(mutual);
    return mutual;
  }
}
