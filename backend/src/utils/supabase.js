import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = serviceRoleKey || anonKey || 'your-service-or-anon-key';

if (!supabaseUrl) {
    console.warn(
        '[supabase] SUPABASE_URL is not defined. Set it in backend/.env or database calls will fail.'
    );
}

if (!serviceRoleKey) {
    console.warn(
        '[SECURITY WARNING] SUPABASE_SERVICE_ROLE_KEY is not defined in backend environment. ' +
        'Backend is falling back to anon key. To work properly with Row Level Security (RLS) enabled, ' +
        'please provide SUPABASE_SERVICE_ROLE_KEY in backend/.env.'
    );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export const fetchSingleRecord = async (queryBuilder) => {
    if (!queryBuilder || typeof queryBuilder !== 'object') {
        throw new TypeError('Supabase query builder is missing.');
    }

    if (typeof queryBuilder.maybeSingle === 'function') {
        return queryBuilder.maybeSingle();
    }

    if (typeof queryBuilder.single === 'function') {
        return queryBuilder.single();
    }

    throw new TypeError('Supabase query builder does not support single-record lookups.');
};
