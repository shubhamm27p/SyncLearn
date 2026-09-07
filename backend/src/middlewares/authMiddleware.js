import { supabase } from '../utils/supabase.js';
import { getSiteOnlineStatus } from '../controllers/usersController.js';

export const authMiddleware = async (req, res, next) => {
    try {
        let token;
        
        // Check Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } 
        // Fallback to query or body for backwards compatibility
        else if (req.query?.token) {
            token = req.query.token;
        } else if (req.body?.token) {
            token = req.body.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        // Verify the token against Supabase users table
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, username, email, role, is_active')
            .eq('token', token)
            .maybeSingle();

        if (error || !user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        if (user.is_active === false) {
            return res.status(403).json({ message: "Account is disabled" });
        }

        if (user.role !== 'admin' && !(await getSiteOnlineStatus())) {
            return res.status(503).json({
                message: 'The website is currently offline. Please try again later.',
                code: 'SITE_OFFLINE'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        return res.status(500).json({ message: 'Internal Server Error during authentication' });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (!req.user || !['admin', 'trainer'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Administrator access required' });
    }
    next();
};
