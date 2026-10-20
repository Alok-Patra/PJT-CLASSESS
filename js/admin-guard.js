
/* =====================================================
   PJT CLASSES — ADMIN PAGE ACCESS GUARD
   Protects admin pages using the Supabase session
   and public.profiles role.
===================================================== */

(async function protectAdminPage() {
    const client = window.supabaseClient;

    function redirectToLogin() {
        window.location.replace("login.html");
    }

    if (!client) {
        console.error("Admin guard: Supabase client is not initialized.");
        document.body.innerHTML =
            "<p>Unable to verify access. Please reload this page.</p>";
        return;
    }

    try {
        const { data: sessionData, error: sessionError } =
            await client.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData?.session;

        if (!session) {
            redirectToLogin();
            return;
        }

        const { data: profile, error: profileError } = await client
            .from("profiles")
            .select("id, role")
            .eq("id", session.user.id)
            .maybeSingle();

        if (profileError) {
            console.error("Admin role verification failed:", profileError.message);
            document.body.innerHTML =
                "<p>Unable to verify admin permissions. Please try again.</p>";
            return;
        }

        if (
            !profile ||
            String(profile.role || "").trim().toLowerCase() !== "admin"
        ) {
            await client.auth.signOut();
            redirectToLogin();
            return;
        }

        // The authenticated account is an admin.
        document.documentElement.dataset.adminVerified = "true";
        document.dispatchEvent(new Event("pjtAdminVerified"));

    } catch (error) {
        console.error("Admin guard error:", error.message || error);

        document.body.innerHTML =
            "<p>Access verification failed. Please reload or contact the administrator.</p>";
    }
})();
