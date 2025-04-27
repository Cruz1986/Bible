const { DateTime } = require('luxon');
const EasterCalculator = require('../utils/EasterCalculator');
const LiturgicalColors = require('../utils/LiturgicalColors');
const FixedFeastDays = require('../utils/FixedFeastDays');
const LiturgicalDataParser = require('../utils/LiturgicalDataParser');

/**
 * LiturgicalCalendar class
 * Core functionality for Roman Catholic liturgical calendar calculations
 */
class LiturgicalCalendar {
  constructor(region = 'general') {
    this.region = region;
    this.easterCalculator = new EasterCalculator();
    this.liturgicalColors = new LiturgicalColors();
    this.fixedFeasts = new FixedFeastDays(region);
    this.dataParser = new LiturgicalDataParser();
  }

  /**
   * Get liturgical information for a specific date
   * @param {Date} date - JavaScript Date object
   * @returns {Object} Liturgical day information
   */
  getLiturgicalDayInfo(date) {
    const dt = DateTime.fromJSDate(date);
    const year = dt.year;
    
    // Try to get information from the complex calendar data
    const feastInfo = this.dataParser.getFeastForDate(dt);
    const allFeastsForDate = this.dataParser.getAllFeastsForDate(dt);
    
    // Get season information from the data parser
    const season = this.dataParser.getLiturgicalSeason(dt);
    
    // Process feast information
    const feastDay = feastInfo ? this.dataParser.processFeast(feastInfo) : null;
    
    // Get liturgical color (from feast or from season)
    const color = feastDay?.color || season.color;
    
    // Calculate liturgical week and day
    let weekInfo = { week: 0, weekday: dt.weekday };
    
    // Try to extract week information from feast codes
    if (allFeastsForDate.length > 0) {
      // Find the feast that indicates the liturgical week (usually has a code like "OW21-3Wed")
      const seasonFeast = allFeastsForDate.find(feast => 
        feast.code && 
        (feast.code.startsWith('OW') || 
         feast.code.startsWith('AW') ||
         feast.code.startsWith('CW') ||
         feast.code.startsWith('LW') ||
         feast.code.startsWith('EW')));
         
      if (seasonFeast) {
        const parsedWeekInfo = this.dataParser.parseWeekInfo(seasonFeast.code);
        weekInfo.week = parsedWeekInfo.week;
      }
    }
    
    // If we couldn't get week info from the calendar data, fall back to calculation
    if (weekInfo.week === 0) {
      // Fall back to traditional calculations for liturgical week
      // Get Easter date for the year
      const easterDate = this.easterCalculator.getEasterDate(year);
      
      // Fall back to calculated season if needed
      const calculatedSeason = this.getCalculatedSeason(dt, easterDate);
      
      // Calculate liturgical week
      weekInfo = this.getLiturgicalWeek(dt, easterDate, calculatedSeason);
    }
    
    return {
      date: dt.toFormat('yyyy-MM-dd'),
      season,
      feastDay,
      color,
      week: weekInfo.week,
      weekday: weekInfo.weekday,
      dayOfSeason: weekInfo.dayOfSeason || 0,
      isHolyDay: feastDay?.rank >= 3 || false,
      isSolemnity: feastDay?.rank >= 4 || false,
      allFeastsForDate: allFeastsForDate.map(feast => this.dataParser.processFeast(feast))
    };
  }

  /**
   * Calculate the liturgical season (used as fallback when data isn't available)
   * @param {DateTime} dt - Luxon DateTime object
   * @param {DateTime} easterDate - Easter date for the year
   * @returns {Object} Season information
   */
  getCalculatedSeason(dt, easterDate) {
    // Calculate important dates
    const year = dt.year;
    
    // Ash Wednesday (46 days before Easter)
    const ashWednesday = easterDate.minus({ days: 46 });
    
    // Pentecost (50 days after Easter)
    const pentecost = easterDate.plus({ days: 49 });
    
    // First Sunday of Advent (4th Sunday before Christmas)
    let christmasDay = DateTime.local(year, 12, 25);
    let daysUntilSunday = (7 - christmasDay.weekday) % 7;
    let fourthSundayOfAdvent = christmasDay.minus({ days: daysUntilSunday });
    let firstSundayOfAdvent = fourthSundayOfAdvent.minus({ days: 21 });
    
    // Baptism of the Lord (Sunday after Epiphany, or January 8/9 if Epiphany is on Saturday/Sunday)
    let epiphany = DateTime.local(year, 1, 6); // In some regions Epiphany is on Jan 6
    let baptismOfLord;
    
    if (epiphany.weekday === 6 || epiphany.weekday === 0) { // Saturday or Sunday
      baptismOfLord = epiphany.plus({ days: epiphany.weekday === 6 ? 2 : 1 });
    } else {
      // Next Sunday after Epiphany
      baptismOfLord = epiphany.plus({ days: 7 - epiphany.weekday });
    }
    
    // Determine season
    if (dt < ashWednesday && dt >= baptismOfLord) {
      return { name: 'Ordinary Time (Pre-Lent)', abbreviation: 'OT', color: 'green' };
    } else if (dt >= ashWednesday && dt < easterDate) {
      return { name: 'Lent', abbreviation: 'LT', color: 'purple' };
    } else if (dt >= easterDate && dt < pentecost) {
      return { name: 'Easter', abbreviation: 'ET', color: 'white' };
    } else if (dt >= pentecost && dt < firstSundayOfAdvent) {
      return { name: 'Ordinary Time (Post-Pentecost)', abbreviation: 'OT', color: 'green' };
    } else if (dt >= firstSundayOfAdvent && dt <= DateTime.local(year, 12, 25)) {
      return { name: 'Advent', abbreviation: 'AV', color: 'purple' };
    } else if ((dt >= DateTime.local(year, 12, 26) && dt <= DateTime.local(year, 12, 31)) ||
               (dt >= DateTime.local(year, 1, 1) && dt < baptismOfLord)) {
      return { name: 'Christmas', abbreviation: 'CT', color: 'white' };
    }
    
    // Default
    return { name: 'Ordinary Time', abbreviation: 'OT', color: 'green' };
  }

