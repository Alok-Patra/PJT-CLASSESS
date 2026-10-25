const SUPABASE_URL = "https://wvuwhyjrfljaqkfhsxjn.supabase.co";
const SUPABASE_KEY = "sb_publishable_pQwjaXT9tqCEy-Zcxw193w_87U8ZXEd";



const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            // Keep users logged in between app launches.
            persistSession: true,

            // Refresh authentication tokens automatically.
            autoRefreshToken: true,

            // Support authentication and password-reset links.
            detectSessionInUrl: true
        }
    }
);

// Make the client available to existing project scripts.
window.supabaseClient = supabaseClient;

// Check whether a session can be restored.
supabaseClient.auth.getSession()
    .then(({ data, error }) => {
        if (error) {
            console.error(
                "Supabase session check failed:",
                error.message
            );
            return;
        }

        if (data.session) {
            console.log(
                "Supabase initialized. Existing session restored."
            );
        } else {
            console.log(
                "Supabase initialized. No active session."
            );
        }
    })
    .catch((error) => {
        console.error(
            "Supabase initialization check failed:",
            error
        );
    });

window.supabaseClient.auth.getSession().then(({ data, error }) => {
    console.log("PJT SESSION CHECK:", {
        sessionExists: Boolean(data?.session),
        userId: data?.session?.user?.id || null,
        error: error?.message || null
    });
});
