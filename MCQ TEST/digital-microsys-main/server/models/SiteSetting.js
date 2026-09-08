const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'site' },
  isOnline: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);