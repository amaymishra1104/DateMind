import { NextRequest, NextResponse } from 'next/server';
import { PairMatrixEngine } from '@/lib/pairMatrix';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'all' | 'completed' | 'pending'
    const limit = parseInt(searchParams.get('limit') || '300', 10);

    const allPairs = PairMatrixEngine.getAllPairs();
    const completedCount = allPairs.filter(p => p.hasCompletedDate).length;
    const pendingCount = allPairs.length - completedCount;

    let filtered = allPairs;
    if (filter === 'completed') {
      filtered = allPairs.filter(p => p.hasCompletedDate);
    } else if (filter === 'pending') {
      filtered = allPairs.filter(p => !p.hasCompletedDate);
    }

    return NextResponse.json({
      success: true,
      totalPairs: allPairs.length,
      completedCount,
      pendingCount,
      pairs: filtered.slice(0, limit),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personAId, personBId, autoNext } = body;

    let targetAId = personAId;
    let targetBId = personBId;

    // Resumable processing: pick next pending pair if autoNext is true
    if (autoNext || (!targetAId && !targetBId)) {
      const allPairs = PairMatrixEngine.getAllPairs();
      const nextPending = allPairs.find(p => !p.hasCompletedDate);

      if (!nextPending) {
        return NextResponse.json({
          success: true,
          message: 'All 300 pairs have already completed simulated dating!',
          allCompleted: true,
        });
      }

      targetAId = nextPending.personA.id;
      targetBId = nextPending.personB.id;
    }

    if (!targetAId || !targetBId) {
      return NextResponse.json(
        { success: false, error: 'personAId and personBId are required.' },
        { status: 400 }
      );
    }

    const completed = await PairMatrixEngine.simulatePair(targetAId, targetBId);

    const allPairs = PairMatrixEngine.getAllPairs();
    const completedCount = allPairs.filter(p => p.hasCompletedDate).length;

    return NextResponse.json({
      success: true,
      data: completed,
      progress: {
        completedCount,
        totalPairs: allPairs.length,
        percent: Math.round((completedCount / allPairs.length) * 100),
      },
    });
  } catch (error) {
    console.error('Pair simulation error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
