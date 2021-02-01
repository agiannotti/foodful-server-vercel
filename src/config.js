module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://agiannotti@localhost/foodful_DB',
  API_TOKEN: process.env.API_TOKEN || 'placeholder-token',
};
