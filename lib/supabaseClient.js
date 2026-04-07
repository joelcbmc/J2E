// Initialize Supabase client using CDN
const supabaseUrl = 'https://lpqicpquvwcodfjquerd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcWljcHF1dndjb2RmanF1ZXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDk5NTYsImV4cCI6MjA5MTEyNTk1Nn0.KHxe0pV19KKtRwbJclRbKm1YNWHkAR8THBvAVzCUcQU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

// Global variable to hold supabase client
window.supabaseClient = null;

// Wait for supabase CDN to load and create client
function initSupabase() {
  return new Promise((resolve) => {
    function check() {
      if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase initialized successfully');
        resolve(window.supabaseClient);
      } else {
        setTimeout(check, 50);
      }
    }
    check();
  });
}

// Export initialization promise for other scripts to use
window.supabaseReady = initSupabase();
