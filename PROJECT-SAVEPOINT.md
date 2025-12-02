# Fantasy Football Stats - Project Savepoint
**Date:** December 1, 2025
**Project Name:** TML's Museum of Failure
**Location:** `/home/adam/Projects/ffootball`

---

## Project Overview

A Next.js 14 web application that displays comprehensive fantasy football statistics from ESPN Fantasy Football League (ID: 526838) covering seasons 2012-2025. The app combines live ESPN API data (2018-2025) with locally stored historical data (2012-2017).

**Live URL (Development):** http://localhost:3000

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** ESPN Fantasy Football API (private league access)
- **Runtime:** Node.js on WSL2 (Ubuntu)

---

## Project Structure

```
/home/adam/Projects/ffootball/
├── app/
│   ├── api/
│   │   └── espn/
│   │       └── stats/
│   │           └── route.ts          # Main stats API endpoint
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main dashboard UI
│   └── globals.css                   # Global styles
├── lib/
│   └── espn.ts                       # ESPN API client
├── historical-data/                  # Local season data (2012-2017)
│   ├── README.md                     # Technical documentation
│   ├── EXTRACTION-GUIDE.md           # User guide for adding data
│   ├── season-2012.json
│   ├── season-2013.json
│   ├── season-2014.json
│   ├── season-2015.json
│   ├── season-2016.json
│   └── season-2017.json
├── member-names.json                 # Custom display names for members
├── .env.local                        # ESPN API credentials (NOT in git)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── start-fantasy-stats.sh           # Launch script
├── start-fantasy-stats.bat          # Windows launcher
├── Fantasy-Football-Stats.vbs       # Silent Windows launcher
├── DESKTOP-SHORTCUT-INSTRUCTIONS.md # Desktop shortcut guide
└── PROJECT-SAVEPOINT.md             # This file
```

---

## Key Files & Their Purpose

### `/app/api/espn/stats/route.ts`
**Purpose:** Main API endpoint that calculates all statistics

**Key Functions:**
- `loadMemberNames()` - Loads custom member names from `member-names.json`
- `loadHistoricalSeason(year)` - Loads local historical data files for 2012-2017
- `GET()` - Main handler that:
  - Accepts `startYear` and `endYear` query parameters
  - Loads historical data (2012-2017) from local files
  - Fetches live data (2018-2025) from ESPN API
  - Calculates member stats, head-to-head records, weekly high scores, and season finishes

**Data Transformations:**
- Converts ESPN's `schedule` field → `matchups`
- Maps `rankCalculatedFinal` → `finalStandingsRank`
- Ensures all scores are properly typed as `Number()`
- Unwraps JSON structures from ESPN's leagueHistory API

**Returns:**
```typescript
{
  memberStats: MemberStats[],
  headToHead: HeadToHead[],
  weeklyHighScores: WeeklyHighScore[],
  seasonFinishes: SeasonFinish[]
}
```

### `/app/page.tsx`
**Purpose:** Main dashboard UI with tabbed interface

**Features:**
- 4 tabs: Member Standings, Head-to-Head, Top 10 High Scores, Championship Finishes
- All-time toggle buttons for standings, head-to-head, and high scores
- Sortable columns in Member Standings (click headers to sort)
- Year selector (2012-2025)
- Responsive design with purple/pink gradient theme

**State Management:**
```typescript
- data: Current year's stats
- allTimeData: All-time stats (2012-2025)
- selectedYear: Currently selected year
- showAllTime: Toggle for head-to-head all-time view
- showAllTimeHighScores: Toggle for high scores all-time view
- showAllTimeStandings: Toggle for standings all-time view
- sortColumn: Active sort column
- sortDirection: 'asc' | 'desc'
```

### `/lib/espn.ts`
**Purpose:** ESPN API client for fetching live data

