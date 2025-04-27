# Roman Catholic Liturgical Calendar API

This Express.js application provides a comprehensive Roman Catholic Liturgical Calendar API, with visual HTML calendar views and region-specific celebrations (including special feasts celebrated in India).

## Features

- **Full Liturgical Calendar Data**: Access complete liturgical information including seasons, feast days, solemnities, and liturgical colors
- **HTML Calendar Views**: Visual month and year views of the liturgical calendar
- **Region-Specific Feasts**: Supports India-specific feast days and celebrations
- **RESTful API**: Programmatic access to all calendar data
- **Multiple Output Formats**: Access data in JSON or visual HTML format

## Installation

1. Clone this repository:
```bash
git clone <your-repository-url>
cd liturgical-calendar-api
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the calendar data:
```bash
node scripts/saveCalendarData.js
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at http://localhost:3000 (or the port specified in your .env file).

## Using the Calendar

### API Endpoints

#### Retrieving Liturgical Information

- **Today's Data**: `/api/calendar/today`
- **Specific Date**: `/api/calendar/date/YYYY-MM-DD`
- **Date Range**: `/api/calendar/range/YYYY-MM-DD/YYYY-MM-DD`
- **Liturgical Seasons**: `/api/calendar/season/YYYY`
- **Feast Days**: `/api/calendar/feast/YYYY`
- **Complete Calendar for a Year**: `/api/calendar/year/YYYY`

#### HTML Views

- **Current Month View**: `/calendar/view`
- **Specific Month**: `/calendar/view/YYYY/MM`
- **Full Year Overview**: `/calendar/view/YYYY`

### India-Specific Calendar

To use the India-specific calendar that includes regional feast days:

```javascript
// Create an India-specific calendar instance
const { LiturgicalCalendar } = require('./src/services/LiturgicalCalendar');
const indiaCalendar = new LiturgicalCalendar('india');

// Get today's liturgical information for India
const today = new Date();
const liturgicalInfo = indiaCalendar.getLiturgicalDayInfo(today);
```

## Calendar Data Structure

The calendar uses a comprehensive data structure that includes:

- **Liturgical Seasons**: Advent, Christmas, Lent, Easter, Ordinary Time
- **Feast Types**:
  - Solemnities (highest rank)
  - Feasts
  - Memorials (obligatory)
  - Optional Memorials
- **Liturgical Colors**: green, purple, white, red, rose

### Example of Liturgical Day Information

```json
{
  "date": "2025-12-25",
  "season": {
    "name": "Christmas",
    "abbreviation": "CT",
    "color": "white"
  },
  "feastDay": {
    "name": "Nativity of the Lord",
    "rank": 5,
    "type": "Solemnity",
    "color": "white"
  },
  "color": "white",
  "week": 1,
  "weekday": 4,
  "isHolyDay": true,
  "isSolemnity": true
}
```

## Implementation Details

The application uses:

1. **Express.js**: Web framework for the API and HTML views
2. **Luxon**: For advanced date handling and calculations
3. **EJS**: Templating engine for HTML views
4. **JSON Data Files**: For storing liturgical calendar information

## Customization

You can customize the calendar by:

1. **Modifying feast days**: Edit the data files in the `data` directory
2. **Adding regional celebrations**: Create region-specific data files
3. **Changing HTML views**: Modify the EJS templates in `src/views`

## Credits

- Original PHP implementation by [jayarathina](https://github.com/jayarathina)
- Converted to Express.js with enhancements for regional celebrations and HTML views