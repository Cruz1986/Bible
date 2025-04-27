const fs = require('fs');
const path = require('path');

/**
 * This script saves the liturgical calendar data to a JSON file
 * Run this with: node scripts/saveCalendarData.js
 */

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// The complex calendar data provided in your sample
const liturgicalCalendarPath = path.join(dataDir, 'liturgical-calendar.json');
fs.writeFileSync(liturgicalCalendarPath, fs.readFileSync(path.join(__dirname, 'calendar-data.json'), 'utf8'), 'utf8');
console.log(`Full liturgical calendar data saved to ${liturgicalCalendarPath}`);

// India-specific feasts
const indiaFeasts = [
  {
    "feast_month": "1",
    "feast_date": "3",
    "feast_code": "IN Saint Kuriakose Elias Chavara, priest",
    "feast_ta": "புனித குரியாக்கோஸ் எலியாஸ் சவரா - மறைப்பணியாளர்",
    "feast_type": "OpMem"
  },
  {
    "feast_month": "1",
    "feast_date": "14",
    "feast_code": "IN Saint Devasahayam Pillai, martyr",
    "feast_ta": "புனித தேவசகாயம் பிள்ளை, மறைச்சாட்சி",
    "feast_type": "OpMem"
  },
  {
    "feast_month": "1",
    "feast_date": "16",
    "feast_code": "IN Saint Joseph Vaz, priest",
    "feast_ta": "புனித ஜோசப் வாஸ் - மறைப்பணியாளர்",
    "feast_type": "Mem"
  },
  {
    "feast_month": "2",
    "feast_date": "4",
    "feast_code": "IN Saint John de Brito, priest and martyr",
    "feast_ta": "புனித ஜான் தெ பிரிட்டோ (அருளானந்தர்) - மறைப்பணியாளர், மறைச்சாட்சி",
    "feast_type": "Mem"
  },
  {
    "feast_month": "2",
    "feast_date": "6",
    "feast_code": "IN Saint Gonsalo Garcia, martyr",
    "feast_ta": "புனித கொன்சாலோ கார்சியா - மறைச்சாட்சி",
    "feast_type": "Mem"
  },
  {
    "feast_month": "2",
    "feast_date": "25",
    "feast_code": "IN Blessed Rani Maria, virgin, martyr",
    "feast_ta": "முத்தி. இராணி மரியா, கன்னியர், மறைச்சாட்சி",
    "feast_type": "OpMem"
  },
  {
    "feast_month": "6",
    "feast_date": "8",
    "feast_code": "IN Blessed Maria Theresa Chiramel, virgin",
    "feast_ta": "முத்தி. மரிய தெரேசா சிராமெல் - கன்னியர்",
    "feast_type": "OpMem"
  },
  {
    "feast_month": "7",
    "feast_date": "3",
    "feast_code": "IN Saint Thomas the Apostle",
    "feast_ta": "புனித தோமா - இந்தியாவின் திருத்தூதர்",
    "feast_type": "Solemnity-PrincipalPartron-Place"
  },
  {
    "feast_month": "7",
    "feast_date": "28",
    "feast_code": "IN Saint Alphonsa of the Immaculate Conception (Alphonsa Muttathupadathu), virgin",
    "feast_ta": "அமலோற்பவத்தின் புனித அல்போன்சா முட்டாத்துபாடாத் - கன்னியர்",
    "feast_type": "Mem"
  },
  {
    "feast_month": "8",
    "feast_date": "30",
    "feast_code": "IN Saint Euphrasia, virgin",
    "feast_ta": "புனித யூப்ரேசியா, கன்னியர்",
    "feast_type": "OpMem"
  },
  {
    "feast_month": "9",
    "feast_date": "5",
    "feast_code": "IN Saint Teresa of Calcutta, virgin",
    "feast_ta": "புனித அன்னை தெரேசா - கன்னியர்",
    "feast_type": "Mem"
  },
  {
    "feast_month": "10",
    "feast_date": "16",
    "feast_code": "IN Blessed Augustine Thevarparambil, priest",
    "feast_ta": "முத்தி. அகுஸ்தின் தேவர்பரம்பில் - மறைப்பணியாளர்",
    "feast_type": "OpMem"
  },
  {
    "feast_month": "12",
    "feast_date": "3",
    "feast_code": "IN Saint Francis Xavier, priest",
    "feast_ta": "புனித பிரான்சிஸ் சவேரியார் - மறைப்பணியாளர், இந்தியாவின் பாதுகாவலர்",
    "feast_type": "Solemnity-PrincipalPartron-Place"
  }
];

// Save India-specific feasts
const indiaFeastsPath = path.join(dataDir, 'india-feasts.json');
fs.writeFileSync(indiaFeastsPath, JSON.stringify(indiaFeasts, null, 2), 'utf8');
console.log(`India-specific feasts saved to ${indiaFeastsPath}`);

// Create README with instructions
const readmePath = path.join(dataDir, 'README.md');
const readmeContent = `# Liturgical Calendar Data Files

This directory contains JSON files with data for the Roman Catholic liturgical calendar:

- **liturgical-calendar.json**: Complete liturgical calendar with detailed day information
- **india-feasts.json**: Special feasts celebrated in India

## Usage

These files are used by the LiturgicalDataParser utility to provide information about the liturgical calendar.

## Data Structure

The liturgical-calendar.json uses a complex structure with the following format:

\`\`\`
{
  "month": {
    "day": [
      {
        "code": "Season code or feast name",
        "rank": 13.4,  // Numeric rank (lower is more important)
        "color": "color name",
        "type": "Feast type"
      }
    ]
  }
}
\`\`\`

Season codes in the "code" field follow this pattern:
- "OWxx-yDdd": Ordinary Time, week xx, day y (e.g., "OW14-3Wed" is Wednesday of Week 14 in Ordinary Time)
- "AWxx-yDdd": Advent, week xx, day y
- "CWxx-yDdd": Christmas, week xx, day y
- "LWxx-yDdd": Lent, week xx, day y
- "EWxx-yDdd": Easter, week xx, day y

## Notes

1. Indian feasts are prefixed with "IN " in the code field
2. Rank values indicate importance (lower numerical values have higher precedence)
3. Special days may have multiple celebrations listed in order of precedence
`;

fs.writeFileSync(readmePath, readmeContent, 'utf8');
console.log(`README file saved to ${readmePath}`);

console.log('All calendar data files have been successfully created.');