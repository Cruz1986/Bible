const { DateTime } = require('luxon');

/**
 * EasterCalculator class
 * Calculates the date of Easter for a given year using the Meeus/Jones/Butcher algorithm
 */
class EasterCalculator {
  /**
   * Calculate the date of Easter for a given year
   * @param {number} year - Year
   * @returns {DateTime} Luxon DateTime object representing Easter Sunday
   */
  getEasterDate(year) {
    // Meeus/Jones/Butcher algorithm
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return DateTime.local(year, month, day);
  }
}

module.exports = EasterCalculator;