/* =========================================
   PJT CLASSES
   NOTIFICATIONS
========================================= */


/* =========================================
   SAMPLE NOTIFICATION DATA
   Backend will replace this later
========================================= */

const notifications = [

    {
        id: 1,
        type: "fee",
        title: "Fee Payment Reminder",
        message:
            "Your fee for September is still pending. Please complete the payment for this month.",
        date: "18 September 2026, 10:30 AM",
        unread: true
    },

    {
        id: 2,
        type: "announcement",
        title: "Important Announcement",
        message:
            "Students are requested to maintain regular attendance and follow the class schedule.",
        date: "17 September 2026, 06:15 PM",
        unread: true
    },

    {
        id: 3,
        type: "fee",
        title: "Fee Status Updated",
        message:
            "Your October fee payment has been successfully recorded in the student portal.",
        date: "05 September 2026, 04:20 PM",
        unread: false
    },

    {
        id: 4,
        type: "announcement",
        title: "Class Update",
        message:
            "Your latest academic performance information has been updated in the student portal.",
        date: "02 September 2026, 05:10 PM",
        unread: false
    },

    {
        id: 5,
        type: "fee",
        title: "Fee Record",
        message:
            "Your July fee payment has been recorded successfully.",
        date: "08 August 2026, 03:45 PM",
        unread: false
    }

];


/* =========================================
   ELEMENTS
========================================= */

const notificationsList =
    document.getElementById("notificationsList");

const noResults =
    document.getElementById("noResults");

const notificationSearch =
    document.getElementById("notificationSearch");

const notificationFilter =
    document.getElementById("notificationFilter");

const unreadCount =
    document.getElementById("unreadCount");

const markAllBtn =
    document.getElementById("markAllBtn");

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =========================================
   RENDER NOTIFICATIONS
========================================= */

function renderNotifications() {

    const searchValue =
        notificationSearch.value
            .trim()
            .toLowerCase();

    const filterValue =
        notificationFilter.value;


    const filteredNotifications =
        notifications.filter(notification => {

            const matchesSearch =
                notification.title
                    .toLowerCase()
                    .includes(searchValue) ||

                notification.message
                    .toLowerCase()
                    .includes(searchValue);


            let matchesFilter = true;


            if (filterValue === "unread") {
                matchesFilter = notification.unread === true;
            }

            if (filterValue === "fee") {
                matchesFilter = notification.type === "fee";
            }

            if (filterValue === "announcement") {
                matchesFilter =
                    notification.type === "announcement";
            }


            return matchesSearch && matchesFilter;

        });


    notificationsList.innerHTML = "";


    if (filteredNotifications.length === 0) {

        noResults.classList.add("show");

        return;

    }


    noResults.classList.remove("show");


    filteredNotifications.forEach(notification => {

        const item =
            document.createElement("div");

        item.className =
            `notification-item ${
                notification.unread ? "unread" : ""
            }`;


        const icon =
            notification.type === "fee"
                ? "₹"
                : "!";


        item.innerHTML = `

            <div class="notification-icon ${notification.type}">
                ${icon}
            </div>

            <div class="notification-content">

                <div class="notification-top">

                    <span class="notification-title">
                        ${notification.title}
                    </span>

                    ${
                        notification.unread
                            ? `<span class="unread-dot"></span>`
                            : ""
                    }

                </div>

                <p class="notification-message">
                    ${notification.message}
                </p>

                <span class="notification-date">
                    ${notification.date}
                </span>

            </div>

            <div class="notification-actions">

                ${
                    notification.unread
                        ? `
                            <button
                                class="read-btn"
                                onclick="markAsRead(${notification.id})"
                            >
                                Mark read
                            </button>
                          `
                        : ""
                }

            </div>

        `;


        notificationsList.appendChild(item);

    });

}


/* =========================================
   MARK SINGLE NOTIFICATION AS READ
========================================= */

function markAsRead(id) {

    const notification =
        notifications.find(item => item.id === id);

    if (!notification) return;


    notification.unread = false;

    updateUnreadCount();

    renderNotifications();

}


/* =========================================
   MARK ALL AS READ
========================================= */

markAllBtn.addEventListener("click", () => {

    notifications.forEach(notification => {
        notification.unread = false;
    });

    updateUnreadCount();

    renderNotifications();

});


/* =========================================
   UPDATE UNREAD COUNT
========================================= */

function updateUnreadCount() {

    const count =
        notifications.filter(
            notification => notification.unread
        ).length;


    unreadCount.textContent = count;


    const topBadge =
        document.querySelector(
            ".notification-top-btn span"
        );


    if (topBadge) {

        topBadge.textContent = count;

        topBadge.style.display =
            count > 0 ? "flex" : "none";

    }


    const sidebarBadge =
        document.querySelector(".nav-badge");


    if (sidebarBadge) {

        sidebarBadge.textContent = count;

        sidebarBadge.style.display =
            count > 0 ? "inline-flex" : "none";

    }

}


/* =========================================
   SEARCH
========================================= */

notificationSearch.addEventListener(
    "input",
    renderNotifications
);


/* =========================================
   FILTER
========================================= */

notificationFilter.addEventListener(
    "change",
    renderNotifications
);


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
   LOGOUT
========================================= */

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        const confirmLogout =
            confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;


        /*
         * Backend integration later:
         * localStorage/session will be cleared
         * and user will be redirected to login.
         */

        window.location.href = "login.html";

    });

}


/* =========================================
   INITIAL LOAD
========================================= */

updateUnreadCount();

renderNotifications();