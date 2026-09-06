export const errorHandler = (err, req, res, next) => {
    console.error(`[Global Error Handler] Error: ${err.message}`);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Only include stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
