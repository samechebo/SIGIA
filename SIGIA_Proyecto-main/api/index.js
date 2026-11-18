// Entry point para Vercel Serverless Functions.
// Reusa el mismo Express app del backend local — sin duplicar lógica.
module.exports = require('../sigia/src/server');
