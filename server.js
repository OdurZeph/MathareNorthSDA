require('dotenv').config();

const app  = require('./src/app');
const { ping } = require('./src/config/db');
const { logMailStatus } = require('./src/services/mail.service');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`\n Server running → http://localhost:${PORT}`);
  console.log(` Environment   : ${process.env.NODE_ENV || 'development'}`);
  console.log(` Frontend      : http://localhost:${PORT}/index.html\n`);

  logMailStatus();

  // DB ping — informational only, never blocks startup
  try {
    await ping();
    console.log('  MySQL connected successfully');
  } catch (err) {
    console.warn('   MySQL unavailable:', err.message);
    console.warn('    Forms will still send email — DB save will be skipped until MySQL starts.\n');
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection (server stays up):', reason);
});

module.exports = server;
