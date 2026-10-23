import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage';
import {
  simulateRound1,
  simulateRound2,
  simulateRound3,
  evaluateAgent,
  synthesizeMutualCompatibility,
} from '@/lib/ai/arena';

export async function POST(req: NextRequest) {
  try {
    const { personAId, personBId } = await req.json();

    if (!personAId || !personBId) {
      return NextResponse.json(
        { success: false, error: 'Both personAId and personBId are required.' },
        { status: 400 }
      );
    }

    if (personAId === personBId) {
      return NextResponse.json(
        { success: false, error: 'Cannot simulate a date between the same person.' },
        { status: 400 }
      );
    }

    const personA = DataStore.getProfileById(personAId);
    const personB = DataStore.getProfileById(personBId);

    if (!personA || !personB) {
      return NextResponse.json(
        { success: false, error: 'One or both profiles could not be found.' },
        { status: 404 }
      );
    }

    // ROUND 1: Introduction
    const round1Msgs = await simulateRound1(personA, personB);

    // ROUND 2: Getting to know each other
    const round2Msgs = await simulateRound2(personA, personB, round1Msgs);

    // ROUND 3: Discovering common ground & lifestyle
    const round3Msgs = await simulateRound3(personA, personB, [
      ...round1Msgs,
      ...round2Msgs,
    ]);

    const fullTranscript = [...round1Msgs, ...round2Msgs, ...round3Msgs];

    // ROUND 4: Individual Evaluations
    const [evalA, evalB] = await Promise.all([
      evaluateAgent(personA, personB, fullTranscript),
      evaluateAgent(personB, personA, fullTranscript),
    ]);

    // ROUND 5: Mutual Compatibility Synthesis
    const mutual = await synthesizeMutualCompatibility(
      personA,
      personB,
      evalA,
      evalB,
      fullTranscript
    );

    // Save date record
    DataStore.saveDate(mutual);

    return NextResponse.json({
      success: true,
      data: mutual,
      rounds: {
        round1: round1Msgs,
        round2: round2Msgs,
        round3: round3Msgs,
        round4: { agentA: evalA, agentB: evalB },
        round5: mutual,
      },
    });
  } catch (error) {
    console.error('Dating simulation error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
