const redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    redisClient = redis.createClient(redisConfig);

    redisClient.on('connect', () => {
      logger.info('✅ Redis connection established successfully');
    });

    redisClient.on('error', (error) => {
      logger.error('❌ Redis connection error:', error);
    });

    redisClient.on('end', () => {
      logger.warn('⚠️ Redis connection ended');
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    logger.error('❌ Unable to connect to Redis:', error);
    throw error;
  }
};

// Redis utility functions
const redisUtils = {
  // Set key with expiration
  setEx: async (key, value, expireInSeconds = 3600) => {
    try {
      await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis setEx error:', error);
    }
  },

  // Get key
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  },

  // Delete key
  del: async (key) => {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Redis del error:', error);
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  },

  // Increment counter
  incr: async (key) => {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Redis incr error:', error);
      return 0;
    }
  },

  // Set expiration
  expire: async (key, seconds) => {
    try {
      await redisClient.expire(key, seconds);
    } catch (error) {
      logger.error('Redis expire error:', error);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed through app termination');
  }
});

module.exports = { connectRedis, redisClient, redisUtils };