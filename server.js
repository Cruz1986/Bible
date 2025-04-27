const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const calendarRoutes = require('./src/routes/calendarRoutes');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Setup view engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/calendar', calendarRoutes);
app.use('/calendar', calendarRoutes);

// Root route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Roman Catholic Liturgical Calendar',
    description: 'Access liturgical calendar data through API or visual calendar',
    year: new Date().getFullYear()
  });
});

// Documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    apiEndpoints: {
      '/api/calendar/today': 'Get liturgical information for today',
      '/api/calendar/date/:date': 'Get liturgical information for a specific date (YYYY-MM-DD)',
      '/api/calendar/range/:startDate/:endDate': 'Get liturgical information for a date range',
      '/api/calendar/season/:year': 'Get liturgical seasons for a specific year',
      '/api/calendar/feast/:year': 'Get feast days for a specific year',
      '/api/calendar/year/:year': 'Get complete calendar for a year'
    },
    viewEndpoints: {
      '/calendar/view': 'View current month calendar',
      '/calendar/view/:year/:month': 'View calendar for a specific month and year',
      '/calendar/view/:year': 'View calendar for an entire year'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;