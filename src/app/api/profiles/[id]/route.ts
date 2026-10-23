import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = DataStore.getProfileById(id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = DataStore.deleteProfile(id);

    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