  /**
   * Calculate liturgical week information (used as fallback)
   * @param {DateTime} dt - Luxon DateTime object
   * @param {DateTime} easterDate - Easter date for the year
   * @param {Object} season - Current liturgical season
   * @returns {Object} Week information
   */
  getLiturgicalWeek(dt, easterDate, season) {
    const year = dt.year;
    let week = 0;
    let dayOfSeason = 0;
    
    if (season.name.includes('Ordinary Time')) {
      // Calculate week of Ordinary Time
      const firstSundayOT = this.getBaptismOfLord(year).plus({ days: 7 });
      
      if (dt >= firstSundayOT && dt < easterDate.minus({ days: 46 })) {
        // Pre-Lent Ordinary Time
        const daysDiff = Math.floor(dt.diff(firstSundayOT, 'days').days);
        week = Math.floor(daysDiff / 7) + 1;
        dayOfSeason = daysDiff + 1;
      } else {
        // Post-Pentecost Ordinary Time
        const pentecost = easterDate.plus({ days: 49 });
        const mondayAfterPentecost = pentecost.plus({ days: 1 });
        
        // Weeks to add (account for weeks already counted in pre-Lent OT)
        const baptismOfLord = this.getBaptismOfLord(year);
        const ashWednesday = easterDate.minus({ days: 46 });
        const preOTWeeks = Math.floor(ashWednesday.diff(baptismOfLord, 'weeks').weeks);
        
        const daysDiff = Math.floor(dt.diff(mondayAfterPentecost, 'days').days);
        week = Math.floor(daysDiff / 7) + preOTWeeks + 1;
        dayOfSeason = daysDiff + 1 + (preOTWeeks * 7);
      }
    } else if (season.name === 'Advent') {
      const firstSundayOfAdvent = this.getFirstSundayOfAdvent(year);
      const daysDiff = Math.floor(dt.diff(firstSundayOfAdvent, 'days').days);
      week = Math.floor(daysDiff / 7) + 1;
      dayOfSeason = daysDiff + 1;
    } else if (season.name === 'Christmas') {
      const christmas = DateTime.local(year, 12, 25);
      if (dt.month === 12) {
        // After Christmas
        dayOfSeason = dt.day - 24;
      } else {
        // January
        const daysInDec = DateTime.local(year-1, 12, 31).day - 24;
        dayOfSeason = daysInDec + dt.day;
      }
      week = Math.floor((dayOfSeason - 1) / 7) + 1;
    } else if (season.name === 'Lent') {
      const ashWednesday = easterDate.minus({ days: 46 });
      const daysDiff = Math.floor(dt.diff(ashWednesday, 'days').days);
      dayOfSeason = daysDiff + 1;
      week = Math.floor((daysDiff + 3) / 7) + 1; // Adjust for partial first week
    } else if (season.name === 'Easter') {
      const daysDiff = Math.floor(dt.diff(easterDate, 'days').days);
      dayOfSeason = daysDiff + 1;
      week = Math.floor(daysDiff / 7) + 1;
    }
    
    return {
      week,
      weekday: dt.weekday, // 1-7 (Monday-Sunday)
      dayOfSeason
    };
  }

  /**
   * Get the date of the First Sunday of Advent for a given year
   * @param {number} year - Year
   * @returns {DateTime} First Sunday of Advent
   */
  getFirstSundayOfAdvent(year) {
    // First Sunday of Advent is the Sunday closest to November 30
    const nov30 = DateTime.local(year, 11, 30);
    const weekday = nov30.weekday; // 1-7 for Monday-Sunday
    
    if (weekday === 0) { // If November 30 is a Sunday
      return nov30;
    } else {
      // Get the previous Sunday
      const daysToSunday = weekday;
      return nov30.minus({ days: daysToSunday });
    }
  }

