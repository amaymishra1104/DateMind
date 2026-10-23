import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();

    let profiles = DataStore.getProfiles();

    if (query) {
      profiles = profiles.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.handle.toLowerCase().includes(query) ||
          p.analysis.profession.toLowerCase().includes(query) ||
          p.analysis.interests.some(i => i.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({
      success: true,
      count: profiles.length,
      data: profiles,
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
    if (!body.name || !body.linkedinUrl || !body.instagramUrl) {
      return NextResponse.json(
        { success: false, error: 'Name, LinkedIn URL, and Instagram URL are required.' },
        { status: 400 }
      );
    }

    const saved = DataStore.addProfile(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
