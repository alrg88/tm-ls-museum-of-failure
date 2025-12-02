import { NextResponse } from 'next/server';
import { createESPNClient } from '@/lib/espn';

export async function GET() {
  try {
    const client = createESPNClient(2024);
    const data = await client.getFullSeasonData();

    return NextResponse.json({
      memberCount: data.members.length,
      teamCount: data.teams.length,
      matchupCount: data.matchups.length,
      sampleMembers: data.members.slice(0, 2),
      sampleTeams: data.teams.slice(0, 2),
      sampleMatchups: data.matchups.slice(0, 3),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
