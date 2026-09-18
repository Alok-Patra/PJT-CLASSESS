/* =========================================
   PJT CLASSES
   ADMIN NOTIFICATIONS JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ADMIN AUTH CHECK
    ===================================== */

    const adminLoggedIn =
        sessionStorage.getItem("pjtAdminLoggedIn");

    if (adminLoggedIn !== "true") {
        window.location.href = "login.html";
        return;
    }


    /* =====================================
       ELEMENTS
    ===================================== */

    const form =
        document.getElementById("notificationForm");

    const type =
        document.getElementById("notificationType");

    const recipient =
        document.getElementById("recipient");

    const title =
        document.getElementById("notificationTitle");

    const message =
        document.getElementById("notificationMessage");

    const characterCount =
        document.getElementById("characterCount");

    const clearButton =
        document.getElementById("clearButton");

    const sendButton =
        document.getElementById("sendButton");

    const formMessage =
        document.getElementById("formMessage");

    const tableBody =
        document.getElementById("notificationsTableBody");

    const totalNotifications =
        document.getElementById("totalNotifications");

    const sentNotifications =
        document.getElementById("sentNotifications");

    const recentCount =
        document.getElementById("recentCount");

    const menuButton =
        document.getElementById("menuButton");

    const sidebar =
        document.getElementById("adminSidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    const logoutButton =
        document.getElementById("logoutButton");


    /* =====================================
       SAMPLE NOTIFICATION DATA
    ===================================== */

    let notifications = [
        {
            title: "Monthly Fee Reminder",
            message: "Please clear your pending fee.",
            type: "fee",
            recipient: "Rahul Kumar",
            studentId: "STU-2026-001",
            date: "18 Sep 2026",
            status: "Sent"
        },

        {
            title: "Important Announcement",
            message: "Regular classes will continue.",
            type: "announcement",
            recipient: "All Students",
            studentId: "",
            date: "17 Sep 2026",
            status: "Sent"
        },

        {
            title: "Performance Updated",
            message: "Your performance record was updated.",
            type: "performance",
            recipient: "Priya Sharma",
            studentId: "STU-2026-003",
            date: "16 Sep 2026",
            status: "Sent"
        },

        {
            title: "Fee Pending",
            message: "Monthly fee payment is pending.",
            type: "fee",
            recipient: "Rohit Verma",
            studentId: "STU-2026-004",
            date: "15 Sep 2026",
            status: "Sent"
        },

        {
            title: "Class Update",
            message: "Students are requested to attend class regularly.",
            type: "announcement",
            recipient: "All Students",
            studentId: "",
            date: "14 Sep 2026",
            status: "Sent"
        }
    ];


    /* =====================================
       TYPE CONFIG
    ===================================== */

    const typeConfig = {

        fee: {
            label: "Fee",
            className: "fee-type",
            icon: "₹"
        },

        announcement: {
            label: "Announcement",
            className: "announcement-type",
            icon: "📢"
        },

        performance: {
            label: "Performance",
            className: "performance-type",
            icon: "📊"
        },

        behaviour: {
            label: "Behaviour",
            className: "announcement-type",
            icon: "◉"
        }

    };


    /* =====================================
       CHARACTER COUNTER
    ===================================== */

    message.addEventListener("input", () => {

        characterCount.textContent =
            message.value.length;

    });


    /* =====================================
       CLEAR FORM
    ===================================== */

    clearButton.addEventListener("click", () => {

        form.reset();

        characterCount.textContent = "0";

        showMessage("", "");

    });


    /* =====================================
       SEND NOTIFICATION
    ===================================== */

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const notificationTitle =
            title.value.trim();

        const notificationMessage =
            message.value.trim();

        const selectedType =
            type.value;

        const selectedRecipient =
            recipient.value;


        if (!notificationTitle) {

            showMessage(
                "Please enter notification title.",
                "error"
            );

            title.focus();

            return;
        }


        if (!notificationMessage) {

            showMessage(
                "Please enter notification message.",
                "error"
            );

            message.focus();

            return;
        }


        /* Find recipient name */

        let recipientName =
            "All Students";

        let studentId = "";


        if (selectedRecipient !== "all") {

            const option =
                recipient.options[
                    recipient.selectedIndex
                ];

            const fullText =
                option.textContent.trim();

            const parts =
                fullText.split("—");

            recipientName =
                parts[0].trim();

            studentId =
                selectedRecipient;
        }


        /* Date */

        const today =
            new Date();

        const date =
            today.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );


        /* Create object */

        const newNotification = {

            title: notificationTitle,

            message: notificationMessage,

            type: selectedType,

            recipient: recipientName,

            studentId: studentId,

            date: date,

            status: "Sent"

        };


        /* Add to beginning */

        notifications.unshift(
            newNotification
        );


        /* Keep only recent 10 */

        if (notifications.length > 10) {
            notifications =
                notifications.slice(0, 10);
        }


        /* Update UI */

        renderNotifications();

        updateSummary();


        /* Loading */

        sendButton.classList.add("loading");

        sendButton.innerHTML =
            "<span>✓</span> Sending...";


        setTimeout(() => {

            sendButton.classList.remove("loading");

            sendButton.innerHTML =
                "<span>➤</span> Send Notification";

            showMessage(
                "Notification sent successfully.",
                "success"
            );

            form.reset();

            characterCount.textContent = "0";

        }, 700);

    });


    /* =====================================
       RENDER NOTIFICATIONS
    ===================================== */

    function renderNotifications() {

        tableBody.innerHTML = "";


        notifications
            .slice(0, 5)
            .forEach(notification => {

                const config =
                    typeConfig[
                        notification.type
                    ] || typeConfig.announcement;


                const row =
                    document.createElement("tr");


                const studentMarkup =
                    notification.studentId
                        ? `<small>${notification.studentId}</small>`
                        : "";


                row.innerHTML = `

                    <td>

                        <div class="notification-cell">

                            <div class="table-icon">
                                ${config.icon}
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        notification.title
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        notification.message
                                    )}
                                </span>

                            </div>

                        </div>

                    </td>


                    <td>

                        <span class="type-badge ${config.className}">
                            ${config.label}
                        </span>

                    </td>


                    <td>

                        ${escapeHTML(
                            notification.recipient
                        )}

                        ${studentMarkup}

                    </td>


                    <td>
                        ${escapeHTML(
                            notification.date
                        )}
                    </td>


                    <td>

                        <span class="status-badge sent">
                            ${notification.status}
                        </span>

                    </td>

                `;


                tableBody.appendChild(row);

            });


        recentCount.textContent =
            Math.min(
                notifications.length,
                5
            );

    }


    /* =====================================
       UPDATE SUMMARY
    ===================================== */

    function updateSummary() {

        const sent =
            notifications.filter(
                item => item.status === "Sent"
            ).length;


        totalNotifications.textContent =
            12 + Math.max(
                0,
                notifications.length - 5
            );


        sentNotifications.textContent =
            sent + 5;

    }


    /* =====================================
       MESSAGE
    ===================================== */

    function showMessage(text, className) {

        formMessage.textContent =
            text;

        formMessage.className =
            "form-message " +
            className;

    }


    /* =====================================
       HTML ESCAPE
    ===================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================
       MOBILE SIDEBAR
    ===================================== */

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("open");

        overlay.classList.toggle("show");

    });


    overlay.addEventListener("click", () => {

        sidebar.classList.remove("open");

        overlay.classList.remove("show");

    });


    /* =====================================
       LOGOUT
    ===================================== */

    logoutButton.addEventListener("click", () => {

        sessionStorage.removeItem(
            "pjtAdminLoggedIn"
        );

        sessionStorage.removeItem(
            "pjtAdminId"
        );

        window.location.href =
            "login.html";

    });


    /* =====================================
       INITIAL RENDER
    ===================================== */

    renderNotifications();

    updateSummary();

});