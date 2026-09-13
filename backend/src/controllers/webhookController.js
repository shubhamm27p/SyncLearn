import { Webhook } from 'svix';
import { supabase } from '../utils/supabase.js';

export const clerkWebhookHandler = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or environment variables");
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const payload = req.body;
  const headers = req.headers;

  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ success: false, message: 'Missing svix headers' });
  }

  let evt;
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name } = evt.data;
    const primaryEmail = email_addresses?.length > 0 ? email_addresses[0].email_address : null;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'New User';

    if (primaryEmail) {
      try {
        const { error } = await supabase.from('users').upsert({
          id: id,
          email: primaryEmail,
          username: primaryEmail,
          name: name,
          role: 'student', // Default role for new signups
          is_active: true
        });

        if (error) {
          console.error('Error inserting user to Supabase:', error);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        console.log(`Successfully synced user ${primaryEmail} to Supabase`);
      } catch (dbErr) {
        console.error('Exception syncing user to Supabase:', dbErr);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
};
