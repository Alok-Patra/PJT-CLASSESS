
/* =========================================================
   PJT CLASSES — ADMIN NOTIFICATIONS
   Real Supabase data, recipients, badges and notification history
========================================================= */

document.addEventListener("DOMContentLoaded", initNotifications);

async function initNotifications() {
    const client = window.supabaseClient;

    // -----------------------------------------------------
    // ELEMENTS
    // -----------------------------------------------------

    const form = document.getElementById("notificationForm");
    const typeInput = document.getElementById("notificationType");
    const recipientInput = document.getElementById("recipient");
    const titleInput = document.getElementById("notificationTitle");
    const messageInput = document.getElementById("notificationMessage");
    const characterCount = document.getElementById("characterCount");
    const clearButton = document.getElementById("clearButton");
    const sendButton = document.getElementById("sendButton");
    const formMessage = document.getElementById("formMessage");
    const tableBody = document.getElementById("notificationsTableBody");

    const totalNotifications = document.getElementById("totalNotifications");
    const sentNotifications = document.getElementById("sentNotifications");
    const unreadNotifications = document.getElementById("unreadNotifications");
    const recentCount = document.getElementById("recentCount");

    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("adminSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const logoutButton = document.getElementById("logoutButton");

    const sidebarBadge = document.querySelector(
        '.admin-nav a[href="notifications.html"] .nav-badge'
    );

    const topbarBadge = document.querySelector(
        ".notification-button span"
    );

    let students = [];
    let notifications = [];

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
        },
        general: {
            label: "General",
            className: "announcement-type",
            icon: "🔔"
        }
    };

    // -----------------------------------------------------
    // HELPERS
    // -----------------------------------------------------

    function showMessage(message, kind = "") {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.className = "form-message";

        if (kind) {
            formMessage.classList.add(kind);
        }
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function getNotificationType(notification) {
        const key = String(
            notification.notification_type || "general"
        ).toLowerCase();

        return typeConfig[key] || typeConfig.general;
    }

    function getRecipientLabel(notification) {
        // Both fields NULL means a broadcast to all students.
        if (
            !notification.student_id &&
            !notification.target_student_id
        ) {
            return "All Students";
        }

        const studentId =
            notification.target_student_id ||
            notification.student_id;

        const student = students.find(item => item.id === studentId);

        if (!student) return "Individual Student";

        return `${student.full_name || "Unnamed student"} — ${
            student.student_id || "No student ID"
        }`;
    }

    function updateBadges(total) {
        const count = Number(total || 0);
        const label = count > 99 ? "99+" : String(count);

        [sidebarBadge, topbarBadge].forEach(badge => {
            if (!badge) return;

            badge.textContent = label;
            badge.style.display = count > 0 ? "inline-flex" : "none";
            badge.setAttribute(
                "aria-label",
                `${count} notifications`
            );
        });
    }

    // -----------------------------------------------------
    // LOAD REAL STUDENTS
    // -----------------------------------------------------

    async function loadStudents() {
        if (!recipientInput) return;

        recipientInput.replaceChildren(
            new Option("Loading students...", "")
        );

        const { data, error } = await client
            .from("profiles")
            .select("id, full_name, student_id")
            .eq("role", "student")
            .order("full_name", { ascending: true });

        if (error) {
            console.error("Unable to load students:", error);

            recipientInput.replaceChildren(
                new Option("Could not load students", "")
            );

            showMessage(
                "Could not load students: " + error.message,
                "error"
            );

            throw error;
        }

        students = data || [];

        recipientInput.replaceChildren(
            new Option("All Students", "all")
        );

        students.forEach(student => {
            recipientInput.add(
                new Option(
                    `${student.full_name || "Unnamed student"} — ${
                        student.student_id || "No student ID"
                    }`,
                    student.id
                )
            );
        });
    }

    // -----------------------------------------------------
    // LOAD NOTIFICATIONS FROM SUPABASE
    // -----------------------------------------------------

    async function loadNotifications() {
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">Loading notifications...</td>
                </tr>
            `;
        }

        const { data, error, count } = await client
            .from("notifications")
            .select(
                "id, student_id, target_student_id, title, body, notification_type, created_at",
                { count: "exact" }
            )
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Unable to load notifications:", error);

            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            Could not load notifications.
                            Check Supabase permissions.
                        </td>
                    </tr>
                `;
            }

            showMessage(
                "Could not load notifications: " + error.message,
                "error"
            );

            throw error;
        }

        notifications = data || [];

        renderNotifications();
        updateSummary(count ?? notifications.length);
        updateBadges(count ?? notifications.length);
    }

    // -----------------------------------------------------
    // RENDER RECENT NOTIFICATIONS
    // -----------------------------------------------------

    function renderNotifications() {
        if (!tableBody) return;

        tableBody.replaceChildren();

        const recentNotifications = notifications.slice(0, 5);

        if (recentNotifications.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "No notifications have been sent yet.";
            cell.style.textAlign = "center";
            cell.style.padding = "24px";

            row.appendChild(cell);
            tableBody.appendChild(row);

            if (recentCount) recentCount.textContent = "0";
            return;
        }

        recentNotifications.forEach(notification => {
            const config = getNotificationType(notification);
            const row = document.createElement("tr");

            const notificationCell = document.createElement("td");
            const notificationWrapper = document.createElement("div");
            notificationWrapper.className = "notification-cell";

            const icon = document.createElement("div");
            icon.className = "table-icon";
            icon.textContent = config.icon;

            const details = document.createElement("div");

            const heading = document.createElement("strong");
            heading.textContent = notification.title || "Untitled notification";

            const body = document.createElement("span");
            body.textContent = notification.body || "";

            details.append(heading, body);
            notificationWrapper.append(icon, details);
            notificationCell.appendChild(notificationWrapper);

            const typeCell = document.createElement("td");
            const typeBadge = document.createElement("span");
            typeBadge.className = `type-badge ${config.className}`;
            typeBadge.textContent = config.label;
            typeCell.appendChild(typeBadge);

            const recipientCell = document.createElement("td");
            recipientCell.textContent = getRecipientLabel(notification);

            const dateCell = document.createElement("td");
            dateCell.textContent = formatDate(notification.created_at);

            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");
            statusBadge.className = "status-badge sent";
            statusBadge.textContent = "Saved";
            statusCell.appendChild(statusBadge);

            row.append(
                notificationCell,
                typeCell,
                recipientCell,
                dateCell,
                statusCell
            );

            tableBody.appendChild(row);
        });

        if (recentCount) {
            recentCount.textContent = String(recentNotifications.length);
        }
    }

    // -----------------------------------------------------
    // UPDATE SUMMARY
    // -----------------------------------------------------

    function updateSummary(total) {
        const count = Number(total ?? notifications.length);

        if (totalNotifications) {
            totalNotifications.textContent = String(count);
        }

        if (sentNotifications) {
            sentNotifications.textContent = String(count);
        }

        // The current database structure does not establish
        // an admin-side unread/read status for notifications.
        if (unreadNotifications) {
            unreadNotifications.textContent = "—";
            unreadNotifications.title =
                "Unread count requires a read-status system.";
        }
    }

    // -----------------------------------------------------
    // CHARACTER COUNTER
    // -----------------------------------------------------

    if (messageInput && characterCount) {
        messageInput.addEventListener("input", () => {
            characterCount.textContent = String(messageInput.value.length);
        });
    }

    // -----------------------------------------------------
    // CLEAR FORM
    // -----------------------------------------------------

    if (clearButton && form) {
        clearButton.addEventListener("click", () => {
            form.reset();

            if (characterCount) {
                characterCount.textContent = "0";
            }

            showMessage("");
        });
    }

    // -----------------------------------------------------
    // SEND NOTIFICATION
    // -----------------------------------------------------

    if (form) {
        form.addEventListener("submit", async event => {
            event.preventDefault();

            const notificationTitle = titleInput?.value.trim() || "";
            const notificationBody = messageInput?.value.trim() || "";
            const selectedType = typeInput?.value || "announcement";
            const selectedRecipient = recipientInput?.value || "";

            if (!notificationTitle || !notificationBody) {
                showMessage(
                    "Please enter both a notification title and message.",
                    "error"
                );
                return;
            }

            if (!selectedRecipient) {
                showMessage(
                    "Please select a recipient.",
                    "error"
                );
                return;
            }

            if (sendButton?.disabled) return;

            if (sendButton) {
                sendButton.disabled = true;
                sendButton.classList.add("loading");
                sendButton.textContent = "Sending...";
            }

            try {
                const selectedStudent =
                    selectedRecipient === "all"
                        ? null
                        : students.find(
                            student => student.id === selectedRecipient
                        );

                if (
                    selectedRecipient !== "all" &&
                    !selectedStudent
                ) {
                    throw new Error(
                        "The selected student could not be found. Please select again."
                    );
                }

                /*
                 * Existing student-side logic treats both recipient
                 * fields being NULL as a broadcast.
                 *
                 * Student-specific notifications use the student's
                 * Supabase profile UUID in both fields.
                 *
                 * Do not include created_by unless that column
                 * actually exists in your notifications table.
                 */
                const notificationData = {
                    student_id: selectedStudent?.id ?? null,
                    target_student_id: selectedStudent?.id ?? null,
                    title: notificationTitle,
                    body: notificationBody,
                    notification_type: selectedType
                };

                const { error } = await client
                    .from("notifications")
                    .insert(notificationData);

                if (error) throw error;

                showMessage(
                    "Notification saved successfully!",
                    "success"
                );

                form.reset();

                if (characterCount) {
                    characterCount.textContent = "0";
                }

                await loadNotifications();

            } catch (error) {
                console.error("Could not send notification:", error);

                showMessage(
                    "Could not send notification: " + error.message,
                    "error"
                );
            } finally {
                if (sendButton) {
                    sendButton.disabled = false;
                    sendButton.classList.remove("loading");
                    sendButton.innerHTML =
                        "<span>➤</span> Send Notification";
                }
            }
        });
    }

    // -----------------------------------------------------
    // MOBILE SIDEBAR
    // -----------------------------------------------------

    function closeSidebar() {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
    }

    if (menuButton) {
        menuButton.addEventListener("click", () => {
            sidebar?.classList.toggle("open");
            overlay?.classList.toggle("show");
        });
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    // -----------------------------------------------------
    // LOGOUT
    // -----------------------------------------------------

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            if (!window.confirm("Are you sure you want to logout?")) {
                return;
            }

            try {
                if (client.auth) {
                    await client.auth.signOut();
                }
            } catch (error) {
                console.error("Logout error:", error);
            }

            sessionStorage.removeItem("pjtAdminLoggedIn");
            sessionStorage.removeItem("pjtAdminId");

            window.location.href = "login.html";
        });
    }

    // -----------------------------------------------------
    // INITIALIZE
    // -----------------------------------------------------

    if (!client) {
        console.error("Supabase client is not initialized.");

        showMessage(
            "Database connection unavailable. Check js/supabase.js.",
            "error"
        );

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">Database connection unavailable.</td>
                </tr>
            `;
        }

        return;
    }

    if (
        sessionStorage.getItem("pjtAdminLoggedIn") !== "true"
    ) {
        window.location.href = "login.html";
        return;
    }

    try {
        await loadStudents();
        await loadNotifications();
    } catch (error) {
        console.error("Notification page initialization failed:", error);
    }
}
