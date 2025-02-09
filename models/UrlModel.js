const mongoose = require('mongoose');
const UrlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true, // Allow null or undefined customAlias
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  expirationDate: { 
    type: Date,
    default: null,
  }, // Optional expiration date
});

module.exports = mongoose.model('URL', UrlSchema);
