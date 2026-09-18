/* =====================================================
   PJT CLASSES - BEHAVIOUR JS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const sidebarClose =
        document.getElementById("sidebarClose");

    const mobileMenu =
        document.getElementById("mobileMenu");


    /* =================================================
       OPEN SIDEBAR
    ================================================= */

    function openSidebar() {

        if (!sidebar || !sidebarOverlay) {
            return;
        }

        sidebar.classList.add("open");

        sidebarOverlay.classList.add("show");

        document.body.style.overflow = "hidden";
    }


    /* =================================================
       CLOSE SIDEBAR
    ================================================= */

    function closeSidebar() {

        if (!sidebar || !sidebarOverlay) {
            return;
        }

        sidebar.classList.remove("open");

        sidebarOverlay.classList.remove("show");

        document.body.style.overflow = "";
    }


    /* =================================================
       MOBILE MENU
    ================================================= */

    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            openSidebar
        );

    }


    /* =================================================
       CLOSE BUTTON
    ================================================= */

    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    /* =================================================
       OVERLAY
    ================================================= */

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /* =================================================
       NAVIGATION
    ================================================= */

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    if (window.innerWidth <= 768) {

                        closeSidebar();

                    }

                }
            );

        });


    /* =================================================
       BEHAVIOUR PROGRESS
    ================================================= */

    const progressBars =
        document.querySelectorAll(
            ".behaviour-progress"
        );


    setTimeout(() => {

        progressBars.forEach(bar => {

            const progress =
                Number(
                    bar.dataset.progress
                );


            if (
                !Number.isNaN(progress) &&
                progress >= 0 &&
                progress <= 100
            ) {

                bar.style.width =
                    `${progress}%`;

            }

        });

    }, 250);


    /* =================================================
       NOTIFICATIONS
    ================================================= */

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "notifications.html";

            }
        );

    }


    /* =================================================
       ESCAPE KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                window.innerWidth <= 768
            ) {

                closeSidebar();

            }

        }
    );


    /* =================================================
       WINDOW RESIZE
    ================================================= */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 768) {

                closeSidebar();

            }

        }
    );

});