/**
 * FixedFeastDays class
 * Provides information about fixed feast days in the liturgical calendar
 */
class FixedFeastDays {
  constructor(region = 'general') {
    this.region = region; // 'general' or 'india'
    // Initialize the feast day calendar
    this.feastDays = this.initializeFeastDays();
  }
  
  /**
   * Initialize the feast day calendar with fixed feast days
   * @returns {Object} Map of feast days by month and day
   */
  initializeFeastDays() {
    const feasts = {};
    
    try {
      // Load general feast day data
      const generalFeastData = require('../../data/fixed-feasts-general.json');
      
      // Process general feast data
      this.processFeastData(generalFeastData, feasts);
      
      // If region is India, load and override with India-specific feasts
      if (this.region === 'india') {
        try {
          const indiaFeastData = require('../../data/fixed-feasts-india.json');
          this.processFeastData(indiaFeastData, feasts);
        } catch (error) {
          console.error('Error loading India-specific feasts:', error);
        }
      }
      
      return feasts;
    } catch (error) {
      console.error('Error loading fixed feasts:', error);
      
      // Fallback to a minimal set of important feasts
      return this.getMinimalFeasts();
    }
  }
  
  /**
   * Process feast data and add to feasts object
   * @param {Array} feastData - Array of feast day objects
   * @param {Object} feasts - Map of feast days by month and day
   */
  processFeastData(feastData, feasts) {
    feastData.forEach(feast => {
      const month = parseInt(feast.feast_month);
      const day = parseInt(feast.feast_date);
      
      if (!feasts[month]) {
        feasts[month] = {};
      }
      
      // Check if this is a region-specific feast
      const isRegionalFeast = feast.feast_code.startsWith('IN ');
      const feastName = isRegionalFeast ? feast.feast_code.substring(3) : feast.feast_code;
      
      // Determine the rank based on feast_type
      let rank = 1; // Default to Optional Memorial
      let color = null;
      
      switch(feast.feast_type) {
        case 'Solemnity':
        case 'Solemnity-PrincipalPartron-Place':
          rank = 4;
          color = 'white';
          break;
        case 'Feast':
        case 'Feast-Lord':
          rank = 3;
          color = 'white';
          break;
        case 'Mem':
        case 'Mem-Mary':
          rank = 2; 
          color = null; // Will use the color of the season
          break;
        case 'OpMem':
          rank = 1;
          color = null;
          break;
        default:
          rank = 1;
          color = null;
      }
      
      // Special color cases
      if (feastName.toLowerCase().includes('martyr')) {
        color = 'red';
      }
      
      feasts[month][day] = {
        name: feastName,
        nameLocal: feast.feast_ta || '',  // Tamil translation
        rank,
        color: color || this.getDefaultColorByRank(rank),
        type: feast.feast_type,
        isRegionalFeast: isRegionalFeast
      };
    });
  }
  
  /**
   * Get the default liturgical color based on rank
   * @param {number} rank - Rank of the celebration
   * @returns {string|null} Default color or null
   */
  getDefaultColorByRank(rank) {
    switch (rank) {
      case 3: // Feast
      case 4: // Solemnity
      case 5: // Higher Solemnity
        return 'white';
      case 1: // Optional Memorial
      case 2: // Memorial
        return null; // Will use the color of the season
      default:
        return null;
    }
  }
  
  /**
   * Minimal set of important feasts in case the JSON fails to load
   * @returns {Object} Map of feast days by month and day
   */
  getMinimalFeasts() {
    const feasts = {};
    
    // Helper function to add a feast day
    const addFeast = (month, day, name, rank, color = null) => {
      if (!feasts[month]) {
        feasts[month] = {};
      }
      
      feasts[month][day] = {
        name,
        rank,
        color: color || this.getDefaultColorByRank(rank)
      };
    };
    
    // Add important solemnities
    addFeast(1, 1, 'Solemnity of Mary, Mother of God', 4, 'white');
    addFeast(3, 19, 'Solemnity of Saint Joseph', 4, 'white');
    addFeast(3, 25, 'Annunciation of the Lord', 4, 'white');
    addFeast(6, 24, 'Birth of Saint John the Baptist', 4, 'white');
    addFeast(6, 29, 'Saints Peter and Paul', 4, 'red');
    addFeast(8, 15, 'Assumption of the Blessed Virgin Mary', 4, 'white');
    addFeast(11, 1, 'All Saints', 4, 'white');
    addFeast(12, 8, 'Immaculate Conception', 4, 'white');
    addFeast(12, 25, 'Nativity of the Lord (Christmas)', 5, 'white');
    
    // Add India-specific feasts if region is India
    if (this.region === 'india') {
      addFeast(7, 3, 'Saint Thomas the Apostle', 4, 'white');
      addFeast(12, 3, 'Saint Francis Xavier', 4, 'white');
    }
    
    return feasts;
  }
  
  /**
   * Get feast day information for a specific month and day
   * @param {number} month - Month (1-12)
   * @param {number} day - Day of month
   * @returns {Object|null} Feast day information or null if no feast
   */
  getFeast(month, day) {
    if (this.feastDays[month] && this.feastDays[month][day]) {
      return this.feastDays[month][day];
    }
    return null;
  }
}

module.exports = FixedFeastDays;