import { NextResponse } from 'next/server';
import { createESPNClient } from '@/lib/espn';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2024');

    const client = createESPNClient(year);
    const data = await client.getFullSeasonData();

    // Get all matchups and find high scores per week
    const weeklyHighScores = new Map<number, Array<{ memberId: string; teamId: number; score: number }>>();

    // Create team to member mapping
    const teamToMember = new Map<number, string>();
    data.teams.forEach((team: any) => {
      if (team.primaryOwner) {
        teamToMember.set(team.id, team.primaryOwner);
      }
    });

    // Track all scores by week
    data.matchups.forEach((matchup: any) => {
      const week = matchup.matchupPeriodId;
      const homeScore = matchup.home?.totalPoints || 0;
      const awayScore = matchup.away?.totalPoints || 0;
      const homeMemberId = teamToMember.get(matchup.home?.teamId);
      const awayMemberId = teamToMember.get(matchup.away?.teamId);

      if (!weeklyHighScores.has(week)) {
        weeklyHighScores.set(week, []);
      }

      if (homeScore > 0 && homeMemberId) {
        weeklyHighScores.get(week)!.push({
          memberId: homeMemberId,
          teamId: matchup.home.teamId,
          score: homeScore
        });
      }
      if (awayScore > 0 && awayMemberId) {
        weeklyHighScores.get(week)!.push({
          memberId: awayMemberId,
          teamId: matchup.away.teamId,
          score: awayScore
        });
      }
    });

    // Get member names
    const memberNames = new Map<string, string>();
    data.members.forEach((m: any) => {
      memberNames.set(m.id, m.displayName || `${m.firstName} ${m.lastName}`);
    });

    // Find the highest score for each week
    const weeklyWinners: any[] = [];
    weeklyHighScores.forEach((scores, week) => {
      scores.sort((a, b) => b.score - a.score);
      const winner = scores[0];
      weeklyWinners.push({
        week,
        memberId: winner.memberId,
        memberName: memberNames.get(winner.memberId),
        score: winner.score,
        allScores: scores.map(s => ({
          memberName: memberNames.get(s.memberId),
          score: s.score
        }))
      });
    });

    // Count high scores per member
    const highScoreCounts = new Map<string, number>();
    weeklyWinners.forEach(w => {
      highScoreCounts.set(w.memberId, (highScoreCounts.get(w.memberId) || 0) + 1);
    });

    const highScoreStats = Array.from(highScoreCounts.entries()).map(([memberId, count]) => ({
      memberId,
      memberName: memberNames.get(memberId),
      highScoreCount: count
    })).sort((a, b) => b.highScoreCount - a.highScoreCount);

    return NextResponse.json({
      year,
      totalWeeks: weeklyHighScores.size,
      weeklyWinners: weeklyWinners.sort((a, b) => a.week - b.week),
      highScoreStats
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
