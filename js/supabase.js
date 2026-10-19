const SUPABASE_URL = "https://wvuwhyjrfljaqkfhsxjn.supabase.co";
const SUPABASE_KEY = "sb_publishable_pQwjaXT9tqCEy-Zcxw193w_87U8ZXEd";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
window.supabaseClient = supabaseClient;
console.log("Supabase client:", supabaseClient);

supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
        console.error("Supabase connection error:", error.message);
    } else {
        console.log("Supabase client initialized successfully.");
    }
});