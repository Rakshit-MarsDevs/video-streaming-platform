const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Create rate limiter with Redis store
const createRateLimiter = (redisClient, options = {}) => {
  const defaultOptions = {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    ...options
  };

  return rateLimit(defaultOptions);
};

// Video metadata API rate limiter
const videoMetadataLimiter = (redisClient) => {
  return createRateLimiter(redisClient, {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
    message: {
      success: false,
      message: 'Too many video metadata requests, please try again later.'
    }
  });
};

// Video upload rate limiter
const videoUploadLimiter = (redisClient) => {
  return createRateLimiter(redisClient, {
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 uploads per minute per IP
    message: {
      success: false,
      message: 'Too many upload requests, please try again later.'
    }
  });
};

// Auth rate limiter
const authLimiter = (redisClient) => {
  return createRateLimiter(redisClient, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes per IP
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.'
    }
  });
};

module.exports = {
  createRateLimiter,
  videoMetadataLimiter,
  videoUploadLimiter,
  authLimiter
};
