const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  customAlias: {  // New field for custom alias
    type: String,
    unique: true,
    sparse: true  // Allows empty values, so it can be optional
  },
  longUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,  // Optional, for link expiration
  clickCount: {
    type: Number,
    default: 0
  }
});

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;
