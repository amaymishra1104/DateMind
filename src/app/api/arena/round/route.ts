import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage';
import {
  simulateRound1,
  simulateRound2,
  simulateRound3,
  evaluateAgent,
  synthesizeMutualCompatibility,
} from '@/lib/ai/arena';
import { DatingMessage, AgentEvaluation } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { roundNumber, personAId, personBId, existingMessages, evalA, evalB } = await req.json();

    const personA = DataStore.getProfileById(personAId);
    const personB = DataStore.getProfileById(personBId);

    if (!personA || !personB) {
      return NextResponse.json(
        { success: false, error: 'Profiles not found.' },
        { status: 404 }
      );
    }

    const messages: DatingMessage[] = existingMessages || [];

    switch (roundNumber) {
      case 1: {
        const round1 = await simulateRound1(personA, personB);
        return NextResponse.json({ success: true, messages: round1 });
      }
      case 2: {
        const round2 = await simulateRound2(personA, personB, messages);
        return NextResponse.json({ success: true, messages: round2 });
      }
      case 3: {
        const round3 = await simulateRound3(personA, personB, messages);
        return NextResponse.json({ success: true, messages: round3 });
      }
      case 4: {
        const [aEval, bEval] = await Promise.all([
          evaluateAgent(personA, personB, messages),
          evaluateAgent(personB, personA, messages),
        ]);
        return NextResponse.json({
          success: true,
          evaluations: { agentA: aEval, agentB: bEval },
        });
      }
      case 5: {
        const finalEvalA: AgentEvaluation = evalA;
        const finalEvalB: AgentEvaluation = evalB;
        const mutual = await synthesizeMutualCompatibility(
          personA,
          personB,
          finalEvalA,
          finalEvalB,
          messages
        );
        DataStore.saveDate(mutual);
        return NextResponse.json({ success: true, mutual });
      }
      default:
        return NextResponse.json({ success: false, error: 'Invalid round number' }, { status: 400 });
    }
  } catch (error) {
    console.error('Arena round error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
