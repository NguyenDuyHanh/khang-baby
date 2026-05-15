// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.status) {
    return res.status(err.status).json({
      ok: false,
      message: err.message,
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      ok: false,
      message: 'Duplicate entry',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      ok: false,
      message: 'Invalid reference',
    });
  }

  res.status(500).json({
    ok: false,
    message: 'Internal server error',
  });
}

module.exports = errorHandler;
