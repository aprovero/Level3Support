const SUPABASE_URL = 'https://jniallonfnybqialwbhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_a0PDvMXg3VCLEqkaORRTbw_IF6UgFOm';

// Initialize the Supabase client
// This expects window.supabase to be available from the CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
