const { DateTime } = require('luxon');
const EasterCalculator = require('./EasterCalculator');

/**
 * LiturgicalDataParser class
 * Dynamically generates liturgical calendar data
 */
class LiturgicalDataParser {
  constructor(region = 'general') {
    this.region = region;
    this.easterCalculator = new EasterCalculator();
    this.indiaFeasts = this.loadIndiaFeasts();
    this.fixedFeasts = this.loadFixedFeasts();
  }

  /**
   * Get feast information for a specific date
   * @param {DateTime} date - Luxon DateTime object
   * @returns {Object|null} Feast information or null if no feast
   */
  getFeastForDate(date) {
    try {
      // Calculate Easter and related feast days
      const year = date.year;
      const easterDate = this.easterCalculator.getEasterDate(year);
      
      // Check for Easter-related moveable feasts
      const easterFeast = this.getEasterRelatedFeast(date, easterDate);
      
      // Check for fixed feasts
      const month = date.month;
      const day = date.day;
      
      // Look for fixed feasts
      const fixedFeast = this.getFixedFeast(month, day);
      
      // Look for India-specific feasts if region is India
      let indiaFeast = null;
      if (this.region === 'india') {
        indiaFeast = this.getIndiaFeast(month, day);
      }
      
      // Determine the liturgical season for season indicator
      const season = this.getLiturgicalSeasonInfo(date, easterDate);
      const seasonIndicator = {
        code: season.seasonCode,
        rank: 13.4,
        color: season.color
      };
      
      // Return the highest ranked feast in order of precedence:
      // 1. Easter-related (highest priority)
      // 2. India-specific feast (if in India region)
      // 3. Fixed feast from general calendar
      // 4. Season indicator (lowest priority)
      
      if (easterFeast) return easterFeast;
      if (indiaFeast) return indiaFeast;
      if (fixedFeast) return fixedFeast;
      return seasonIndicator;
    } catch (error) {
      console.error('Error getting feast for date:', error);
      return null;
    }
  }

  /**
   * Get all feasts for a specific date
   * @param {DateTime} date - Luxon DateTime object
   * @returns {Array} Array of feast information
   */
  getAllFeastsForDate(date) {
    try {
      const feasts = [];
      const year = date.year;
      const month = date.month;
      const day = date.day;
      
      // Get Easter date for the year
      const easterDate = this.easterCalculator.getEasterDate(year);
      
      // Add season indicator
      const season = this.getLiturgicalSeasonInfo(date, easterDate);
      feasts.push({
        code: season.seasonCode,
        rank: 13.4,
        color: season.color
      });
      
      // Check for Easter-related feasts
      const easterFeast = this.getEasterRelatedFeast(date, easterDate);
      if (easterFeast) {
        feasts.push(easterFeast);
      }
      
      // Check for fixed feasts
      const fixedFeast = this.getFixedFeast(month, day);
      if (fixedFeast) {
        feasts.push(fixedFeast);
      }
      
      // Check for India-specific feasts if region is India
      if (this.region === 'india') {
        const indiaFeast = this.getIndiaFeast(month, day);
        if (indiaFeast) {
          feasts.push(indiaFeast);
        }
      }
      
      return feasts;
    } catch (error) {
      console.error('Error getting all feasts for date:', error);
      return [];
    }
  }

