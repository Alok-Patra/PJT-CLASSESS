/* =========================================================
   PJT CLASSES
   ADMIN DASHBOARD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const sidebar =
        document.getElementById("adminSidebar");

    const menuButton =
        document.getElementById("menuButton");

    const closeButton =
        document.getElementById("sidebarClose");

    const overlay =
        document.getElementById("sidebarOverlay");

    const logoutButton =
        document.getElementById("logoutButton");


    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    function openSidebar() {

        if (!sidebar) return;

        sidebar.classList.add("open");

        if (overlay) {
            overlay.classList.add("show");
        }
    }


    function closeSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove("open");

        if (overlay) {
            overlay.classList.remove("show");
        }
    }


    if (menuButton) {
        menuButton.addEventListener(
            "click",
            openSidebar
        );
    }


    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeSidebar
        );
    }


    if (overlay) {
        overlay.addEventListener(
            "click",
            closeSidebar
        );
    }


    /* =====================================================
       CLOSE MOBILE MENU AFTER NAVIGATION
    ===================================================== */

    document
        .querySelectorAll(".admin-nav-link")
        .forEach(link => {

            link.addEventListener("click", () => {

                if (window.innerWidth <= 800) {
                    closeSidebar();
                }

            });

        });


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }


            sessionStorage.removeItem(
                "pjtAdminLoggedIn"
            );

            sessionStorage.removeItem(
                "pjtAdminId"
            );


            window.location.href =
                "login.html";

        });

    }

});