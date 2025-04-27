/**
 * LiturgicalColors class
 * Determines the liturgical color for a specific day
 */
class LiturgicalColors {
    /**
     * Get liturgical color for a specific day
     * @param {DateTime} dt - Luxon DateTime object
     * @param {Object} season - Current liturgical season
     * @param {Object|null} feastDay - Feast day information (if applicable)
     * @returns {string} Liturgical color
     */
    getColor(dt, season, feastDay) {
      // If it's a feast day with a specified color, use that
      if (feastDay && feastDay.color) {
        return feastDay.color;
      }
      
      // Otherwise, determine color based on the liturgical season
      switch (season.name) {
        case 'Advent':
          return 'violet';
        case 'Christmas':
          return 'white';
        case 'Lent':
          return 'violet';
        case 'Easter':
          return 'white';
        case 'Ordinary Time (Pre-Lent)':
        case 'Ordinary Time (Post-Pentecost)':
        case 'Ordinary Time':
          return 'green';
        default:
          return 'green';
      }
    }
  }
  
  module.exports = LiturgicalColors;