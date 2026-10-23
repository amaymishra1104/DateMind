import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get('personId');

    if (!personId) {
      return NextResponse.json(
        { success: false, error: 'personId query parameter is required.' },
        { status: 400 }
      );
    }

    const targetPerson = DataStore.getProfileById(personId);
    if (!targetPerson) {
      return NextResponse.json(
        { success: false, error: 'Person profile not found.' },
        { status: 404 }
      );
    }

    const rankings = DataStore.getRankingsForPerson(personId);

    return NextResponse.json({
      success: true,
      person: targetPerson,
      rankings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
