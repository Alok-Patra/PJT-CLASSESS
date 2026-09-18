/* =========================================================
   PJT CLASSES
   ADMIN AUTHENTICATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("adminLoginForm");

    const adminId = document.getElementById("adminId");
    const password = document.getElementById("adminPassword");

    const adminIdError = document.getElementById("adminIdError");
    const passwordError = document.getElementById("adminPasswordError");

    const loginMessage = document.getElementById("adminLoginMessage");

    const loginButton = document.getElementById("adminLoginButton");

    const passwordToggle =
        document.getElementById("adminPasswordToggle");


    /* =====================================================
       DEMO ADMIN CREDENTIALS
       Replace with backend authentication later
    ===================================================== */

    const DEMO_ADMIN_ID = "ADMIN-001";
    const DEMO_PASSWORD = "123456";


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    if (passwordToggle) {

        passwordToggle.addEventListener("click", () => {

            if (password.type === "password") {

                password.type = "text";

                passwordToggle.textContent = "Hide";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                password.type = "password";

                passwordToggle.textContent = "Show";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        });

    }


    /* =====================================================
       CLEAR ERRORS
    ===================================================== */

    function clearErrors() {

        adminIdError.textContent = "";
        passwordError.textContent = "";

        loginMessage.textContent = "";

        loginMessage.className = "login-message";
    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(message, type) {

        loginMessage.textContent = message;

        loginMessage.className =
            `login-message show ${type}`;
    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        clearErrors();

        const enteredId = adminId.value.trim();
        const enteredPassword = password.value.trim();

        let valid = true;


        /* ADMIN ID VALIDATION */

        if (!enteredId) {

            adminIdError.textContent =
                "Please enter your Admin ID.";

            valid = false;
        }


        /* PASSWORD VALIDATION */

        if (!enteredPassword) {

            passwordError.textContent =
                "Please enter your password.";

            valid = false;

        } else if (enteredPassword.length < 6) {

            passwordError.textContent =
                "Password must contain at least 6 characters.";

            valid = false;
        }


        if (!valid) {
            return;
        }


        /* =================================================
           DEMO LOGIN
        ================================================= */

        if (
            enteredId === DEMO_ADMIN_ID &&
            enteredPassword === DEMO_PASSWORD
        ) {

            loginButton.classList.add("loading");

            showMessage(
                "Login successful. Opening admin panel...",
                "success"
            );


            /* Demo session */

            sessionStorage.setItem(
                "pjtAdminLoggedIn",
                "true"
            );

            sessionStorage.setItem(
                "pjtAdminId",
                enteredId
            );


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);


        } else {

            showMessage(
                "Invalid Admin ID or password.",
                "error"
            );

        }

    });

});