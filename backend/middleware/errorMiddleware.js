const errorMiddleware = (err, req, res, next) => {
  console.error("API Error:", err);

  // ------------------------------------------
  // Multer errors
  // ------------------------------------------

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }

  // ------------------------------------------
  // Mongoose validation error
  // ------------------------------------------

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
  }

  // ------------------------------------------
  // Mongoose cast error
  // ------------------------------------------

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID or data format",
    });
  }

  // ------------------------------------------
  // Duplicate key error
  // ------------------------------------------

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    return res.status(409).json({
      success: false,
      message: field
        ? `${field} already exists`
        : "Duplicate data",
    });
  }

  // ------------------------------------------
  // JWT errors
  // ------------------------------------------

  if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // ------------------------------------------
  // Default server error
  // ------------------------------------------

  return res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;