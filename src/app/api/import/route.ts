import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage';
import { Person } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Expected JSON array of Person records.' },
        { status: 400 }
      );
    }

    const addedCount = DataStore.importProfiles(body as Person[]);

    return NextResponse.json({
      success: true,
      importedCount: addedCount,
      totalCount: DataStore.getProfiles().length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
