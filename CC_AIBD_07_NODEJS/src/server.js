const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/config');

// Connect Database
connectDB();

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
