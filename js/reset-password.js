
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmNewPassword");
    const submitButton = document.getElementById("resetSubmitButton");
    const message = document.getElementById("resetMessage");

    if (!form || !newPasswordInput || !confirmPasswordInput ||
        !submitButton || !message) {
        console.error("Password reset form elements are missing.");
        return;
    }

    const showMessage = (text, success = false) => {
        message.textContent = text;
        message.style.color = success ? "#15803d" : "#dc2626";
    };

    let recoverySessionReady = false;

    if (typeof supabaseClient === "undefined") {
        showMessage("Unable to connect to authentication. Please refresh.");
        submitButton.disabled = true;
        return;
    }

    // Verify the recovery session created by the email reset link.
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
            recoverySessionReady = true;
            showMessage("Reset link verified. Enter your new password.", true);
        }
    });

    // Check whether a session already exists.
    supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) {
            showMessage("Could not verify the reset link. Request a new one.");
            return;
        }

        if (data.session) {
            recoverySessionReady = true;
            showMessage("Enter your new password.", true);
        } else {
            showMessage("Please open this page from your password reset email.");
        }
    });

    // UPDATE PASSWORD BUTTON
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!recoverySessionReady) {
            showMessage("Your reset link is invalid or expired. Request a new one.");
            return;
        }

        if (password.length < 6) {
            showMessage("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Both passwords must match.");
            confirmPasswordInput.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Updating Password...";

        try {
            const { error } = await supabaseClient.auth.updateUser({
                password: password
            });

            if (error) throw error;

            showMessage(
                "Password updated successfully! Redirecting to login...",
                true
            );

            form.reset();
            recoverySessionReady = false;

            await supabaseClient.auth.signOut();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1800);

        } catch (error) {
            console.error("Password reset error:", error);

            showMessage(
                error.message || "Password update failed. Please try again."
            );

            submitButton.disabled = false;
            submitButton.textContent = "Update Password";
        }
    });
});
