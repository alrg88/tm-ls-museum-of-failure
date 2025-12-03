'use client';

import { useEffect, useState } from 'react';

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

interface StatsData {
  memberStats: MemberStats[];
  headToHead: HeadToHead[];
  weeklyHighScores: WeeklyHighScore[];
  seasonFinishes?: SeasonFinish[];
}

export default function Home() {
  const [data, setData] = useState<StatsData | null>(null);
  const [allTimeData, setAllTimeData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAllTime, setLoadingAllTime] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [showAllTime, setShowAllTime] = useState(false);
  const [showAllTimeHighScores, setShowAllTimeHighScores] = useState(false);
  const [showAllTimeStandings, setShowAllTimeStandings] = useState(false);
  const [activeTab, setActiveTab] = useState<'standings' | 'headtohead' | 'highscores' | 'finishes'>('standings');
  const [sortColumn, setSortColumn] = useState<'rank' | 'name' | 'wins' | 'losses' | 'ties' | 'winPct' | 'points' | 'highScores'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchStats();
  }, [selectedYear]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/espn/stats?startYear=${selectedYear}&endYear=${selectedYear}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const statsData = await response.json();
      setData(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTimeStats = async () => {
    setLoadingAllTime(true);
    try {
      const response = await fetch(`/api/espn/stats?startYear=2012&endYear=${new Date().getFullYear()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch all-time stats');
      }
      const statsData = await response.json();
      setAllTimeData(statsData);
    } catch (err) {
      console.error('Error fetching all-time stats:', err);
    } finally {
      setLoadingAllTime(false);
    }
  };

  const handleAllTimeToggle = () => {
    if (!showAllTime && !allTimeData) {
      fetchAllTimeStats();
    }
    setShowAllTime(!showAllTime);
  };

  const handleAllTimeHighScoresToggle = () => {
    if (!showAllTimeHighScores && !allTimeData) {
      fetchAllTimeStats();
    }
    setShowAllTimeHighScores(!showAllTimeHighScores);
  };

  const handleAllTimeStandingsToggle = () => {
    if (!showAllTimeStandings && !allTimeData) {
      fetchAllTimeStats();
    }
    setShowAllTimeStandings(!showAllTimeStandings);
  };

  const handleSort = (column: 'rank' | 'name' | 'wins' | 'losses' | 'ties' | 'winPct' | 'points' | 'highScores') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending for most columns, ascending for rank/name
      setSortColumn(column);
      setSortDirection(column === 'rank' || column === 'name' ? 'asc' : 'desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading your fantasy football stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 text-red-200 px-8 py-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Determine which data to use for head-to-head
  const h2hData = showAllTime && allTimeData ? allTimeData : data;

  // Determine which data to use for high scores
  const highScoresData = showAllTimeHighScores && allTimeData ? allTimeData : data;

  // Determine which data to use for standings
  const standingsData = showAllTimeStandings && allTimeData ? allTimeData : data;

  // Sort members based on selected column and direction
  const sortedMembers = [...standingsData.memberStats].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortColumn) {
      case 'rank':
        // Use final standings rank if available, otherwise use calculated rank
        aVal = a.finalStandingsRank ?? 999;
        bVal = b.finalStandingsRank ?? 999;
        break;
      case 'name':
        aVal = a.memberName.toLowerCase();
        bVal = b.memberName.toLowerCase();
        break;
      case 'wins':
        aVal = a.wins;
        bVal = b.wins;
        break;
      case 'losses':
        aVal = a.losses;
        bVal = b.losses;
        break;
      case 'ties':
        aVal = a.ties;
        bVal = b.ties;
        break;
      case 'winPct':
        aVal = a.wins / (a.wins + a.losses + a.ties) || 0;
        bVal = b.wins / (b.wins + b.losses + b.ties) || 0;
        break;
      case 'points':
        aVal = a.totalPoints;
        bVal = b.totalPoints;
        break;
      case 'highScores':
        aVal = a.highScores;
        bVal = b.highScores;
        break;
    }

    // Compare values
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Create member name lookup
  const memberNames = new Map<string, string>();
  data.memberStats.forEach(m => memberNames.set(m.memberId, m.memberName));

  // Top 10 high scores
  const topHighScores = highScoresData.weeklyHighScores.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            TML's Museum of Failure
          </h1>
          <p className="text-gray-300 mt-2">League ID: 526838</p>

          {/* Year Selector */}
          <div className="mt-4 flex gap-4 items-center">
            <label className="text-sm text-gray-300">Season:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-800 border border-purple-500/30 rounded px-3 py-2 text-white"
            >
              {Array.from({ length: new Date().getFullYear() - 2012 + 1 }, (_, i) => 2012 + i).reverse().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'standings'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🏆 Member Standings
          </button>
          <button
            onClick={() => setActiveTab('headtohead')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'headtohead'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            ⚔️ Head-to-Head
          </button>
          <button
            onClick={() => setActiveTab('highscores')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'highscores'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🔥 Top 10 High Scores
          </button>
          <button
            onClick={() => setActiveTab('finishes')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'finishes'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🏅 Championship Finishes
          </button>
        </div>

        {/* Member Standings */}
        {activeTab === 'standings' && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-4xl">🏆</span> Member Standings
            </h2>
            <button
              onClick={handleAllTimeStandingsToggle}
              disabled={loadingAllTime}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                showAllTimeStandings
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              } ${loadingAllTime ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loadingAllTime ? 'Loading...' : showAllTimeStandings ? 'All-Time' : `${selectedYear} Only`}
            </button>
          </div>
          {showAllTimeStandings && (
            <div className="mb-4 text-sm text-purple-400">
              Showing standings from 2012 to {new Date().getFullYear()}
            </div>
          )}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-purple-500/20 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('rank')}
                    >
                      <div className="flex items-center gap-2">
                        Rank
                        {sortColumn === 'rank' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Member
                        {sortColumn === 'name' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('wins')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Wins
                        {sortColumn === 'wins' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('losses')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Losses
                        {sortColumn === 'losses' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('ties')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Ties
                        {sortColumn === 'ties' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('winPct')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Win %
                        {sortColumn === 'winPct' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('points')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Total Points
                        {sortColumn === 'points' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold cursor-pointer hover:bg-purple-800/50 transition-colors"
                      onClick={() => handleSort('highScores')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        High Scores
                        {sortColumn === 'highScores' && (
                          <span className="text-purple-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => {
                    const winPct = ((member.wins / (member.wins + member.losses + member.ties)) * 100).toFixed(1);
                    return (
                      <tr
                        key={member.memberId}
                        className="border-t border-purple-500/10 hover:bg-purple-900/20 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold">
                          {sortColumn === 'rank' ? (
                            <>
                              {index === 0 && <span className="text-2xl">🥇</span>}
                              {index === 1 && <span className="text-2xl">🥈</span>}
                              {index === 2 && <span className="text-2xl">🥉</span>}
                              {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                            </>
                          ) : (
                            <span className="text-gray-400">#{member.finalStandingsRank || index + 1}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-purple-300">{member.memberName}</td>
                        <td className="px-6 py-4 text-center text-green-400 font-bold">{member.wins}</td>
                        <td className="px-6 py-4 text-center text-red-400 font-bold">{member.losses}</td>
                        <td className="px-6 py-4 text-center text-yellow-400">{member.ties}</td>
                        <td className="px-6 py-4 text-center font-bold">{winPct}%</td>
                        <td className="px-6 py-4 text-center text-blue-400">{Number(member.totalPoints || 0).toFixed(1)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-bold">
                            {member.highScores}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        )}

        {/* Head to Head Records */}
        {activeTab === 'headtohead' && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-4xl">⚔️</span> Head-to-Head Records
            </h2>
            <button
              onClick={handleAllTimeToggle}
              disabled={loadingAllTime}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                showAllTime
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              } ${loadingAllTime ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loadingAllTime ? 'Loading...' : showAllTime ? 'All-Time' : `${selectedYear} Only`}
            </button>
          </div>

          {/* Player Search */}
          <div className="mb-4">
            <label className="text-sm text-gray-300 mr-2">Select Player:</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="bg-slate-800 border border-purple-500/30 rounded px-4 py-2 text-white"
            >
              <option value="">-- Choose a player --</option>
              {sortedMembers.map((member) => (
                <option key={member.memberId} value={member.memberId}>
                  {member.memberName}
                </option>
              ))}
            </select>
            {showAllTime && (
              <span className="ml-4 text-sm text-purple-400">Showing records from 2012 to {new Date().getFullYear()}</span>
            )}
          </div>

          {selectedPlayer ? (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-purple-500/20 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Opponent</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {h2hData.headToHead
                      .filter(h2h => h2h.member1 === selectedPlayer || h2h.member2 === selectedPlayer)
                      .map((h2h, index) => {
                        const isPlayer1 = h2h.member1 === selectedPlayer;
                        const opponentId = isPlayer1 ? h2h.member2 : h2h.member1;
                        const opponentName = memberNames.get(opponentId) || 'Unknown';
                        const playerWins = isPlayer1 ? h2h.member1Wins : h2h.member2Wins;
                        const opponentWins = isPlayer1 ? h2h.member2Wins : h2h.member1Wins;

                        return (
                          <tr
                            key={index}
                            className="border-t border-purple-500/10 hover:bg-purple-900/20 transition-colors"
                          >
                            <td className="px-6 py-4 text-purple-300 font-semibold">{opponentName}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-gradient-to-r from-green-500/20 to-red-500/20 px-4 py-2 rounded-lg font-bold">
                                <span className="text-green-400">{playerWins}</span>
                                <span className="text-gray-400 mx-2">-</span>
                                <span className="text-red-400">{opponentWins}</span>
                                {h2h.ties > 0 && (
                                  <>
                                    <span className="text-gray-400 mx-2">-</span>
                                    <span className="text-yellow-400">{h2h.ties}</span>
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-purple-500/20 text-center text-gray-400">
              Select a player to view their head-to-head records
            </div>
          )}
        </section>
        )}

        {/* Top 10 High Scores */}
        {activeTab === 'highscores' && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-4xl">🔥</span> Top 10 High Scores
            </h2>
            <button
              onClick={handleAllTimeHighScoresToggle}
              disabled={loadingAllTime}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                showAllTimeHighScores
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              } ${loadingAllTime ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loadingAllTime ? 'Loading...' : showAllTimeHighScores ? 'All-Time' : `${selectedYear} Only`}
            </button>
          </div>
          {showAllTimeHighScores && (
            <div className="mb-4 text-sm text-purple-400">
              Showing high scores from 2012 to {new Date().getFullYear()}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topHighScores.map((score, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 hover:scale-105 transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">
                      {index === 0 && <span className="text-2xl mr-2">🔥</span>}
                      Week {score.week} • {score.season}
                    </div>
                    <div className="text-xl font-bold text-orange-300 mt-1">{score.memberName}</div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                    {Number(score.score || 0).toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Championship Finishes */}
        {activeTab === 'finishes' && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <span className="text-4xl">🏅</span> Championship Finishes (All-Time)
          </h2>
          {!allTimeData ? (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-purple-500/20 text-center">
              <button
                onClick={fetchAllTimeStats}
                disabled={loadingAllTime}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loadingAllTime ? 'Loading...' : 'Load All-Time Finishes'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-purple-400">
                Showing finishes from 2012 to {new Date().getFullYear()}
              </div>
              <div className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-purple-500/20 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Member</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">🥇 1st Place</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">🥈 2nd Place</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">🥉 3rd Place</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">💩 Last Place</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Calculate finish counts for each member
                        const finishCounts = new Map<string, { name: string; first: number; second: number; third: number; last: number; totalSeasons: number; maxRank: number }>();

                        // Safety check for seasonFinishes
                        if (!allTimeData.seasonFinishes || !Array.isArray(allTimeData.seasonFinishes)) {
                          return (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                                No season finish data available
                              </td>
                            </tr>
                          );
                        }

                        // First, determine the max rank (league size) per season
                        const seasonMaxRanks = new Map<number, number>();
                        allTimeData.seasonFinishes.forEach(finish => {
                          const currentMax = seasonMaxRanks.get(finish.season) || 0;
                          if (finish.rank > currentMax) {
                            seasonMaxRanks.set(finish.season, finish.rank);
                          }
                        });

                        allTimeData.seasonFinishes.forEach(finish => {
                          if (!finishCounts.has(finish.memberId)) {
                            finishCounts.set(finish.memberId, {
                              name: finish.memberName,
                              first: 0,
                              second: 0,
                              third: 0,
                              last: 0,
                              totalSeasons: 0,
                              maxRank: 0,
                            });
                          }
                          const counts = finishCounts.get(finish.memberId)!;
                          counts.totalSeasons++;

                          const seasonMaxRank = seasonMaxRanks.get(finish.season) || finish.rank;
                          if (finish.rank === 1) counts.first++;
                          else if (finish.rank === 2) counts.second++;
                          else if (finish.rank === 3) counts.third++;
                          if (finish.rank === seasonMaxRank) counts.last++;
                        });

                        // Sort by total championships (1st place finishes), then by 2nd place, then 3rd
                        const sortedFinishes = Array.from(finishCounts.entries()).sort((a, b) => {
                          if (b[1].first !== a[1].first) return b[1].first - a[1].first;
                          if (b[1].second !== a[1].second) return b[1].second - a[1].second;
                          return b[1].third - a[1].third;
                        });

                        return sortedFinishes.map(([memberId, counts]) => (
                          <tr
                            key={memberId}
                            className="border-t border-purple-500/10 hover:bg-purple-900/20 transition-colors"
                          >
                            <td className="px-6 py-4 font-semibold text-purple-300">{counts.name}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg font-bold text-xl">
                                {counts.first}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-gray-400/20 text-gray-300 px-4 py-2 rounded-lg font-bold text-xl">
                                {counts.second}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-orange-600/20 text-orange-300 px-4 py-2 rounded-lg font-bold text-xl">
                                {counts.third}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="bg-red-600/20 text-red-300 px-4 py-2 rounded-lg font-bold text-xl">
                                {counts.last}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
        )}
      </main>
    </div>
  );
}
