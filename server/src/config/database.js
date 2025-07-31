const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Database configuration
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tunisian_postal_bank',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? 
    (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true // Soft deletes
  }
});

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connection established successfully');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('📊 Database models synchronized');
    }
    
    return sequelize;
  } catch (error) {
    logger.error('❌ Unable to connect to PostgreSQL database:', error);
    throw error;
  }
};

module.exports = connectDB;