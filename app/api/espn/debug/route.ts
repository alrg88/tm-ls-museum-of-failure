import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '2024';

    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${process.env.LEAGUE_ID}?view=mSettings&view=mTeam&view=mMatchup&view=mMatchupScore`;

    const response = await fetch(url, {
      headers: {
        'Cookie': `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.SWID}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        error: `ESPN API error: ${response.status} ${response.statusText}`,
        season
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      season,
      status: 'success',
      data: {
        members: data.members,
        teams: data.teams?.map((t: any) => ({
          id: t.id,
          abbrev: t.abbrev,
          name: t.name || t.nickname,
          owners: t.owners,
          primaryOwner: t.primaryOwner,
        })),
        scheduleLength: data.schedule?.length,
        sampleSchedule: data.schedule?.slice(0, 2),
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ESPN data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
