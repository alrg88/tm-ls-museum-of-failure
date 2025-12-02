import { NextResponse } from 'next/server';
import { createESPNClient } from '@/lib/espn';
import { readFileSync } from 'fs';
import { join } from 'path';

interface MemberStats {
  memberId: string;
  memberName: string;
  wins: number;
  losses: number;
  ties: number;
  totalPoints: number;
  highScores: number;
  finalStandingsRank?: number;
}

interface HeadToHead {
  member1: string;
  member2: string;
  member1Wins: number;
  member2Wins: number;
  ties: number;
}

interface WeeklyHighScore {
  week: number;
  memberId: string;
  memberName: string;
  score: number;
  season: number;
}

interface SeasonFinish {
  memberId: string;
  memberName: string;
  season: number;
  rank: number;
}

// Load custom member names
function loadMemberNames(): Map<string, string> {
  try {
    const filePath = join(process.cwd(), 'member-names.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const namesObj = JSON.parse(fileContent);
    return new Map(Object.entries(namesObj));
  } catch (error) {
    console.error('Could not load member-names.json:', error);
    return new Map();
  }
}

// Load historical data from local files
function loadHistoricalSeason(year: number): any | null {
  try {
    const filePath = join(process.cwd(), 'historical-data', `season-${year}.json`);
    const fileContent = readFileSync(filePath, 'utf-8');
    const rawData = JSON.parse(fileContent);

    // Transform ESPN API format to match what getFullSeasonData returns
    return {
      members: rawData.members || [],
      teams: (rawData.teams || []).map((team: any) => ({
        id: team.id,
        owners: team.owners || [],
        primaryOwner: team.primaryOwner || (team.owners && team.owners[0]) || '',
        finalStandingsRank: team.rankCalculatedFinal,
      })),
      matchups: (rawData.schedule || [])
        .filter((match: any) => match.home && match.away)
        .map((match: any) => ({
          matchupPeriodId: match.matchupPeriodId,
          home: {
            teamId: match.home.teamId,
            totalPoints: Number(match.home.totalPoints) || 0,
          },
          away: {
            teamId: match.away.teamId,
            totalPoints: Number(match.away.totalPoints) || 0,
          },
          winner: match.winner === 'HOME' ? 'home' : match.winner === 'AWAY' ? 'away' : 'tie',
        })),
      seasonId: rawData.seasonId,
    };
  } catch (error) {
    // File doesn't exist or can't be read - this is normal for years without historical data
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startYear = parseInt(searchParams.get('startYear') || '2012');
    const endYear = parseInt(searchParams.get('endYear') || new Date().getFullYear().toString());

    const allSeasons = [];
    const customMemberNames = loadMemberNames();

    // Fetch all seasons (from API or local historical files)
    for (let year = startYear; year <= endYear; year++) {
      try {
        // First try to load from historical data file
        const historicalData = loadHistoricalSeason(year);

        if (historicalData) {
          console.log(`Loading season ${year} from historical data file`);
          allSeasons.push({ ...historicalData, year });
        } else {
          // Fall back to API for recent years
          const client = createESPNClient(year);
          const data = await client.getFullSeasonData();
          allSeasons.push({ ...data, year });
        }
      } catch (error) {
        console.error(`Failed to fetch season ${year}:`, error);
      }
    }

    // Calculate stats
    const memberStatsMap = new Map<string, MemberStats>();
    const headToHeadMap = new Map<string, HeadToHead>();
    const weeklyHighScores: WeeklyHighScore[] = [];
    const seasonFinishes: SeasonFinish[] = [];

    // Process each season
    for (const season of allSeasons) {
      const { members, teams, matchups, year } = season;

      // Create team to member mapping (using primaryOwner)
      const teamToMember = new Map<number, string>();
      const memberMap = new Map<string, string>(); // memberId -> name
      const memberToFinalRank = new Map<string, number>(); // memberId -> final rank

      members.forEach((member: any) => {
        const customName = customMemberNames.get(member.id);
        const displayName = customName || member.displayName || `${member.firstName} ${member.lastName}`;
        memberMap.set(member.id, displayName);
      });

      teams.forEach((team: any) => {
        if (team.primaryOwner) {
          teamToMember.set(team.id, team.primaryOwner);
          if (team.finalStandingsRank) {
            memberToFinalRank.set(team.primaryOwner, team.finalStandingsRank);
          }
        } else if (team.owners && team.owners.length > 0) {
          teamToMember.set(team.id, team.owners[0]);
          if (team.finalStandingsRank) {
            memberToFinalRank.set(team.owners[0], team.finalStandingsRank);
          }
        }
      });

      // Track season finishes
      memberToFinalRank.forEach((rank, memberId) => {
        const memberName = memberMap.get(memberId) || 'Unknown';
        seasonFinishes.push({
          memberId,
          memberName,
          season: year,
          rank,
        });
      });

      // Track high scores by week
      const weeklyScores = new Map<number, { memberId: string; score: number }>();

      // Process matchups
      matchups.forEach((matchup: any) => {
        const homeTeamId = matchup.home?.teamId;
        const awayTeamId = matchup.away?.teamId;
        const homeScore = matchup.home?.totalPoints || 0;
        const awayScore = matchup.away?.totalPoints || 0;
        const week = matchup.matchupPeriodId;

        if (!homeTeamId || !awayTeamId) return;

        const homeMemberId = teamToMember.get(homeTeamId);
        const awayMemberId = teamToMember.get(awayTeamId);

        if (!homeMemberId || !awayMemberId) return;

        // Track weekly high scores
        // Check which score is higher in this matchup first
        const highestInMatchup = homeScore >= awayScore
          ? { memberId: homeMemberId, score: homeScore }
          : { memberId: awayMemberId, score: awayScore };

        const currentHigh = weeklyScores.get(week);
        if (!currentHigh || highestInMatchup.score > currentHigh.score) {
          weeklyScores.set(week, highestInMatchup);
        }

        // Initialize member stats
        if (!memberStatsMap.has(homeMemberId)) {
          memberStatsMap.set(homeMemberId, {
            memberId: homeMemberId,
            memberName: memberMap.get(homeMemberId) || 'Unknown',
            wins: 0,
            losses: 0,
            ties: 0,
            totalPoints: 0,
            highScores: 0,
            finalStandingsRank: memberToFinalRank.get(homeMemberId),
          });
        }
        if (!memberStatsMap.has(awayMemberId)) {
          memberStatsMap.set(awayMemberId, {
            memberId: awayMemberId,
            memberName: memberMap.get(awayMemberId) || 'Unknown',
            wins: 0,
            losses: 0,
            ties: 0,
            totalPoints: 0,
            highScores: 0,
            finalStandingsRank: memberToFinalRank.get(awayMemberId),
          });
        }

        const homeStats = memberStatsMap.get(homeMemberId)!;
        const awayStats = memberStatsMap.get(awayMemberId)!;

        // Update win/loss records
        if (homeScore > awayScore) {
          homeStats.wins++;
          awayStats.losses++;
        } else if (awayScore > homeScore) {
          awayStats.wins++;
          homeStats.losses++;
        } else if (homeScore > 0 && awayScore > 0) {
          homeStats.ties++;
          awayStats.ties++;
        }

        homeStats.totalPoints += Number(homeScore) || 0;
        awayStats.totalPoints += Number(awayScore) || 0;

        // Head to head stats
        const h2hKey = [homeMemberId, awayMemberId].sort().join('-');
        if (!headToHeadMap.has(h2hKey)) {
          headToHeadMap.set(h2hKey, {
            member1: homeMemberId < awayMemberId ? homeMemberId : awayMemberId,
            member2: homeMemberId < awayMemberId ? awayMemberId : homeMemberId,
            member1Wins: 0,
            member2Wins: 0,
            ties: 0,
          });
        }

        const h2h = headToHeadMap.get(h2hKey)!;
        if (homeScore > awayScore) {
          if (homeMemberId === h2h.member1) {
            h2h.member1Wins++;
          } else {
            h2h.member2Wins++;
          }
        } else if (awayScore > homeScore) {
          if (awayMemberId === h2h.member1) {
            h2h.member1Wins++;
          } else {
            h2h.member2Wins++;
          }
        } else if (homeScore > 0 && awayScore > 0) {
          h2h.ties++;
        }
      });

      // Track high score winners for this season
      weeklyScores.forEach((value, week) => {
        const stats = memberStatsMap.get(value.memberId);
        if (stats) {
          stats.highScores++;
          weeklyHighScores.push({
            week,
            memberId: value.memberId,
            memberName: stats.memberName,
            score: value.score,
            season: year,
          });
        }
      });
    }

    return NextResponse.json({
      memberStats: Array.from(memberStatsMap.values()),
      headToHead: Array.from(headToHeadMap.values()),
      weeklyHighScores: weeklyHighScores.sort((a, b) => b.score - a.score),
      seasonFinishes: seasonFinishes.sort((a, b) => a.season - b.season || a.rank - b.rank),
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate stats' },
      { status: 500 }
    );
  }
}
