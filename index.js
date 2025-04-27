/**
 * Roman Catholic Liturgical Calendar API
 * Main entry point for the application
 */

// Export main classes and services
const LiturgicalCalendar = require('./src/services/LiturgicalCalendar');
const LiturgicalDataParser = require('./src/utils/LiturgicalDataParser');
const EasterCalculator = require('./src/utils/EasterCalculator');
const LiturgicalColors = require('./src/utils/LiturgicalColors');
const FixedFeastDays = require('./src/utils/FixedFeastDays');

// Server setup
const app = require('./server');

// Export as a module
module.exports = {
  // Core calendar functionality
  LiturgicalCalendar,
  LiturgicalDataParser,
  EasterCalculator,
  LiturgicalColors,
  FixedFeastDays,
  
  // Express app
  app
};

// If this file is run directly, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}