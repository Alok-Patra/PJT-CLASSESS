/* =========================================
   PJT CLASSES
   SETTINGS JAVASCRIPT
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const logoutBtn =
    document.getElementById("logoutBtn");

const pageLogoutBtn =
    document.getElementById("pageLogoutBtn");

const notificationBtn =
    document.getElementById("notificationBtn");

const passwordForm =
    document.getElementById("passwordForm");

const passwordMessage =
    document.getElementById("passwordMessage");

const settingsSearch =
    document.getElementById("settingsSearch");

const feeNotifications =
    document.getElementById("feeNotifications");

const announcementNotifications =
    document.getElementById("announcementNotifications");


/* =========================================
   MOBILE SIDEBAR
========================================= */

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        sidebar.classList.toggle("open");

        sidebarOverlay.classList.toggle("show");

    });

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener("click", () => {

        sidebar.classList.remove("open");

        sidebarOverlay.classList.remove("show");

    });

}


/* =========================================
   NOTIFICATION BUTTON
========================================= */

if (notificationBtn) {

    notificationBtn.addEventListener("click", () => {

        window.location.href = "notifications.html";

    });

}


/* =========================================
   LOGOUT FUNCTION
========================================= */

function logoutStudent() {

    const confirmLogout =
        confirm("Are you sure you want to logout?");

    if (!confirmLogout) {
        return;
    }


    /*
     * Backend integration:
     *
     * Later we will clear the authentication
     * session/token here.
     */

    window.location.href = "login.html";

}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logoutStudent
    );

}


if (pageLogoutBtn) {

    pageLogoutBtn.addEventListener(
        "click",
        logoutStudent
    );

}


/* =========================================
   PASSWORD FORM
========================================= */

if (passwordForm) {

    passwordForm.addEventListener("submit", (event) => {

        event.preventDefault();


        const currentPassword =
            document.getElementById(
                "currentPassword"
            ).value.trim();


        const newPassword =
            document.getElementById(
                "newPassword"
            ).value.trim();


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value.trim();


        passwordMessage.className =
            "password-message";


        /* Current password */

        if (!currentPassword) {

            showPasswordError(
                "Please enter your current password."
            );

            return;

        }


        /* Minimum password length */

        if (newPassword.length < 6) {

            showPasswordError(
                "New password must contain at least 6 characters."
            );

            return;

        }


        /* Confirm password */

        if (newPassword !== confirmPassword) {

            showPasswordError(
                "New password and confirmation do not match."
            );

            return;

        }


        /*
         * Frontend demo only.
         *
         * The actual password update will be
         * performed securely by the Node.js backend.
         */

        passwordMessage.textContent =
            "Password update request is ready for backend integration.";

        passwordMessage.classList.add("success");


        passwordForm.reset();

    });

}


/* =========================================
   PASSWORD ERROR
========================================= */

function showPasswordError(message) {

    passwordMessage.textContent = message;

    passwordMessage.classList.add("error");

}


/* =========================================
   NOTIFICATION PREFERENCES
========================================= */

if (feeNotifications) {

    feeNotifications.addEventListener("change", () => {

        const enabled =
            feeNotifications.checked;

        console.log(
            "Fee notifications:",
            enabled
        );

        /*
         * Backend integration later:
         *
         * PATCH /api/student/settings
         */

    });

}


if (announcementNotifications) {

    announcementNotifications.addEventListener(
        "change",
        () => {

            const enabled =
                announcementNotifications.checked;

            console.log(
                "Announcement notifications:",
                enabled
            );

            /*
             * Backend integration later:
             *
             * PATCH /api/student/settings
             */

        }
    );

}


/* =========================================
   SETTINGS SEARCH
========================================= */

if (settingsSearch) {

    settingsSearch.addEventListener(
        "input",
        () => {

            const query =
                settingsSearch.value
                    .trim()
                    .toLowerCase();


            const cards =
                document.querySelectorAll(
                    ".settings-card"
                );


            if (!query) {

                cards.forEach(card => {
                    card.classList.remove(
                        "search-hidden"
                    );
                });

                return;

            }


            cards.forEach(card => {

                const text =
                    card.textContent
                        .toLowerCase();


                if (text.includes(query)) {

                    card.classList.remove(
                        "search-hidden"
                    );

                } else {

                    card.classList.add(
                        "search-hidden"
                    );

                }

            });

        }
    );

}