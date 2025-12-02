#!/usr/bin/env node

/**
 * Historical Data Extraction Script
 *
 * This script fetches ESPN fantasy football pages and extracts matchup data
 * to create a local historical database.
 *
 * Usage:
 *   node scripts/fetch-historical.js <season> <url1> <url2> ...
 *
 * Example:
 *   node scripts/fetch-historical.js 2016 "https://fantasy.espn.com/football/league/schedule?leagueId=526838&seasonId=2016"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const ESPN_S2 = process.env.ESPN_S2;
const SWID = process.env.SWID;
const LEAGUE_ID = process.env.LEAGUE_ID;

if (!ESPN_S2 || !SWID || !LEAGUE_ID) {
  console.error('Error: Missing ESPN_S2, SWID, or LEAGUE_ID in .env.local');
  process.exit(1);
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Cookie': `espn_s2=${ESPN_S2}; SWID=${SWID}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractDataFromHTML(html, season) {
  // This will extract embedded JSON data from the ESPN page
  // ESPN embeds data in window.__NEXT_DATA__ or similar

  const nextDataMatch = html.match(/window\['__NEXT_DATA__'\]\s*=\s*({.+?});?\s*<\/script>/);
  const nextDataMatch2 = html.match(/<script id="__NEXT_DATA__" type="application\/json">({.+?})<\/script>/);

  let jsonData = null;

  if (nextDataMatch) {
    try {
      jsonData = JSON.parse(nextDataMatch[1]);
    } catch (e) {
      console.error('Failed to parse __NEXT_DATA__ (method 1):', e.message);
    }
  }

  if (!jsonData && nextDataMatch2) {
    try {
      jsonData = JSON.parse(nextDataMatch2[1]);
    } catch (e) {
      console.error('Failed to parse __NEXT_DATA__ (method 2):', e.message);
    }
  }

  if (!jsonData) {
    console.error('Could not find embedded JSON data in HTML');
    return null;
  }

  // Navigate through the Next.js data structure to find league data
  try {
    const pageProps = jsonData.props?.pageProps;
    return pageProps;
  } catch (e) {
    console.error('Error extracting data:', e.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/fetch-historical.js <season> <url>');
    console.error('Example: node scripts/fetch-historical.js 2016 "https://fantasy.espn.com/football/league/standings?leagueId=526838&seasonId=2016"');
    process.exit(1);
  }

  const season = parseInt(args[0]);
  const url = args[1];

  console.log(`Fetching data for ${season} from ESPN...`);
  console.log(`URL: ${url}`);

  try {
    const html = await fetchPage(url);
    console.log(`Downloaded ${html.length} bytes`);

    // Save raw HTML for inspection
    const htmlPath = path.join(__dirname, `..`, `historical-raw-${season}.html`);
    fs.writeFileSync(htmlPath, html);
    console.log(`Saved raw HTML to: ${htmlPath}`);

    const data = extractDataFromHTML(html, season);

    if (data) {
      const jsonPath = path.join(__dirname, `..`, `historical-data-${season}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      console.log(`Saved extracted data to: ${jsonPath}`);
      console.log('\nPlease inspect the JSON file and let me know what data is available.');
    } else {
      console.log('\nCould not automatically extract data.');
      console.log('Please inspect the HTML file and share what you see.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
