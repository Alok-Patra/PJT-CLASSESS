
/* =========================================================
   PJT CLASSES — SUPABASE ADMIN AUTHENTICATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adminLoginForm");
    const adminId = document.getElementById("adminId");
    const password = document.getElementById("adminPassword");

    const adminIdError = document.getElementById("adminIdError");
    const passwordError = document.getElementById("adminPasswordError");
    const loginMessage = document.getElementById("adminLoginMessage");
    const loginButton = document.getElementById("adminLoginButton");
    const passwordToggle = document.getElementById("adminPasswordToggle");

    if (!form || !adminId || !password) {
        console.error("Admin login form elements are missing.");
        return;
    }

    function clearErrors() {
        if (adminIdError) adminIdError.textContent = "";
        if (passwordError) passwordError.textContent = "";

        if (loginMessage) {
            loginMessage.textContent = "";
            loginMessage.className = "login-message";
        }
    }

    function showMessage(message, type = "error") {
        if (!loginMessage) {
            alert(message);
            return;
        }

        loginMessage.textContent = message;
        loginMessage.className = `login-message show ${type}`;
    }

    // Show or hide password
    if (passwordToggle) {
        passwordToggle.addEventListener("click", () => {
            const show = password.type === "password";
            password.type = show ? "text" : "password";
            passwordToggle.textContent = show ? "Hide" : "Show";

            passwordToggle.setAttribute(
                "aria-label",
                show ? "Hide password" : "Show password"
            );
        });
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearErrors();

        const email = adminId.value.trim();
        const enteredPassword = password.value;

        if (!email) {
            if (adminIdError) {
                adminIdError.textContent = "Enter your registered admin email.";
            }
            return;
        }

        if (!enteredPassword) {
            if (passwordError) {
                passwordError.textContent = "Enter your password.";
            }
            return;
        }

        // Verify Supabase client is loaded
        const client = window.supabaseClient;

        if (!client) {
            showMessage(
                "Supabase is not initialized. Check the script order in login.html."
            );
            console.error("window.supabaseClient is missing.");
            return;
        }

        if (loginButton) {
            loginButton.disabled = true;
            loginButton.classList.add("loading");
        }

        try {
            // Authenticate with the real Supabase account
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password: enteredPassword
            });

            if (error) throw error;

            // Verify this account has the admin role
            const { data: profile, error: profileError } = await client
                .from("profiles")
                .select("id, full_name, role")
                .eq("id", data.user.id)
                .maybeSingle();

            if (profileError) {
                throw new Error(
                    "Login succeeded, but admin role verification failed: " +
                    profileError.message
                );
            }

            if (!profile || profile.role !== "admin") {
                await client.auth.signOut();

                showMessage(
                    "This account does not have the admin role in public.profiles."
                );
                return;
            }

            // Supabase stores the actual authentication session.
            sessionStorage.setItem("pjtAdminLoggedIn", "true");
            sessionStorage.setItem("pjtAdminId", data.user.id);

            showMessage("Login successful. Opening admin panel...", "success");

            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Admin login error:", error);

            if (error.message === "Invalid login credentials") {
                showMessage(
                    "Incorrect email or password. Use the registered Supabase email and its password."
                );
            } else {
                showMessage(error.message || "Unable to log in. Please try again.");
            }
        } finally {
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.classList.remove("loading");
            }
        }
    });
});
