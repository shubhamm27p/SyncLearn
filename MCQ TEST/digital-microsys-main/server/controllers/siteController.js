const SiteSetting = require('../models/SiteSetting');

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
  const setting = await getSiteSetting();
  return setting.isOnline;
};