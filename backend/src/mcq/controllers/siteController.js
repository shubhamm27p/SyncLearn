const SiteSetting = require('../models/SiteSetting');

let cachedSiteStatus = null;
let cachedAt = 0;
const SITE_STATUS_TTL_MS = 5000;

const getSiteSetting = async () => SiteSetting.findOneAndUpdate(
  { key: 'site' },
  { $setOnInsert: { key: 'site', isOnline: true } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

exports.getStatus = async (_req, res, next) => {
  try {
    const setting = await getSiteSetting();
    res.json({ success: true, data: { isOnline: setting.isOnline } });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    if (typeof req.body.isOnline !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isOnline must be a boolean' });
    }

    const setting = await SiteSetting.findOneAndUpdate(
      { key: 'site' },
      { $set: { isOnline: req.body.isOnline } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    cachedSiteStatus = setting.isOnline;
    cachedAt = Date.now();

    return res.json({
      success: true,
      message: setting.isOnline ? 'Website is now online' : 'Website is now offline',
      data: { isOnline: setting.isOnline },
    });
  } catch (error) {
    next(error);
  }
};

exports.isSiteOnline = async () => {
  if (cachedSiteStatus !== null && Date.now() - cachedAt < SITE_STATUS_TTL_MS) {
    return cachedSiteStatus;
  }

  const setting = await getSiteSetting();
  cachedSiteStatus = setting.isOnline;
  cachedAt = Date.now();
  return setting.isOnline;
};