**Configuration:**
- Uses `espn_s2` and `SWID` cookies from `.env.local`
- Base URL: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{year}/segments/0/leagues/526838`

**Methods:**
- `getMembers()` - Fetches league members
- `getTeams()` - Fetches team data with standings
- `getMatchups()` - Fetches all matchup results
- `getFullSeasonData()` - Combines all data in parallel

### `/member-names.json`
**Purpose:** Maps member IDs to custom display names

**Format:**
```json
{
  "{MEMBER-GUID}": "Display Name"
}
```

**Current Mappings:**
- 14 members with custom names
- Includes "Ryan McCoy" and "Alex Lange" (updated from old usernames)

### `/historical-data/season-YYYY.json`
**Purpose:** Local storage of historical ESPN data (2012-2017)

**Why Needed:** ESPN API doesn't provide data older than 2018

**Structure:**
```json
{
  "seasonId": 2017,
  "members": [...],
  "teams": [...],
  "schedule": [...]  // Note: "schedule" not "matchups"
}
```

**Important:** Files must follow naming convention `season-YYYY.json`

---

## Environment Variables

File: `.env.local` (not in version control)

```bash
ESPN_S2=your_espn_s2_cookie_value_here
SWID=your_swid_cookie_value_here
```

**How to get these values:**
1. Log into fantasy.espn.com
2. Open browser DevTools → Application → Cookies
3. Find `espn_s2` and `SWID` values
4. Copy to `.env.local`

---

## Features Implemented

### 1. Member Standings Tab
- Displays win/loss/tie records
- Shows total points and high score counts
- **Sortable columns** - Click any header to sort ascending/descending
  - Rank, Member, Wins, Losses, Ties, Win %, Total Points, High Scores
- Visual indicators (🥇🥈🥉) for top 3 when sorted by rank
- **All-time toggle** - Switch between single season and all-time (2012-2025)

### 2. Head-to-Head Tab
- Select a player to view their record vs all opponents
- Shows win-loss-tie records for each matchup
- **All-time toggle** - View all-time or single season records

### 3. Top 10 High Scores Tab
- Displays top 10 highest weekly scores
- Shows week, season, member name, and score
- **All-time toggle** - View all-time or single season high scores

### 4. Championship Finishes Tab (All-Time Only)
- Shows each member's total count of:
  - 🥇 1st place finishes
  - 🥈 2nd place finishes
  - 🥉 3rd place finishes
  - 💩 Last place finishes
- Automatically calculates last place based on league size per season
- Sorted by championships (1st place wins)

### 5. Data Hybrid System
- **2012-2017:** Loaded from local JSON files in `historical-data/`
- **2018-2025:** Fetched live from ESPN API
- Seamless integration - users don't see the difference

---

## Custom Configuration

### Title
Changed from "Fantasy Football League Stats" to:
```
TML's Museum of Failure
```

### Color Theme
- **Primary gradient:** Purple to Pink
- **Background:** Dark slate with purple gradients
- **Accent colors:**
  - Wins: Green
  - Losses: Red
  - Ties: Yellow
  - Points: Blue
  - High Scores: Yellow/Orange

---

## Known Data Issues & Fixes

### Issue 1: ESPN Historical Data JSON Format
**Problem:** ESPN's leagueHistory API returns data wrapped in `{"0": {...}}` or as `[{...}]`

**Solution:** Python script to unwrap:
```python
import json

# Unwrap from {"0": {...}}
for year in [2012, 2014, 2015, 2016, 2017]:
    with open(f'historical-data/season-{year}.json') as f:
        data = json.load(f)
    unwrapped = data['0']
    with open(f'historical-data/season-{year}.json', 'w') as f:
        json.dump(unwrapped, f, indent=2)

# Extract from array [{...}]
with open('historical-data/season-2013.json') as f:
    data = json.load(f)
unwrapped = data[0]
with open('historical-data/season-2013.json', 'w') as f:
    json.dump(unwrapped, f, indent=2)
