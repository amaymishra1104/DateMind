import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'csv') {
      const csvData = DataStore.exportProfilesToCsv();
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="datemind_profiles_roster.csv"',
        },
      });
    }

    const profiles = DataStore.getProfiles();
    return new NextResponse(JSON.stringify(profiles, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="datemind_profiles_roster.json"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
