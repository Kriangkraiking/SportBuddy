// Centralized error handler
// Note: res.statusCode can already be set to a "success" code (e.g. 201) if
// res.status(201) was called before the error was thrown (e.g. inside the
// same res.status(201).json({ ... }) expression). Only trust res.statusCode
// when it's already an error code (>=400); otherwise default to 500.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorHandler;
