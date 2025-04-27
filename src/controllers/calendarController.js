const LiturgicalCalendar = require('../services/LiturgicalCalendar');

/**
 * Get liturgical information for today
 */
exports.getToday = (req, res) => {
  try {
    const today = new Date();
    const calendar = new LiturgicalCalendar();
    const liturgicalDay = calendar.getLiturgicalDayInfo(today);
    
    res.json({
      date: today.toISOString().split('T')[0],
      liturgicalDay
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get liturgical information for a specific date
 */
exports.getByDate = (req, res) => {
  try {
    const dateStr = req.params.date; // Expected format: YYYY-MM-DD
    const date = new Date(dateStr);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }
    
    const calendar = new LiturgicalCalendar();
    const liturgicalDay = calendar.getLiturgicalDayInfo(date);
    
    res.json({
      date: dateStr,
      liturgicalDay
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get liturgical information for a date range
 */
exports.getDateRange = (req, res) => {
  try {
    const startDateStr = req.params.startDate; // Expected format: YYYY-MM-DD
    const endDateStr = req.params.endDate; // Expected format: YYYY-MM-DD
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }
    
    // Check that start date is before end date
    if (startDate > endDate) {
      return res.status(400).json({ error: 'Start date must be before end date.' });
    }
    
    const calendar = new LiturgicalCalendar();
    const liturgicalDays = [];
    
    // Loop through each day in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const liturgicalDay = calendar.getLiturgicalDayInfo(new Date(currentDate));
      liturgicalDays.push({
        date: currentDate.toISOString().split('T')[0],
        liturgicalDay
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({
      startDate: startDateStr,
      endDate: endDateStr,
      liturgicalDays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get liturgical seasons for a specific year
 */
exports.getSeasons = (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    // Validate year
    if (isNaN(year) || year < 1970 || year > 2100) {
      return res.status(400).json({ error: 'Invalid year. Please provide a year between 1970 and 2100.' });
    }
    
    const calendar = new LiturgicalCalendar();
    const seasons = calendar.getLiturgicalSeasons(year);
    
    res.json({
      year,
      seasons
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get feast days for a specific year
 */
exports.getFeastDays = (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    // Validate year
    if (isNaN(year) || year < 1970 || year > 2100) {
      return res.status(400).json({ error: 'Invalid year. Please provide a year between 1970 and 2100.' });
    }
    
    const calendar = new LiturgicalCalendar();
    const feastDays = calendar.getFeastDays(year);
    
    res.json({
      year,
      feastDays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all liturgical data for a specific year
 */
exports.getFullYear = (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    // Validate year
    if (isNaN(year) || year < 1970 || year > 2100) {
      return res.status(400).json({ error: 'Invalid year. Please provide a year between 1970 and 2100.' });
    }
    
    const calendar = new LiturgicalCalendar();
    const fullYearData = calendar.getFullYearData(year);
    
    res.json({
      year,
      liturgicalCalendar: fullYearData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};