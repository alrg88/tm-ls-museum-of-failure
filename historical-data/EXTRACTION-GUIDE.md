# How to Extract Historical Data from ESPN

This guide will help you extract historical fantasy football data (2012-2017) from ESPN's website and save it to use on your stats site.

## Prerequisites

- A web browser (Chrome, Firefox, Edge, or Safari)
- Access to your ESPN fantasy league with the correct cookies

## Step-by-Step Instructions

### 1. Open ESPN's Historical Standings Page

Visit: `https://fantasy.espn.com/football/league/standings?seasonId=YEAR&leagueId=526838`

Replace `YEAR` with the season you want (e.g., 2016, 2015, 2014, etc.)

Example: `https://fantasy.espn.com/football/league/standings?seasonId=2016&leagueId=526838`

### 2. Open Developer Tools

- **Windows/Linux**: Press `F12` or `Ctrl+Shift+I`
- **Mac**: Press `Cmd+Option+I`

### 3. Go to the Network Tab

Click on the **"Network"** tab at the top of Developer Tools

### 4. Filter Network Requests

In the filter/search box in the Network tab, type: `526838`

This will show only requests related to your league.

### 5. Refresh the Page

Press `F5` or `Ctrl+R` (or `Cmd+R` on Mac) to reload the page while watching the Network tab.

### 6. Find the League Data Request

Look for a request that contains:
- `leagueHistory` or similar in the name
- OR any URL with `leagues/526838`

The request name might look like:
- `leagueHistory`
- `526838?view=mSettings...`

### 7. View the Response

1. Click on that network request
2. Click on the **"Response"** or **"Preview"** tab
3. You should see JSON data with fields like:
   - `members`
   - `teams`
   - `schedule`
   - `seasonId`

### 8. Copy the JSON Data

- **Method 1**: Right-click on the response and select "Copy response"
- **Method 2**: Click in the response area, press `Ctrl+A` (or `Cmd+A`) to select all, then `Ctrl+C` (or `Cmd+C`) to copy

### 9. Save the Data File

1. Create a new file in the `historical-data` directory
2. Name it: `season-YEAR.json` (e.g., `season-2016.json`)
3. Paste the JSON data you copied
4. Save the file

### 10. Verify the Data

Open the file and make sure it contains valid JSON with these sections:
```json
{
  "seasonId": 2016,
  "members": [...],
  "teams": [...],
  "schedule": [...]
}
```

### 11. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm run dev
```

### 12. Test on Your Website

1. Go to `http://localhost:3000`
2. Select the year you just imported (e.g., 2016)
3. You should see the standings and stats for that year!

## Repeat for Other Years

To get all historical data from 2012-2017:
- Repeat steps 1-10 for each year (2012, 2013, 2014, 2015, 2016, 2017)
- Each year gets its own file: `season-2012.json`, `season-2013.json`, etc.

## Troubleshooting

### "I don't see any network requests with 526838"

- Make sure you're logged into ESPN
- Try clicking on different tabs on the ESPN page (Standings, Schedule, etc.)
- The request might appear when you navigate between sections

### "The response says 'Not Found' or shows an error"

- Make sure your ESPN session is still active
- Try logging out and back into ESPN
- Make sure you're using the correct league ID (526838)

### "The JSON file has syntax errors"

- Use a JSON validator: https://jsonlint.com/
- Make sure you copied the entire response
- Check for any extra characters at the beginning or end

### "The year doesn't show up on my site"

- Make sure the file is named correctly: `season-YEAR.json`
- Make sure it's in the `historical-data` directory
- Restart your dev server (`npm run dev`)
- Check the server console for any error messages

## Need Help?

If you're stuck, check the browser console for errors or ask for help!
