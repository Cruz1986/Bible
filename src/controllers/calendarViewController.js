const { DateTime } = require('luxon');
const LiturgicalCalendar = require('../services/LiturgicalCalendar');

/**
 * Calendar View Controller
 * Handles rendering HTML calendar views
 */

/**
 * Display calendar for the current month
 */
// In calendarViewController.js
exports.getCurrentMonthView = (req, res) => {
  try {
    const today = DateTime.now();
    const year = today.year;
    const month = today.month;
    
    // Check for region parameter
    const region = req.query.region || 'general';
    
    return this.renderMonthView(res, year, month, true, region);
  } catch (error) {
    console.error('Error rendering current month view:', error);
    res.status(500).render('error', { 
      error: error.message,
      title: 'Error'
    });
  }
};

/**
 * Display calendar for a specific month and year
 */
exports.getMonthView = (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    // Check for region parameter
    const region = req.query.region || 'general';
    
    // Validate year and month
    if (isNaN(year) || isNaN(month) || year < 1970 || year > 2100 || month < 1 || month > 12) {
      return res.status(400).render('error', { 
        error: 'Invalid year or month. Year should be between 1970 and 2100, and month between 1 and 12.',
        title: 'Invalid Request'
      });
    }
    
    return this.renderMonthView(res, year, month, false, region);
  } catch (error) {
    console.error('Error rendering month view:', error);
    res.status(500).render('error', { 
      error: error.message,
      title: 'Error'
    });
  }
};

/**
 * Display calendar for an entire year
 */
exports.getYearView = (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    // Check for region parameter
    const region = req.query.region || 'general';
    
    // Validate year
    if (isNaN(year) || year < 1970 || year > 2100) {
      return res.status(400).render('error', { 
        error: 'Invalid year. Year should be between 1970 and 2100.',
        title: 'Invalid Request'
      });
    }
    
    const calendar = new LiturgicalCalendar(region);
    const monthsData = [];
    
    // Generate data for all 12 months
    for (let month = 1; month <= 12; month++) {
      monthsData.push(this.generateMonthData(year, month, calendar));
    }
    
    // Get liturgical seasons for the year
    const seasons = calendar.getLiturgicalSeasons(year);
    
    // Get feast days for the year
    const feastDays = calendar.getFeastDays(year);
    
    res.render('yearCalendar', {
      title: `Liturgical Calendar ${year}`,
      year,
      monthsData,
      seasons,
      feastDays,
      currentYear: DateTime.now().year,
      monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      region
    });
  } catch (error) {
    console.error('Error rendering year view:', error);
    res.status(500).render('error', { 
      error: error.message,
      title: 'Error'
    });
  }
};

/**
 * Helper method to render a month view
 */
exports.renderMonthView = (res, year, month, isCurrentMonth, region = 'general') => {
  const calendar = new LiturgicalCalendar(region);
  const monthData = this.generateMonthData(year, month, calendar);
  
  // Get data for previous and next months (for navigation)
  let prevMonth, prevYear, nextMonth, nextYear;
  
  if (month === 1) {
    prevMonth = 12;
    prevYear = year - 1;
  } else {
    prevMonth = month - 1;
    prevYear = year;
  }
  
  if (month === 12) {
    nextMonth = 1;
    nextYear = year + 1;
  } else {
    nextMonth = month + 1;
    nextYear = year;
  }
  
  res.render('monthCalendar', {
    title: `Liturgical Calendar - ${monthData.monthName} ${year}`,
    year,
    month,
    monthName: monthData.monthName,
    calendarGrid: monthData.calendarGrid,
    prevMonth,
    prevYear,
    nextMonth,
    nextYear,
    isCurrentMonth,
    currentDate: isCurrentMonth ? DateTime.now().day : null,
    region
  });
};

/**
 * Generate calendar data for a specific month
 */
exports.generateMonthData = (year, month, calendarInstance) => {
  const firstDay = DateTime.local(year, month, 1);
  const lastDay = DateTime.local(year, month, firstDay.daysInMonth);
  
  // Determine the first cell (may be in the previous month)
  let startDate = firstDay;
  if (firstDay.weekday !== 0) { // If not Sunday
    startDate = firstDay.minus({ days: firstDay.weekday });
  }
  
  // Determine the last cell (may be in the next month)
  let endDate = lastDay;
  if (lastDay.weekday !== 6) { // If not Saturday
    endDate = lastDay.plus({ days: 6 - lastDay.weekday });
  }
  
  // Generate calendar grid (6 rows max)
  const calendarGrid = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const week = [];
    
    // Add 7 days (one week)
    for (let i = 0; i < 7; i++) {
      const date = currentDate;
      const liturgicalInfo = calendarInstance.getLiturgicalDayInfo(date.toJSDate());
      
      week.push({
        date: date.day,
        fullDate: date.toFormat('yyyy-MM-dd'),
        month: date.month,
        year: date.year,
        isCurrentMonth: date.month === month,
        liturgicalInfo
      });
      
      currentDate = currentDate.plus({ days: 1 });
    }
    
    calendarGrid.push(week);
  }
  
  return {
    monthName: firstDay.toFormat('MMMM'),
    calendarGrid
  };
};