```

### Issue 2: Data Structure Differences
**Problem:** ESPN API uses `matchups`, historical data uses `schedule`

**Solution:** Transformation in `loadHistoricalSeason()` (route.ts:62-75)

### Issue 3: Number Type Errors
**Problem:** `totalPoints.toFixed is not a function`

**Solution:** Added `Number()` conversions throughout:
- `route.ts:68,72` - Score conversion in data loading
- `route.ts:217,218` - Score accumulation
- `page.tsx:254,403` - Display formatting

---

## Running the Project

### Development Server
```bash
cd /home/adam/Projects/ffootball
npm run dev
```
Access at: http://localhost:3000

### Using the Launch Scripts

**From WSL/Linux:**
```bash
./start-fantasy-stats.sh
```

**From Windows:**
- Double-click `start-fantasy-stats.bat`
- Or use the VBS script for silent launch: `Fantasy-Football-Stats.vbs`

**Desktop Shortcut:**
See `DESKTOP-SHORTCUT-INSTRUCTIONS.md` for creating Windows shortcuts

---

## Adding New Historical Data

### Step 1: Extract from ESPN
1. Go to ESPN Fantasy Football website
2. Navigate to league history for desired year
3. Open DevTools → Network tab
4. Find API call to `leagueHistory`
5. Copy response JSON

### Step 2: Save the File
```bash
# Save as season-YYYY.json in historical-data/
cd /home/adam/Projects/ffootball/historical-data/
nano season-YYYY.json  # Paste JSON here
```

### Step 3: Fix JSON Structure (if needed)
Run the unwrap script if data is wrapped in `{"0": {...}}` or `[{...}]`

### Step 4: Verify
Refresh the site and select the year from dropdown

---

## Critical Code Locations

### Sorting Logic
**File:** `app/page.tsx:164-208`
- Handles all column sorting for Member Standings
- Switch statement for different column types
- Direction toggle logic

### Historical Data Loading
**File:** `app/api/espn/stats/route.ts:47-82`
- Checks for local files first
- Falls back to ESPN API
- Transforms data structure

### Season Finishes Calculation
**File:** `app/api/espn/stats/route.ts:155-164`
- Tracks final standings per season
- Determines last place by max rank per season
- Creates SeasonFinish records

### Championship Finishes Display
**File:** `app/page.tsx:488-558`
- Calculates finish counts
- Determines max rank per season for last place
- Sorts by championships

---

## TypeScript Interfaces

### Core Data Types
```typescript
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
  seasonFinishes?: SeasonFinish[];  // Optional for backwards compatibility
}
```

---

## Dependencies

### Core Dependencies (package.json)
```json
{
  "dependencies": {
    "next": "14.2.33",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "postcss": "^8",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

### Installation
```bash
npm install
```

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Type checking
npx tsc --noEmit    # Check TypeScript errors
```

---

## Troubleshooting

### Issue: "Failed to fetch stats"
**Cause:** ESPN API cookies expired or invalid
**Fix:** Update `.env.local` with fresh `ESPN_S2` and `SWID` values

### Issue: Historical data not loading
**Cause:** Incorrect file naming or JSON structure
**Fix:** Ensure files are named `season-YYYY.json` and unwrapped

### Issue: Numbers showing as NaN
**Cause:** Data not properly converted to numbers
**Fix:** Check for `Number()` conversions in calculations

### Issue: "seasonFinishes is undefined"
**Cause:** Old cached data without new field
**Fix:** Hard refresh browser (Ctrl+Shift+R) or clear cache

---

## Future Enhancement Ideas

- [ ] Add playoff bracket visualization
- [ ] Add trade history analysis
- [ ] Add draft results tracking
- [ ] Export stats to CSV/PDF
- [ ] Add player performance charts
- [ ] Add weekly matchup details view
- [ ] Add email notifications for weekly high scores
- [ ] Add mobile responsive improvements
- [ ] Add authentication for multi-user access
- [ ] Add custom league configuration

---

## Git Repository Status

**Current:** Not initialized as git repository

**To initialize:**
```bash
cd /home/adam/Projects/ffootball
git init
git add .
git commit -m "Initial commit - Fantasy Football Stats"
```

**Files to ignore:** (.gitignore)
```
.env.local
.env*.local
node_modules/
.next/
out/
```

---

## Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables (ESPN_S2, SWID)
4. Deploy

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables

### Traditional Server
1. Install Node.js
2. Build: `npm run build`
3. Start: `npm start`
4. Use PM2 for process management

---

## Member Data (Current as of Dec 2025)

**Active Members:**
- Adam Lyon
- Andrew Foley
- Charles Gustafson
- Jerry York
- John Henry
- Matt Reichelt
- Michael Hams
- Michael Murray
- Neil Wideman
- Patrick Daniel
- Ryan Cook
- Ryan McCoy
- Sean Zurbriggen
- Alex Lange

**League ID:** 526838
**Years Available:** 2012-2025 (14 seasons)

---

## Statistics Summary (All-Time 2012-2025)

**Top Championship Winners:**
1. Andrew Foley - 3 championships
2. John Henry - 3 championships
3. Adam Lyon - 2 championships
4. Matt Reichelt - 2 championships

**Total Records Available:**
- 156 season finishes
- 214+ weekly high scores
- 1000+ head-to-head matchups
- Complete win/loss/tie records

---

## Contact & Support

**Project Owner:** Adam Lyon
**League:** TML Fantasy Football
**League ID:** 526838

---

## Last Updated
December 1, 2025

---

## Quick Reference Commands

```bash
# Start the app
cd /home/adam/Projects/ffootball && npm run dev

# Add new member name
# Edit: member-names.json
# Format: "{GUID}": "Display Name"

# Add historical data
# 1. Save to: historical-data/season-YYYY.json
# 2. Unwrap if needed (see "Adding New Historical Data" section)
# 3. Refresh browser

# View logs
# Check terminal running npm run dev

# Kill dev server
# Press Ctrl+C in terminal
```

---

**END OF SAVEPOINT**

This document represents the complete state of the Fantasy Football Stats project as of December 1, 2025. All features are functional and tested. The application successfully combines 14 years of data (2012-2025) with a modern, interactive interface.
