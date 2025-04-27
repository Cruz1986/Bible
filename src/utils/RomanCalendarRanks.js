// RomanCalendarRanks.js

class RomanCalendarRanks {
    static getRank(dayCode) {
      const RomanCalendarRanks = {
        'EW01-0Sun': 1, // Easter Sunday
        'LW06-6Sat': 1.1,
        'LW06-5Fri': 1.1,
        'LW06-4Thu': 1.1,
  
        'Nativity of the Lord': 2,
        'Epiphany': 2,
        'Ascension of the Lord': 2,
        'Pentecost': 2,
  
        'AW': 2.1,
        'LW': 2.1,
        'EW': 2.1,
        'Ash Wednesday': 2.2,
        'Holy Monday': 2.3,
        'Holy Tuesday': 2.3,
        'Holy Wednesday': 2.3,
        'Holy Thursday': 2.3,
        'Easter Octave': 2.4,
  
        'Solemnity': 3.1,
        'All Souls': 3.2,
  
        'Feast-Lord': 5,
        'OW': 6,
        'CW': 6,
        'Feast': 7,
        'Mem': 10.2,
        'OpMem': 12
      };
  
      for (const prefix in RomanCalendarRanks) {
        if (dayCode.startsWith(prefix) || dayCode === prefix) {
          return RomanCalendarRanks[prefix];
        }
      }
      console.error('Invalid Feast Code:', dayCode);
      return 99; // Lowest rank if no match
    }
  }
  
  module.exports = RomanCalendarRanks;
  