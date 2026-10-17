/* =========================================
   PJT CLASSES
   AUTHENTICATION JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    /* =========================================
       STUDENT LOGIN
    ========================================== */

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const studentId =
                document.getElementById("studentId").value.trim();

            const password =
                document.getElementById("loginPassword").value.trim();

            const message =
                document.getElementById("loginMessage");

            const studentIdError =
                document.getElementById("studentIdError");

            const passwordError =
                document.getElementById("loginPasswordError");


            /* Clear previous errors */

            studentIdError.textContent = "";
            passwordError.textContent = "";
            message.textContent = "";
            message.className = "form-message";


            /* =================================
               VALIDATION
            ================================= */

            if (!studentId) {

                studentIdError.textContent =
                    "Please enter your Student ID.";

                return;
            }


            if (!password) {

                passwordError.textContent =
                    "Please enter your password.";

                return;
            }


            /* =================================
               DEMO LOGIN
            ================================= */

            const demoStudentId = "STU-2026-001";
            const demoPassword = "123456";


            if (
                studentId === demoStudentId &&
                password === demoPassword
            ) {

                /* Save temporary login state */

                sessionStorage.setItem(
                    "studentLoggedIn",
                    "true"
                );

                sessionStorage.setItem(
                    "studentId",
                    studentId
                );


                /* Success message */

                message.textContent =
                    "Login successful. Redirecting...";

                message.classList.add("success");


                /* Redirect */

                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 500);


            } else {

                message.textContent =
                    "Invalid Student ID or Password.";

                message.classList.add("error");

            }

        });

    }


    /* =========================================
       PASSWORD SHOW / HIDE
    ========================================== */

    const passwordInput =
        document.getElementById("loginPassword");

    const passwordToggle =
        document.getElementById("loginPasswordToggle");


    if (passwordInput && passwordToggle) {

        passwordToggle.addEventListener("click", () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                passwordInput.type = "password";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        });

    }


    /* =========================================
       STUDENT REGISTRATION
    ========================================== */


    /* =========================================
       STUDENT REGISTRATION
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

                message.textContent = "Account created! Please check your email to confirm your account before logging in.";
                message.classList.add("success");
                registerForm.reset();

            } catch (error) {
                message.textContent = error.message || "Registration failed. Please try again.";
                message.classList.add("error");
            } finally {
                button.disabled = false;
                button.textContent = "Create Account";
            }

        });

    }


});