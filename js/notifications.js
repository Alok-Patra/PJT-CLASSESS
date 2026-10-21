
/* =========================================
   PJT CLASSES
   STUDENT NOTIFICATIONS
   Supabase-connected version
   Existing core functionality preserved
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    /* =====================================
       ELEMENTS
    ===================================== */

    const notificationsList = document.getElementById("notificationsList");
    const noResults = document.getElementById("noResults");
    const notificationSearch = document.getElementById("notificationSearch");
    const notificationFilter = document.getElementById("notificationFilter");
    const unreadCount = document.getElementById("unreadCount");
    const feeCount = document.getElementById("feeCount");
    const announcementCount = document.getElementById("announcementCount");
    const markAllBtn = document.getElementById("markAllBtn");
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const logoutBtn = document.getElementById("logoutBtn");

    const client = window.supabaseClient;

    let notifications = [];
    let studentId = null;

    /* =====================================
       HELPERS
    ===================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function showLoadError(message) {
        console.error("Notification error:", message);

        if (notificationsList) {
            notificationsList.innerHTML = "";
        }

        if (noResults) {
            noResults.textContent = message;
            noResults.classList.add("show");
        }
    }

    /* =====================================
       LOAD LOGGED-IN STUDENT
    ===================================== */

    async function loadStudent() {
        if (!client) {
            throw new Error(
                "Supabase is not initialized. Check notifications.html script imports."
            );
        }

        const {
            data: sessionData,
            error: sessionError
        } = await client.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData?.session) {
            window.location.href = "login.html";
            return false;
        }

        studentId = sessionData.session.user.id;

        const {
            data: profile,
            error: profileError
        } = await client
            .from("profiles")
            .select("id, full_name, role, student_id, student_class")
            .eq("id", studentId)
            .maybeSingle();

        if (profileError) {
            throw new Error(
                "Unable to load student profile: " + profileError.message
            );
        }

        if (!profile) {
            throw new Error(
                "Student profile not found. Please contact your administrator."
            );
        }

        const role = String(profile.role || "")
            .trim()
            .toLowerCase();

        if (role !== "student") {
            throw new Error(
                "This account is not registered as a student."
            );
        }

        const studentName = String(profile.full_name || "Student").trim();
        const studentClass = String(
            profile.student_class ?? ""
        ).trim();
        const studentCode = String(
            profile.student_id ?? ""
        ).trim();

        const initials = studentName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join("")
            .toUpperCase() || "S";

        document.querySelectorAll("[data-student-name]")
            .forEach(element => {
                element.textContent = studentName;
            });

        document.querySelectorAll("[data-student-class]")
            .forEach(element => {
                if (!studentClass) {
                    element.textContent = "Class not assigned";
                } else {
                    element.textContent =
                        /^class\s/i.test(studentClass)
                            ? studentClass
                            : `Class ${studentClass}`;
                }
            });

        document.querySelectorAll("[data-student-id]")
            .forEach(element => {
                element.textContent = studentCode || "ID not assigned";
            });

        document.querySelectorAll("[data-student-initials]")
            .forEach(element => {
                element.textContent = initials;
            });

        console.log("Student profile loaded successfully.");

        return true;
    }

    /* =====================================
       LOAD NOTIFICATIONS AND READ STATUS
    ===================================== */

    async function loadNotifications() {
        const {
            data: rows,
            error
        } = await client
            .from("notifications")
            .select(
                "id, student_id, target_student_id, title, body, notification_type, created_at"
            )
            .or(
                `student_id.is.null,student_id.eq.${studentId},target_student_id.is.null,target_student_id.eq.${studentId}`
            )
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(
                "Unable to load notifications: " + error.message
            );
        }

        const {
            data: readRows,
            error: readError
        } = await client
            .from("notification_reads")
            .select("notification_id, read_at")
            .eq("student_id", studentId);

        if (readError) {
            throw new Error(
                "Unable to load notification read status: " +
                readError.message
            );
        }

        const readIds = new Set(
            (readRows || []).map(row => String(row.notification_id))
        );

        notifications = (rows || []).map(row => ({
            id: row.id,
            type: String(row.notification_type || "general")
                .trim()
                .toLowerCase(),
            title: row.title || "Notification",
            message: row.body || "",
            date: formatDate(row.created_at),
            unread: !readIds.has(String(row.id))
        }));

        updateCounts();
        renderNotifications();

        console.log("Notifications loaded:", notifications.length);
    }

    /* =====================================
       UPDATE ALL SUMMARY COUNTS
    ===================================== */

    function updateCounts() {
        const unreadTotal = notifications.filter(
            notification => notification.unread
        ).length;

        const feeTotal = notifications.filter(
            notification => notification.type === "fee"
        ).length;

        const announcementTotal = notifications.filter(
            notification => notification.type === "announcement"
        ).length;

        // Main unread summary.
        if (unreadCount) {
            unreadCount.textContent = unreadTotal;
        }

        // Fee and announcement summary cards.
        if (feeCount) {
            feeCount.textContent = feeTotal;
        }

        if (announcementCount) {
            announcementCount.textContent = announcementTotal;
        }

        // Header notification badge.
        const topBadge = document.querySelector(
            ".notification-top-btn span"
        );

        if (topBadge) {
            topBadge.textContent = unreadTotal;
            topBadge.style.display =
                unreadTotal > 0 ? "flex" : "none";
        }

        // Sidebar notification badge.
        const sidebarBadge = document.querySelector(".nav-badge");

        if (sidebarBadge) {
            sidebarBadge.textContent = unreadTotal;
            sidebarBadge.style.display =
                unreadTotal > 0 ? "inline-flex" : "none";
        }
    }

    /* =====================================
       RENDER NOTIFICATIONS
    ===================================== */

    function renderNotifications() {
        if (
            !notificationsList ||
            !noResults ||
            !notificationSearch ||
            !notificationFilter
        ) {
            console.error(
                "Required notification HTML elements are missing."
            );
            return;
        }

        const searchValue = notificationSearch.value
            .trim()
            .toLowerCase();

        const filterValue = notificationFilter.value;

        const filteredNotifications = notifications.filter(
            notification => {
                const matchesSearch =
                    String(notification.title)
                        .toLowerCase()
                        .includes(searchValue) ||
                    String(notification.message)
                        .toLowerCase()
                        .includes(searchValue);

                let matchesFilter = true;

                if (filterValue === "unread") {
                    matchesFilter = notification.unread;
                } else if (filterValue === "fee") {
                    matchesFilter = notification.type === "fee";
                } else if (filterValue === "announcement") {
                    matchesFilter =
                        notification.type === "announcement";
                }

                return matchesSearch && matchesFilter;
            }
        );

        notificationsList.innerHTML = "";

        if (filteredNotifications.length === 0) {
            noResults.textContent = notifications.length === 0
                ? "You have no notifications yet."
                : "No notifications match your search or filter.";

            noResults.classList.add("show");
            return;
        }

        noResults.classList.remove("show");

        filteredNotifications.forEach(notification => {
            const item = document.createElement("div");

            item.className = `notification-item ${
                notification.unread ? "unread" : ""
            }`;

            const icon =
                notification.type === "fee" ? "₹" :
                notification.type === "performance" ? "📊" :
                notification.type === "behaviour" ? "◉" :
                notification.type === "announcement" ? "!" :
                "🔔";

            const allowedTypes = [
                "fee",
                "announcement",
                "performance",
                "behaviour"
            ];

            const iconClass = allowedTypes.includes(notification.type)
                ? notification.type
                : "announcement";

            item.innerHTML = `
                <div class="notification-icon ${iconClass}">
                    ${icon}
                </div>

                <div class="notification-content">
                    <div class="notification-top">
                        <span class="notification-title">
                            ${escapeHTML(notification.title)}
                        </span>

                        ${
                            notification.unread
                                ? '<span class="unread-dot"></span>'
                                : ""
                        }
                    </div>

                    <p class="notification-message">
                        ${escapeHTML(notification.message)}
                    </p>

                    <span class="notification-date">
                        ${escapeHTML(notification.date)}
                    </span>
                </div>

                <div class="notification-actions">
                    ${
                        notification.unread
                            ? `<button
                                type="button"
                                class="read-btn"
                                data-notification-id="${escapeHTML(notification.id)}">
                                Mark read
                            </button>`
                            : ""
                    }
                </div>
            `;

            const readButton = item.querySelector(".read-btn");

            if (readButton) {
                readButton.addEventListener("click", () => {
                    markAsRead(notification.id);
                });
            }

            notificationsList.appendChild(item);
        });
    }

    /* =====================================
       SAVE ONE NOTIFICATION AS READ
    ===================================== */

    async function markAsRead(id) {
        const notification = notifications.find(
            item => String(item.id) === String(id)
        );

        if (!notification || !notification.unread) {
            return;
        }

        try {
            const {
                data: existing,
                error: lookupError
            } = await client
                .from("notification_reads")
                .select("notification_id")
                .eq("student_id", studentId)
                .eq("notification_id", id)
                .maybeSingle();

            if (lookupError) throw lookupError;

            if (existing) {
                const { error } = await client
                    .from("notification_reads")
                    .update({
                        read_at: new Date().toISOString()
                    })
                    .eq("student_id", studentId)
                    .eq("notification_id", id);

                if (error) throw error;
            } else {
                const { error } = await client
                    .from("notification_reads")
                    .insert({
                        student_id: studentId,
                        notification_id: id,
                        read_at: new Date().toISOString()
                    });

                if (error) throw error;
            }

            notification.unread = false;

            updateCounts();
            renderNotifications();

        } catch (error) {
            console.error(
                "Unable to mark notification as read:",
                error
            );

            alert(
                "Could not save read status: " + error.message
            );
        }
    }

    /* =====================================
       MARK ALL AS READ
    ===================================== */

    if (markAllBtn) {
        markAllBtn.addEventListener("click", async () => {
            const unreadItems = notifications.filter(
                item => item.unread
            );

            if (unreadItems.length === 0) return;

            markAllBtn.disabled = true;

            try {
                for (const notification of unreadItems) {
                    const {
                        data: existing,
                        error: lookupError
                    } = await client
                        .from("notification_reads")
                        .select("notification_id")
                        .eq("student_id", studentId)
                        .eq("notification_id", notification.id)
                        .maybeSingle();

                    if (lookupError) throw lookupError;

                    if (existing) {
                        const { error } = await client
                            .from("notification_reads")
                            .update({
                                read_at: new Date().toISOString()
                            })
                            .eq("student_id", studentId)
                            .eq(
                                "notification_id",
                                notification.id
                            );

                        if (error) throw error;
                    } else {
                        const { error } = await client
                            .from("notification_reads")
                            .insert({
                                student_id: studentId,
                                notification_id: notification.id,
                                read_at: new Date().toISOString()
                            });

                        if (error) throw error;
                    }

                    notification.unread = false;
                }

                updateCounts();
                renderNotifications();

            } catch (error) {
                console.error(
                    "Unable to mark all as read:",
                    error
                );

                alert(
                    "Unable to save read status: " + error.message
                );

                // Refresh from the database after a partial failure.
                try {
                    await loadNotifications();
                } catch (reloadError) {
                    showLoadError(reloadError.message);
                }

            } finally {
                markAllBtn.disabled = false;
            }
        });
    }

    /* =====================================
       SEARCH AND FILTER
    ===================================== */

    if (notificationSearch) {
        notificationSearch.addEventListener(
            "input",
            renderNotifications
        );
    }

    if (notificationFilter) {
        notificationFilter.addEventListener(
            "change",
            renderNotifications
        );
    }

    /* =====================================
       MOBILE SIDEBAR
    ===================================== */

    if (menuBtn && sidebar && sidebarOverlay) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            sidebarOverlay.classList.toggle("show");
        });

        sidebarOverlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.remove("show");
        });
    }

    /* =====================================
       LOGOUT
    ===================================== */

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (!confirmLogout) return;

            try {
                if (client) {
                    const { error } = await client.auth.signOut();

                    if (error) throw error;
                }

                sessionStorage.removeItem("pjtStudentLoggedIn");
                sessionStorage.removeItem("pjtStudentId");

                window.location.href = "login.html";

            } catch (error) {
                console.error("Logout error:", error);

                alert("Unable to log out: " + error.message);
            }
        });
    }

    /* =====================================
       INITIAL LOAD
    ===================================== */

    try {
        if (!notificationsList || !noResults) {
            throw new Error(
                "Notification HTML elements were not found. Check notifications.html."
            );
        }

        const authenticated = await loadStudent();

        if (authenticated) {
            await loadNotifications();
        }

    } catch (error) {
        showLoadError(error.message);
    }
});
