import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Initialize the Supabase JS client using environment variables
// Note: In a client-side module, process.env is usually not available directly 
// unless provided by a bundler. For Replit, these are typically handled by 
// the server injecting them or using a configuration.
// Since this is a client-side module as requested, we'll assume the environment 
// provides these values or they are shimmed.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Queries the 'kits' table for products matching state and children status.
 * @param {string} state 
 * @param {boolean} children_status 
 * @returns {Promise<Array>}
 */
export async function getProductsByState(state, children_status) {
    const { data, error } = await supabase
        .from('kits')
        .select('*')
        .eq('state', state)
        .eq('children_status', children_status);

    if (error) {
        console.error('Error fetching products by state:', error);
        return [];
    }
    return data;
}

/**
 * Queries the 'kits' table for a product matching a specific SKU.
 * @param {string} sku 
 * @returns {Promise<Object|null>}
 */
export async function getProductBySKU(sku) {
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
}
