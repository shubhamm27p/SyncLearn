import express from 'express';
import { clerkWebhookHandler } from '../controllers/webhookController.js';

const router = express.Router();

// Clerk webhook requires raw body for signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhookHandler);

export default router;
