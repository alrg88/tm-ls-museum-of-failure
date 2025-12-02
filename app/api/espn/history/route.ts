import { NextResponse } from 'next/server';
import { createESPNClient } from '@/lib/espn';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startYear = parseInt(searchParams.get('startYear') || '2015');
    const endYear = parseInt(searchParams.get('endYear') || new Date().getFullYear().toString());

    const seasons = [];
    const errors = [];

    // Fetch data for each season
    for (let year = startYear; year <= endYear; year++) {
      try {
        const client = createESPNClient(year);
        const data = await client.getFullSeasonData();
        seasons.push(data);
      } catch (error) {
        // If a season fails, track it but continue with others
        errors.push({ year, error: 'Season not available' });
      }
    }

    return NextResponse.json({ seasons, errors });
  } catch (error) {
    console.error('Error fetching historical ESPN data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical ESPN data' },
      { status: 500 }
    );
  }
}
