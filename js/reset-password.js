
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("resetPasswordForm");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmNewPassword");
    const submitButton = document.getElementById("resetSubmitButton");
    const message = document.getElementById("resetMessage");

    const showMessage = (text, success = false) => {
        message.textContent = text;
        message.style.color = success ? "#15803d" : "#dc2626";
    };

    if (typeof supabaseClient === "undefined") {
        showMessage("Authentication could not load. Please refresh the page.");
        submitButton.disabled = true;
        return;
    }

    // Listen for a valid password-recovery session from Supabase.
    let recoverySessionReady = false;

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
        (event, session) => {
            if (event === "PASSWORD_RECOVERY" && session) {
                recoverySessionReady = true;
                showMessage("Enter and confirm your new password.", true);
            }
        }
    );

    // Also check for a session already established from the email link.
    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError) {
        showMessage("Could not verify your reset session. Request a new link.");
    } else if (sessionData.session) {
        recoverySessionReady = true;
        showMessage("Enter and confirm your new password.", true);
    } else {
        showMessage(
            "Open this page using the password-reset link sent to your email."
        );
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!recoverySessionReady) {
            showMessage(
                "Your reset session is not valid. Please request a new reset link."
            );
            return;
        }

        if (newPassword.length < 6) {
            showMessage("Your password must contain at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("The passwords do not match.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Updating Password...";

        try {
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            showMessage(
                "Password updated successfully! You can now log in with your new password.",
                true
            );

            form.reset();
            recoverySessionReady = false;

            await supabaseClient.auth.signOut();

            submitButton.textContent = "Password Updated";
            submitButton.disabled = true;

        } catch (error) {
            console.error("Password update error:", error);
            showMessage(
                error.message || "Could not update your password. Please request a new link."
            );
            submitButton.disabled = false;
            submitButton.textContent = "Update Password";
        }
    });

    // Clean up the auth-state listener when the page is unloaded.
    window.addEventListener("pagehide", () => {
        listener.subscription.unsubscribe();
    });
});
