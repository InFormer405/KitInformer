import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Safety check for environment variables in client-side environment
// process.env is usually not available in the browser without a bundler.
// We fallback to empty strings to prevent the constructor from crashing.
const supabaseUrl = (typeof process !== 'undefined' && process.env) ? process.env.SUPABASE_URL : '';
const supabaseKey = (typeof process !== 'undefined' && process.env) ? process.env.SUPABASE_KEY : '';

let supabase;
try {
    if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
    } else {
        console.warn('Supabase credentials missing. Supabase functionality will be disabled.');
    }
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
}

/**
 * Queries the 'kits' table for products matching state and children status.
 * @param {string} state 
 * @param {boolean} children_status 
 * @returns {Promise<Array>}
 */
export async function getProductsByState(state, children_status) {
    if (!supabase) {
        console.warn('Supabase not initialized. Returning empty product list.');
        return [];
    }
    
    try {
        const { data, error } = await supabase
            .from('kits')
            .select('*')
            .eq('state', state)
            .eq('children_status', children_status);

        if (error) {
            console.error('Error fetching products by state:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Unexpected error in getProductsByState:', err);
        return [];
    }
}

/**
 * Queries the 'kits' table for a product matching a specific SKU.
 * @param {string} sku 
 * @returns {Promise<Object|null>}
 */
export async function getProductBySKU(sku) {
    if (!supabase) {
        console.warn('Supabase not initialized. Returning null.');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('kits')
            .select('*')
            .eq('sku', sku)
            .single();

        if (error) {
            console.error('Error fetching product by SKU:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Unexpected error in getProductBySKU:', err);
        return null;
    }
}
