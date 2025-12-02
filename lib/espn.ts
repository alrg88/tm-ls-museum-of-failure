interface ESPNConfig {
  leagueId: string;
  seasonId: number;
  espnS2: string;
  swid: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface Matchup {
  matchupPeriodId: number;
  home: {
    teamId: number;
    totalPoints: number;
  };
  away: {
    teamId: number;
    totalPoints: number;
  };
  winner: 'home' | 'away' | 'tie';
}

export interface TeamInfo {
  id: number;
  owners: string[];
  primaryOwner: string;
  finalStandingsRank?: number;
}

export class ESPNClient {
  private config: ESPNConfig;

  constructor(config: ESPNConfig) {
    this.config = config;
  }

  private async fetchESPN(endpoint: string) {
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${this.config.seasonId}/segments/0/leagues/${this.config.leagueId}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Cookie': `espn_s2=${this.config.espnS2}; SWID=${this.config.swid}`,
      },
    });

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getLeagueInfo() {
    return this.fetchESPN('?view=mSettings');
  }

  async getMembers(): Promise<Member[]> {
    const data = await this.fetchESPN('?view=mSettings');
    if (!data.members || !Array.isArray(data.members)) return [];
    return data.members.map((member: any) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      displayName: member.displayName || `${member.firstName} ${member.lastName}`,
    }));
  }

  async getTeams(): Promise<TeamInfo[]> {
    const data = await this.fetchESPN('?view=mTeam');
    if (!data.teams) return [];
    return data.teams.map((team: any) => ({
      id: team.id,
      owners: team.owners || [],
      primaryOwner: team.primaryOwner || (team.owners && team.owners[0]) || '',
    }));
  }

  async getMatchups(): Promise<Matchup[]> {
    const data = await this.fetchESPN('?view=mMatchup&view=mMatchupScore');
    if (!data.schedule || !Array.isArray(data.schedule)) return [];

    return data.schedule
      .filter((match: any) => match.home && match.away) // Only include valid matchups
      .map((match: any) => ({
        matchupPeriodId: match.matchupPeriodId,
        home: {
          teamId: match.home.teamId,
          totalPoints: match.home.totalPoints || 0,
        },
        away: {
          teamId: match.away.teamId,
          totalPoints: match.away.totalPoints || 0,
        },
        winner: match.winner === 'HOME' ? 'home' : match.winner === 'AWAY' ? 'away' : 'tie',
      }));
  }

  async getFullSeasonData() {
    // Fetch all data in one call for better reliability, including standings
    const data = await this.fetchESPN('?view=mSettings&view=mTeam&view=mMatchup&view=mMatchupScore&view=mStandings');

    const members = (data.members || []).map((member: any) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      displayName: member.displayName || `${member.firstName} ${member.lastName}`,
    }));

    const teams = (data.teams || []).map((team: any) => ({
      id: team.id,
      owners: team.owners || [],
      primaryOwner: team.primaryOwner || (team.owners && team.owners[0]) || '',
      finalStandingsRank: team.rankCalculatedFinal,
    }));

    const matchups = (data.schedule || [])
      .filter((match: any) => match.home && match.away)
      .map((match: any) => ({
        matchupPeriodId: match.matchupPeriodId,
        home: {
          teamId: match.home.teamId,
          totalPoints: match.home.totalPoints || 0,
        },
        away: {
          teamId: match.away.teamId,
          totalPoints: match.away.totalPoints || 0,
        },
        winner: match.winner === 'HOME' ? 'home' : match.winner === 'AWAY' ? 'away' : 'tie',
      }));

    return {
      members,
      teams,
      matchups,
      seasonId: this.config.seasonId,
    };
  }
}

export function createESPNClient(seasonId: number): ESPNClient {
  return new ESPNClient({
    leagueId: process.env.LEAGUE_ID!,
    seasonId,
    espnS2: process.env.ESPN_S2!,
    swid: process.env.SWID!,
  });
}
