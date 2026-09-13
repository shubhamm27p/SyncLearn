const SiteSetting = require('../models/SiteSetting');
const config = require('../config');
const supabaseAdmin = config.storageMode === 'mongo'
  ? null
  : require('../config/supabase').supabaseAdmin;

const getSiteSetting = async () => SiteSetting.findOneAndUpdate(
  { key: 'site' },
  { $setOnInsert: { key: 'site', isOnline: true } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

const getSupabaseSiteSetting = async () => {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('is_online')
    .eq('key', 'site')
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('site_settings')
    .insert({ key: 'site', is_online: true })
    .select('is_online')
    .single();
  if (insertError) throw insertError;
  return inserted;
};

exports.getStatus = async (_req, res, next) => {
  try {
    if (config.storageMode === 'supabase') {
      const setting = await getSupabaseSiteSetting();
      return res.json({ success: true, data: { isOnline: setting.is_online } });
    }
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

    if (config.storageMode === 'supabase') {
      const { data: setting, error } = await supabaseAdmin
        .from('site_settings')
        .upsert({ key: 'site', is_online: req.body.isOnline, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select('is_online')
        .single();
      if (error) throw error;
      return res.json({
        success: true,
        message: setting.is_online ? 'Website is now online' : 'Website is now offline',
        data: { isOnline: setting.is_online },
      });
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
  if (config.storageMode === 'supabase') {
    const setting = await getSupabaseSiteSetting();
    return setting.is_online;
  }
  const setting = await getSiteSetting();
  return setting.isOnline;
};