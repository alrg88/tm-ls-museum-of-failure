import { NextResponse } from 'next/server';
import { createESPNClient } from '@/lib/espn';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');

    if (!season) {
      return NextResponse.json({ error: 'Season parameter is required' }, { status: 400 });
    }

    const client = createESPNClient(parseInt(season));
    const data = await client.getFullSeasonData();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ESPN data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ESPN data' },
      { status: 500 }
    );
  }
}