  /**
   * Get liturgical season information
   * @param {DateTime} date - Luxon DateTime object
   * @param {DateTime} easterDate - Easter date for the year
   * @returns {Object} Season information
   */
  getLiturgicalSeasonInfo(date, easterDate) {
    const year = date.year;
    
    // Calculate key liturgical dates
    // Ash Wednesday (46 days before Easter)
    const ashWednesday = easterDate.minus({ days: 46 });
    
    // Pentecost (50 days after Easter)
    const pentecost = easterDate.plus({ days: 49 });
    
    // First Sunday of Advent (4th Sunday before Christmas)
    const christmas = DateTime.local(year, 12, 25);
    const daysUntilSunday = (7 - christmas.weekday) % 7;
    const fourthSundayOfAdvent = christmas.minus({ days: daysUntilSunday });
    const firstSundayOfAdvent = fourthSundayOfAdvent.minus({ days: 21 });
    
    // Epiphany and Baptism of the Lord
    const epiphany = DateTime.local(year, 1, 6);
    let baptismOfLord;
    
    if (epiphany.weekday === 6 || epiphany.weekday === 0) { // Saturday or Sunday
      baptismOfLord = epiphany.plus({ days: epiphany.weekday === 6 ? 2 : 1 });
    } else {
      // Next Sunday after Epiphany
      baptismOfLord = epiphany.plus({ days: 7 - epiphany.weekday });
    }
    
    // Determine the season
    let seasonName, seasonCode, color;
    
    if (date < ashWednesday && date >= baptismOfLord) {
      // Ordinary Time before Lent
      const weeksSinceBaptism = Math.floor(date.diff(baptismOfLord, 'weeks').weeks);
      const weekNum = weeksSinceBaptism + 1;
      seasonName = 'Ordinary Time';
      seasonCode = `OW${weekNum.toString().padStart(2, '0')}-${date.weekday}${this.getDayAbbreviation(date.weekday)}`;
      color = 'green';
    } else if (date >= ashWednesday && date < easterDate) {
      // Lent
      const weeksSinceAshWednesday = Math.floor(date.diff(ashWednesday, 'weeks').weeks);
      const weekNum = weeksSinceAshWednesday;
      seasonName = 'Lent';
      seasonCode = `LW${weekNum.toString().padStart(2, '0')}-${date.weekday}${this.getDayAbbreviation(date.weekday)}`;
      color = 'purple';
      
      // Laetare Sunday (4th Sunday of Lent)
      if (date.weekday === 0 && weekNum === 3) {
        color = 'rose';
      }
    } else if (date >= easterDate && date < pentecost) {
      // Easter
      const weeksSinceEaster = Math.floor(date.diff(easterDate, 'weeks').weeks);
      const weekNum = weeksSinceEaster + 1;
      seasonName = 'Easter';
      seasonCode = `EW${weekNum.toString().padStart(2, '0')}-${date.weekday}${this.getDayAbbreviation(date.weekday)}`;
      color = 'white';
    } else if (date >= pentecost && date < firstSundayOfAdvent) {
      // Ordinary Time after Pentecost
      const weeksSincePentecost = Math.floor(date.diff(pentecost, 'weeks').weeks);
      const weekNum = weeksSincePentecost + 10; // Approximation for OT numbering
      seasonName = 'Ordinary Time';
      seasonCode = `OW${weekNum.toString().padStart(2, '0')}-${date.weekday}${this.getDayAbbreviation(date.weekday)}`;
      color = 'green';
    } else if (date >= firstSundayOfAdvent && date < christmas) {
      // Advent
      const weeksSinceAdvent = Math.floor(date.diff(firstSundayOfAdvent, 'weeks').weeks);
      const weekNum = weeksSinceAdvent + 1;
      seasonName = 'Advent';
      seasonCode = `AW${weekNum.toString().padStart(2, '0')}-${date.weekday}${this.getDayAbbreviation(date.weekday)}`;
      color = 'purple';
      
      // Gaudete Sunday (3rd Sunday of Advent)
      if (date.weekday === 0 && weekNum === 3) {
        color = 'rose';
      }
    } else if ((date >= christmas && date <= DateTime.local(year, 12, 31)) || 
               (date >= DateTime.local(year, 1, 1) && date < baptismOfLord)) {
      // Christmas season
      const weekNum = date.month === 12 ? 1 : 2;
      seasonName = 'Christmas';
      seasonCode = `CW${weekNum.toString().padStart(2, '0')}-${date.weekday}${this.getDayAbbreviation(date.weekday)}`;
      color = 'white';
    }
    
    return {
      name: seasonName,
      abbreviation: seasonName.substring(0, 2).toUpperCase(),
      seasonCode,
      color,
      week: parseInt(seasonCode.match(/W(\d+)/)[1])
    };
  }

