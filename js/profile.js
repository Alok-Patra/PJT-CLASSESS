/* =====================================================
   PJT CLASSES - PROFILE PAGE JS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarClose = document.getElementById("sidebarClose");
    const mobileMenu = document.getElementById("mobileMenu");

    const addMemberBtn = document.getElementById("addMemberBtn");
    const membersList = document.getElementById("membersList");

    /* =================================================
       SIDEBAR
    ================================================= */

    function openSidebar() {

        sidebar.classList.add("open");
        sidebarOverlay.classList.add("show");

        document.body.style.overflow = "hidden";
    }


    function closeSidebar() {

        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("show");

        document.body.style.overflow = "";
    }


    if (mobileMenu) {

        mobileMenu.addEventListener("click", openSidebar);

    }


    if (sidebarClose) {

        sidebarClose.addEventListener("click", closeSidebar);

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener("click", closeSidebar);

    }


    /* Close sidebar after navigation on mobile */

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", () => {

            if (window.innerWidth <= 768) {

                closeSidebar();

            }

        });

    });


    /* =================================================
       ADD MEMBER
    ================================================= */

    if (addMemberBtn) {

        addMemberBtn.addEventListener("click", () => {

            const members =
                membersList.querySelectorAll(".member-item");

            if (members.length >= 3) {

                alert("You can add a maximum of 3 members.");

                return;

            }


            /*
             * This is currently frontend demonstration logic.
             *
             * Later this button will open a proper member
             * registration form and send the data to:
             *
             * Node.js + Express API
             *
             * The backend will then store the member
             * information in the database.
             */

            alert(
                "Member registration form will be connected here."
            );

        });

    }


    /* =================================================
       RESPONSIVE SIDEBAR
    ================================================= */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {

            closeSidebar();

        }

    });

});