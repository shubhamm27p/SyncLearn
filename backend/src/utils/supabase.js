import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
