// Global error handler (must have 4 params)
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);
  const status  = err.status || 500;
  const message = err.message || 'Something went wrong. Please try again.';
  return res.status(status).json({ ok: false, message });
}

module.exports = errorHandler;