  /**
   * Get the date of the Baptism of the Lord for a given year
   * @param {number} year - Year
   * @returns {DateTime} Baptism of the Lord
   */
  getBaptismOfLord(year) {
    // Epiphany is traditionally January 6
    let epiphany = DateTime.local(year, 1, 6);
    
    // Baptism of the Lord is the Sunday after Epiphany
    // unless Epiphany falls on Saturday or Sunday
    if (epiphany.weekday === 6) { // Saturday
      return epiphany.plus({ days: 2 }); // Monday, January 8
    } else if (epiphany.weekday === 0) { // Sunday
      return epiphany.plus({ days: 1 }); // Monday, January 7
    } else {
      // Next Sunday after Epiphany
      return epiphany.plus({ days: 7 - epiphany.weekday });
    }
  }

  /**
   * Get all liturgical seasons for a year
   * @param {number} year - Year
   * @returns {Array} Array of season information with start and end dates
   */
  getLiturgicalSeasons(year) {
    const easterDate = this.easterCalculator.getEasterDate(year);
    
    // Calculate key dates
    const ashWednesday = easterDate.minus({ days: 46 });
    const pentecost = easterDate.plus({ days: 49 });
    const baptismOfLord = this.getBaptismOfLord(year);
    const firstSundayOfAdvent = this.getFirstSundayOfAdvent(year);
    const christmas = DateTime.local(year, 12, 25);
    
    return [
      {
        name: 'Christmas',
        startDate: DateTime.local(year-1, 12, 25).toFormat('yyyy-MM-dd'),
        endDate: baptismOfLord.minus({ days: 1 }).toFormat('yyyy-MM-dd')
      },
      {
        name: 'Ordinary Time (Pre-Lent)',
        startDate: baptismOfLord.toFormat('yyyy-MM-dd'),
        endDate: ashWednesday.minus({ days: 1 }).toFormat('yyyy-MM-dd')
      },
      {
        name: 'Lent',
        startDate: ashWednesday.toFormat('yyyy-MM-dd'),
        endDate: easterDate.minus({ days: 1 }).toFormat('yyyy-MM-dd')
      },
      {
        name: 'Easter',
        startDate: easterDate.toFormat('yyyy-MM-dd'),
        endDate: pentecost.toFormat('yyyy-MM-dd')
      },
      {
        name: 'Ordinary Time (Post-Pentecost)',
        startDate: pentecost.plus({ days: 1 }).toFormat('yyyy-MM-dd'),
        endDate: firstSundayOfAdvent.minus({ days: 1 }).toFormat('yyyy-MM-dd')
      },
      {
        name: 'Advent',
        startDate: firstSundayOfAdvent.toFormat('yyyy-MM-dd'),
        endDate: christmas.minus({ days: 1 }).toFormat('yyyy-MM-dd')
      },
      {
        name: 'Christmas',
        startDate: christmas.toFormat('yyyy-MM-dd'),
        endDate: DateTime.local(year, 12, 31).toFormat('yyyy-MM-dd')
      }
    ];
  }

  /**
   * Get feast days for a specific year
   * @param {number} year - Year
   * @returns {Array} Array of feast days with dates
   */
  getFeastDays(year) {
    const feastDays = [];
    
    // Loop through each day of the year
    const startDate = DateTime.local(year, 1, 1);
    const endDate = DateTime.local(year, 12, 31);
    
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const liturgicalInfo = this.getLiturgicalDayInfo(currentDate.toJSDate());
      
      // Add feast day if there is one
      if (liturgicalInfo.feastDay) {
        feastDays.push({
          name: liturgicalInfo.feastDay.name,
          date: currentDate.toFormat('yyyy-MM-dd'),
          rank: liturgicalInfo.feastDay.rank,
          type: liturgicalInfo.feastDay.type,
          color: liturgicalInfo.feastDay.color
        });
      }
      
      // Move to next day
      currentDate = currentDate.plus({ days: 1 });
    }
    
    // Sort by date
    feastDays.sort((a, b) => {
      return a.date.localeCompare(b.date);
    });
    
    return feastDays;
  }

  /**
   * Get full liturgical calendar data for an entire year
   * @param {number} year - Year
   * @returns {Array} Array of day-by-day liturgical information
   */
  getFullYearData(year) {
    const calendarData = [];
    const startDate = DateTime.local(year, 1, 1);
    const endDate = DateTime.local(year, 12, 31);
    
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const liturgicalDay = this.getLiturgicalDayInfo(currentDate.toJSDate());
      calendarData.push(liturgicalDay);
      
      // Move to next day
      currentDate = currentDate.plus({ days: 1 });
    }
    
    return calendarData;
  }
}

module.exports = LiturgicalCalendar;