  /**
   * Get Easter-related feast for a specific date
   * @param {DateTime} date - Luxon DateTime object
   * @param {DateTime} easterDate - Easter date for the year
   * @returns {Object|null} Feast information or null if not an Easter-related feast
   */
  getEasterRelatedFeast(date, easterDate) {
    const dateStr = date.toFormat('yyyy-MM-dd');
    const easterStr = easterDate.toFormat('yyyy-MM-dd');
    
    if (dateStr === easterStr) {
      return {
        code: 'Easter Sunday',
        rank: 1,
        type: 'Solemnity',
        color: 'white'
      };
    }
    
    // Ash Wednesday (46 days before Easter)
    const ashWednesday = easterDate.minus({ days: 46 });
    if (dateStr === ashWednesday.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Ash Wednesday',
        rank: 2.2,
        type: 'Special',
        color: 'purple'
      };
    }
    
    // Palm Sunday (7 days before Easter)
    const palmSunday = easterDate.minus({ days: 7 });
    if (dateStr === palmSunday.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Palm Sunday',
        rank: 2.3,
        type: 'Feast',
        color: 'red'
      };
    }
    
    // Holy Thursday (3 days before Easter)
    const holyThursday = easterDate.minus({ days: 3 });
    if (dateStr === holyThursday.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Holy Thursday',
        rank: 1.1,
        type: 'Solemnity',
        color: 'white'
      };
    }
    
    // Good Friday (2 days before Easter)
    const goodFriday = easterDate.minus({ days: 2 });
    if (dateStr === goodFriday.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Good Friday',
        rank: 1.1,
        type: 'Solemnity',
        color: 'red'
      };
    }
    
    // Holy Saturday (1 day before Easter)
    const holySaturday = easterDate.minus({ days: 1 });
    if (dateStr === holySaturday.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Holy Saturday',
        rank: 1.1,
        type: 'Solemnity',
        color: 'white'
      };
    }
    
    // Divine Mercy Sunday (1 week after Easter)
    const divineMercy = easterDate.plus({ days: 7 });
    if (dateStr === divineMercy.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Divine Mercy Sunday',
        rank: 5,
        type: 'Feast',
        color: 'white'
      };
    }
    
    // Ascension (40 days after Easter, or the following Sunday in some regions)
    const ascension = easterDate.plus({ days: 39 });
    if (dateStr === ascension.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Ascension of the Lord',
        rank: 2,
        type: 'Solemnity',
        color: 'white'
      };
    }
    
    // Pentecost (50 days after Easter)
    const pentecost = easterDate.plus({ days: 49 });
    if (dateStr === pentecost.toFormat('yyyy-MM-dd')) {
      return {
        code: 'Pentecost',
        rank: 2,
        type: 'Solemnity',
        color: 'red'
      };
    }
    
    return null;
  }

  /**
   * Get fixed feast for a specific month and day
   * @param {number} month - Month (1-12)
   * @param {number} day - Day of month
   * @returns {Object|null} Feast information or null if no fixed feast
   */
  getFixedFeast(month, day) {
    // Check for feasts in the fixed feasts list
    for (const feast of this.fixedFeasts) {
      if (parseInt(feast.feast_month) === month && parseInt(feast.feast_date) === day) {
        return {
          code: feast.feast_code,
          rank: this.getRankFromType(feast.feast_type),
          type: feast.feast_type,
          color: this.getColorFromType(feast.feast_type, feast.feast_code)
        };
      }
    }
    
    return null;
  }

  /**
   * Get India-specific feast for a specific month and day
   * @param {number} month - Month (1-12)
   * @param {number} day - Day of month
   * @returns {Object|null} Feast information or null if no India-specific feast
   */
  getIndiaFeast(month, day) {
    // Check for feasts in the India-specific feasts list
    for (const feast of this.indiaFeasts) {
      if (parseInt(feast.feast_month) === month && parseInt(feast.feast_date) === day) {
        return {
          code: feast.feast_code,
          rank: this.getRankFromType(feast.feast_type),
          type: feast.feast_type,
          color: this.getColorFromType(feast.feast_type, feast.feast_code)
        };
      }
    }
    
    return null;
  }

  /**
   * Get liturgical season for a specific date
   * @param {DateTime} date - Luxon DateTime object
   * @returns {Object} Season information
   */
  getLiturgicalSeason(date) {
    try {
      const easterDate = this.easterCalculator.getEasterDate(date.year);
      const seasonInfo = this.getLiturgicalSeasonInfo(date, easterDate);
      
      return {
        name: seasonInfo.name,
        abbreviation: seasonInfo.abbreviation,
        color: seasonInfo.color
      };
    } catch (error) {
      console.error('Error getting liturgical season:', error);
      return { name: 'Ordinary Time', abbreviation: 'OT', color: 'green' };
    }
  }

  /**
   * Parse a code to get liturgical week information
   * @param {string} code - Liturgical code (e.g., "OW21-3Wed")
   * @returns {Object} Week information
   */
  parseWeekInfo(code) {
    try {
      if (!code || typeof code !== 'string') {
        return { week: 0, weekday: 0 };
      }
      
      // Parse codes like "OW21-3Wed" or "LW04-5Fri"
      const match = code.match(/([A-Z]+)(\d+)-(\d+)([A-Za-z]+)/);
      
      if (match) {
        const season = match[1]; // OW, LW, etc.
        const week = parseInt(match[2]);
        const weekday = parseInt(match[3]);
        
        return { week, weekday };
      }
      
      return { week: 0, weekday: 0 };
    } catch (error) {
      console.error('Error parsing week info:', error);
      return { week: 0, weekday: 0 };
    }
  }

  /**
   * Process feast data into a standardized format
   * @param {Object} feast - Feast data
   * @returns {Object} Standardized feast object
   */
  processFeast(feast) {
    if (!feast) return null;
    
    const name = feast.code || '';
    let rank = 0;
    let type = '';
    let color = feast.color || 'green';
    
    // Convert numeric rank to string rank
    if (feast.rank) {
      const rankNum = parseFloat(feast.rank);
      
      if (rankNum <= 3.2) {
        rank = 5; // Solemnity of the highest rank
        type = 'Solemnity';
      } else if (rankNum <= 5) {
        rank = 4; // Solemnity
        type = 'Solemnity';
      } else if (rankNum <= 7) {
        rank = 3; // Feast
        type = 'Feast';
      } else if (rankNum <= 10.2) {
        rank = 2; // Memorial
        type = 'Mem';
      } else {
        rank = 1; // Optional Memorial
        type = 'OpMem';
      }
    } else if (feast.type) {
      // Use the provided type
      type = feast.type;
      
      if (type.includes('Solemnity')) {
        rank = 4;
      } else if (type.includes('Feast')) {
        rank = 3;
      } else if (type.includes('Mem') && !type.includes('OpMem')) {
        rank = 2;
      } else {
        rank = 1;
      }
    }
    
    return {
      name,
      rank,
      type,
      color: color,
      isIndianFeast: name.includes('IN ') || false
    };
  }

  /**
   * Get day abbreviation
   * @param {number} weekday - Weekday (0-6, where 0 is Sunday)
   * @returns {string} Day abbreviation
   */
  getDayAbbreviation(weekday) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[weekday] || '';
  }

  /**
   * Get rank from feast type
   * @param {string} type - Feast type
   * @returns {number} Rank
   */
  getRankFromType(type) {
    if (type.includes('Solemnity')) {
      return 3.1;
    } else if (type.includes('Feast')) {
      return 7;
    } else if (type === 'Mem') {
      return 10.2;
    } else {
      return 12;
    }
  }

  /**
   * Get color from feast type and code
   * @param {string} type - Feast type
   * @param {string} code - Feast code
   * @returns {string} Color
   */
  getColorFromType(type, code) {
    // Check for martyr feasts - should be red
    if (code && (code.toLowerCase().includes('martyr') || 
        code.toLowerCase().includes('cross') || 
        code.toLowerCase().includes('passion') ||
        code.toLowerCase().includes('blood'))) {
      return 'red';
    } 
    // Check for apostles - should be red
    else if (code && (code.toLowerCase().includes('apostle') && !code.toLowerCase().includes('virgin'))) {
      return 'red';
    }
    // Check for Pentecost
    else if (code && code.toLowerCase().includes('pentecost')) {
      return 'red';
    } 
    // Most feasts are white
    else if (type && (type.includes('Solemnity') || type.includes('Feast') || type.includes('Mem'))) {
      return 'white';
    } 
    // Advent and Lent are purple
    else if (code && (code.startsWith('AW') || code.startsWith('LW'))) {
      // Handle rose Sundays
      if ((code.startsWith('AW03-0') || code.startsWith('LW04-0'))) {
        return 'rose';
      }
      return 'purple';
    }
    // Christmas and Easter are white
    else if (code && (code.startsWith('CW') || code.startsWith('EW'))) {
      return 'white';
    }
    // Default to green for Ordinary Time
    else {
      return 'green';
    }
  }

  /**
   * Load India-specific feasts
   * @returns {Array} India-specific feasts
   */
  loadIndiaFeasts() {
    return [
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
  }

  /**
   * Load fixed feasts
   * @returns {Array} Fixed feasts
   */
  loadFixedFeasts() {
    return [
      {
        "feast_month": "1",
        "feast_date": "1",
        "feast_code": "Blessed Virgin Mary, the Mother of God",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "1",
        "feast_date": "6",
        "feast_code": "Epiphany",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "1",
        "feast_date": "2",
        "feast_code": "Saints Basil the Great and Gregory Nazianzen, bishops and doctors",
        "feast_type": "Mem"
      },
      {
        "feast_month": "1",
        "feast_date": "7",
        "feast_code": "Saint Raymond of Penyafort, priest",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "1",
        "feast_date": "13",
        "feast_code": "Saint Hilary of Poitiers, bishop and doctor",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "1",
        "feast_date": "17",
        "feast_code": "Saint Anthony of Egypt, abbot",
        "feast_type": "Mem"
      },
      {
        "feast_month": "1",
        "feast_date": "20",
        "feast_code": "Saint Fabian, pope and martyr",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "1",
        "feast_date": "21",
        "feast_code": "Saint Agnes, virgin and martyr",
        "feast_type": "Mem"
      },
      {
        "feast_month": "1",
        "feast_date": "22",
        "feast_code": "Saint Vincent, deacon and martyr",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "1",
        "feast_date": "24",
        "feast_code": "Saint Francis de Sales, bishop and doctor",
        "feast_type": "Mem"
      },
      {
        "feast_month": "1",
        "feast_date": "25",
        "feast_code": "The Conversion of Saint Paul, apostle",
        "feast_type": "Feast"
      },
      {
        "feast_month": "1",
        "feast_date": "26",
        "feast_code": "Saints Timothy and Titus, bishops",
        "feast_type": "Mem"
      },
      {
        "feast_month": "1",
        "feast_date": "27",
        "feast_code": "Saint Angela Merici, virgin",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "1",
        "feast_date": "28",
        "feast_code": "Saint Thomas Aquinas, priest and doctor",
        "feast_type": "Mem"
      },
      {
        "feast_month": "1",
        "feast_date": "31",
        "feast_code": "Saint John Bosco, priest",
        "feast_type": "Mem"
      },
      {
        "feast_month": "2",
        "feast_date": "2",
        "feast_code": "Presentation of the Lord",
        "feast_type": "Feast-Lord"
      },
      {
        "feast_month": "2",
        "feast_date": "3",
        "feast_code": "Saint Blase, bishop and martyr",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "2",
        "feast_date": "5",
        "feast_code": "Saint Agatha, virgin and martyr",
        "feast_type": "Mem"
      },
      {
        "feast_month": "2",
        "feast_date": "6",
        "feast_code": "Saints Paul Miki and companions, martyrs",
        "feast_type": "Mem"
      },
      {
        "feast_month": "2",
        "feast_date": "10",
        "feast_code": "Saint Scholastica, virgin",
        "feast_type": "Mem"
      },
      {
        "feast_month": "2",
        "feast_date": "11",
        "feast_code": "Our Lady of Lourdes",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "2",
        "feast_date": "22",
        "feast_code": "Chair of Saint Peter, apostle",
        "feast_type": "Feast"
      },
      {
        "feast_month": "2",
        "feast_date": "23",
        "feast_code": "Saint Polycarp, bishop and martyr",
        "feast_type": "Mem"
      },
      {
        "feast_month": "3",
        "feast_date": "19",
        "feast_code": "Saint Joseph Husband of the Blessed Virgin Mary",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "3",
        "feast_date": "25",
        "feast_code": "Annunciation of the Lord",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "4",
        "feast_date": "25",
        "feast_code": "Saint Mark the Evangelist",
        "feast_type": "Feast"
      },
      {
        "feast_month": "5",
        "feast_date": "1",
        "feast_code": "Saint Joseph the Worker",
        "feast_type": "OpMem"
      },
      {
        "feast_month": "5",
        "feast_date": "3",
        "feast_code": "Saints Philip and James, Apostles",
        "feast_type": "Feast"
      },
      {
        "feast_month": "5",
        "feast_date": "14",
        "feast_code": "Saint Matthias the Apostle",
        "feast_type": "Feast"
      },
      {
        "feast_month": "5",
        "feast_date": "31",
        "feast_code": "Visitation of the Blessed Virgin Mary",
        "feast_type": "Feast"
      },
      {
        "feast_month": "6",
        "feast_date": "24",
        "feast_code": "Birth of Saint John the Baptist",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "6",
        "feast_date": "29",
        "feast_code": "Saints Peter and Paul, Apostles",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "7",
        "feast_date": "3",
        "feast_code": "Saint Thomas the Apostle",
        "feast_type": "Feast"
      },
      {
        "feast_month": "7",
        "feast_date": "22",
        "feast_code": "Saint Mary Magdalene",
        "feast_type": "Feast"
      },
      {
        "feast_month": "7",
        "feast_date": "25",
        "feast_code": "Saint James, apostle",
        "feast_type": "Feast"
      },
      {
        "feast_month": "7",
        "feast_date": "26",
        "feast_code": "Saints Joachim and Anne",
        "feast_type": "Mem"
      },
      {
        "feast_month": "8",
        "feast_date": "6",
        "feast_code": "Transfiguration of the Lord",
        "feast_type": "Feast-Lord"
      },
      {
        "feast_month": "8",
        "feast_date": "10",
        "feast_code": "Saint Lawrence, deacon and martyr",
        "feast_type": "Feast"
      },
      {
        "feast_month": "8",
        "feast_date": "15",
        "feast_code": "Assumption of the Blessed Virgin Mary",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "8",
        "feast_date": "24",
        "feast_code": "Saint Bartholomew the Apostle",
        "feast_type": "Feast"
      },
      {
        "feast_month": "9",
        "feast_date": "8",
        "feast_code": "Birth of the Blessed Virgin Mary",
        "feast_type": "Feast"
      },
      {
        "feast_month": "9",
        "feast_date": "14",
        "feast_code": "Exaltation of the Holy Cross",
        "feast_type": "Feast-Lord"
      },
      {
        "feast_month": "9",
        "feast_date": "21",
        "feast_code": "Saint Matthew the Evangelist, Apostle, Evangelist",
        "feast_type": "Feast"
      },
      {
        "feast_month": "9",
        "feast_date": "29",
        "feast_code": "Saints Michael, Gabriel and Raphael, Archangels",
        "feast_type": "Feast"
      },
      {
        "feast_month": "10",
        "feast_date": "18",
        "feast_code": "Saint Luke the Evangelist",
        "feast_type": "Feast"
      },
      {
        "feast_month": "10",
        "feast_date": "28",
        "feast_code": "Saint Simon and Saint Jude, apostles",
        "feast_type": "Feast"
      },
      {
        "feast_month": "11",
        "feast_date": "1",
        "feast_code": "All Saints",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "11",
        "feast_date": "2",
        "feast_code": "All Souls",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "11",
        "feast_date": "9",
        "feast_code": "Dedication of the Lateran basilica",
        "feast_type": "Feast-Lord"
      },
      {
        "feast_month": "11",
        "feast_date": "30",
        "feast_code": "Saint Andrew the Apostle",
        "feast_type": "Feast"
      },
      {
        "feast_month": "12",
        "feast_date": "8",
        "feast_code": "Immaculate Conception of the Blessed Virgin Mary",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "12",
        "feast_date": "25",
        "feast_code": "Nativity of the Lord",
        "feast_type": "Solemnity"
      },
      {
        "feast_month": "12",
        "feast_date": "26",
        "feast_code": "Saint Stephen, the first martyr",
        "feast_type": "Feast"
      },
      {
        "feast_month": "12",
        "feast_date": "27",
        "feast_code": "Saint John the Apostle and evangelist",
        "feast_type": "Feast"
      },
      {
        "feast_month": "12",
        "feast_date": "28",
        "feast_code": "Holy Innocents, martyrs",
        "feast_type": "Feast"
      }
    ];
  }
}

module.exports = LiturgicalDataParser;