# Historical Data Directory

This directory contains manually imported historical fantasy football data for seasons before 2018.

## How to Import Historical Data

Since ESPN's API doesn't provide programmatic access to data before 2018, you need to manually extract it from their website:

### Step-by-Step Instructions:

1. **Open ESPN's historical page** in your browser:
   - Go to: `https://fantasy.espn.com/football/league/standings?seasonId=YEAR&leagueId=526838`
   - Replace `YEAR` with the season you want (e.g., 2016)

2. **Open Developer Tools** (F12)

3. **Go to the Network tab**

4. **Filter for "526838"** to find your league's API calls

5. **Find the API request** that contains:
   - `leagueHistory` or `leagues` in the URL
   - Your league ID `526838`

6. **Click on that request** and go to the "Response" tab

7. **Copy the entire JSON response**

8. **Save it** as a file in this directory with the naming format:
   - `season-YEAR.json` (e.g., `season-2016.json`)

9. **Refresh your stats website** - the data will automatically be included!

## File Format

Each file should contain the raw ESPN API response with at least:
- `members`: Array of league members
- `teams`: Array of teams with owner information
- `schedule`: Array of matchups with scores

Example structure:
```json
{
  "seasonId": 2016,
  "members": [...],
  "teams": [...],
  "schedule": [...]
}
```

## Notes

- The stats API will automatically detect and merge files from this directory
- Files are loaded on server startup, so restart your dev server after adding files
- Make sure the JSON is valid - use a JSON validator if needed
