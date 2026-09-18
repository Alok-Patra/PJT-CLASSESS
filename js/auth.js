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

    if (registerForm) {

        registerForm.addEventListener("submit", (event) => {

            event.preventDefault();

            alert(
                "Registration form submitted successfully.\n\nBackend registration will be connected later."
            );

        });

    }

});