const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const calendarViewController = require('../controllers/calendarViewController');

// API Endpoints
// Get liturgical information for today
router.get('/today', calendarController.getToday);

// Get liturgical information for a specific date
router.get('/date/:date', calendarController.getByDate);

// Get liturgical information for a date range
router.get('/range/:startDate/:endDate', calendarController.getDateRange);

// Get liturgical seasons for a specific year
router.get('/season/:year', calendarController.getSeasons);

// Get feast days for a specific year
router.get('/feast/:year', calendarController.getFeastDays);

// Get all liturgical data for a specific year
router.get('/year/:year', calendarController.getFullYear);

// HTML View Endpoints
// Display calendar for current month
router.get('/view', calendarViewController.getCurrentMonthView);

// Display calendar for a specific month and year
router.get('/view/:year/:month', calendarViewController.getMonthView);

// Display calendar for an entire year
router.get('/view/:year', calendarViewController.getYearView);

module.exports = router;