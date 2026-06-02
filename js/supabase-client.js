const SUPABASE_URL = 'https://jniallonfnybqialwbhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_a0PDvMXg3VCLEqkaORRTbw_IF6UgFOm';

// Replace the CDN library reference with the initialized client instance
// so all scripts can access it via window.supabase / supabase
const { createClient } = window.supabase;
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
