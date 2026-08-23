require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_key_change_me_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  uploadPath: process.env.UPLOAD_PATH || 'uploads/'
};
