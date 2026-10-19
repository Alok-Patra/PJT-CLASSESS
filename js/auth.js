
/* =========================================
   PJT CLASSES
   AUTHENTICATION JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    /* =========================================
       STUDENT LOGIN - SUPABASE
    ========================================== */

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("studentId").value.trim();
            const password = document.getElementById("loginPassword").value;
            const message = document.getElementById("loginMessage");
            const studentIdError = document.getElementById("studentIdError");
            const passwordError = document.getElementById("loginPasswordError");

            studentIdError.textContent = "";
            passwordError.textContent = "";
            message.textContent = "";
            message.className = "form-message";

            if (!email) {
                studentIdError.textContent = "Please enter your registered email.";
                return;
            }

            if (!password) {
                passwordError.textContent = "Please enter your password.";
                return;
            }

            const button = loginForm.querySelector('button[type="submit"]');

            if (button) {
                button.disabled = true;
                button.textContent = "Logging in...";
            }

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                const { data: profile, error: profileError } = await supabaseClient
                    .from("profiles")
                    .select("role, student_id")
                    .eq("id", data.user.id)
                    .maybeSingle();

                if (profileError) throw profileError;

                if (!profile) {
                    await supabaseClient.auth.signOut();
                    throw new Error("Profile not found. Please contact your administrator.");
                }

                if (profile.role !== "student") {
                    await supabaseClient.auth.signOut();
                    throw new Error("This page is only for student accounts.");
                }

                sessionStorage.setItem("studentLoggedIn", "true");
                sessionStorage.setItem(
                    "studentId",
                    profile.student_id || data.user.id
                );

                message.textContent = "Login successful. Redirecting...";
                message.classList.add("success");

                window.location.href = "dashboard.html";

            } catch (error) {
                console.error("PJT login error:", error);
                message.textContent = error.message || "Login failed. Please try again.";
                message.classList.add("error");
            } finally {
                if (button) {
                    button.disabled = false;
                    button.textContent = "Login";
                }
            }
        });
    }

    /* =========================================
       PASSWORD SHOW / HIDE
    ========================================== */

    const passwordInput = document.getElementById("loginPassword");
    const passwordToggle = document.getElementById("loginPasswordToggle");

    if (passwordInput && passwordToggle) {
        passwordToggle.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                passwordToggle.setAttribute("aria-label", "Hide password");
            } else {
                passwordInput.type = "password";
                passwordToggle.setAttribute("aria-label", "Show password");
            }
        });
    }

    /* =========================================
       STUDENT REGISTRATION - SUPABASE
    ========================================== */

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const fullName = document.getElementById("fullName").value.trim();
            const mobileNumber = document.getElementById("mobileNumber").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const terms = document.getElementById("terms").checked;
            const message = document.getElementById("registerMessage");
            const button = document.getElementById("registerButton");

            message.textContent = "";
            message.className = "form-message";

            if (!fullName || !mobileNumber || !email || !password || !confirmPassword) {
                message.textContent = "Please fill in all required fields.";
                message.classList.add("error");
                return;
            }

            if (password !== confirmPassword) {
                message.textContent = "Passwords do not match.";
                message.classList.add("error");
                return;
            }

            if (password.length < 6) {
                message.textContent = "Password must be at least 6 characters.";
                message.classList.add("error");
                return;
            }

            if (!terms) {
                message.textContent = "Please accept the Terms and Conditions.";
                message.classList.add("error");
                return;
            }

            button.disabled = true;
            button.textContent = "Creating Account...";

            try {
                console.log("PJT registration: starting signup for", email);

                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        emailRedirectTo: "https://alok-patra.github.io/PJT-CLASSESS/student/login.html",
                        data: {
                            full_name: fullName,
                            mobile_number: mobileNumber
                        }
                    }
                });

                if (error) {
                    throw error;
                }

                console.log("PJT registration: signup response received", {
                    userCreated: Boolean(data?.user),
                    userId: data?.user?.id ?? null,
                    sessionCreated: Boolean(data?.session)
                });

                if (!data?.user) {
                    throw new Error("Supabase did not return a user. Please try again.");
                }

                message.textContent =
                    "Account created successfully! Please check your email to confirm your account before logging in.";
                message.classList.add("success");
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2500);

            } catch (error) {
                // DEBUGGING LINE: shows the real registration error in Console
                console.error("PJT registration error:", error);

                message.textContent =
                    error.message || "Registration failed. Please try again.";
                message.classList.add("error");

            } finally {
                button.disabled = false;
                button.textContent = "Create Account";
            }
        });
    }

});
