
/* =========================================
   PJT CLASSES
   ADMIN NOTIFICATIONS JAVASCRIPT
   Supabase-connected version
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    /* =====================================
       ADMIN AUTH CHECK
    ===================================== */

    const adminLoggedIn =
        sessionStorage.getItem("pjtAdminLoggedIn");

    if (adminLoggedIn !== "true") {
        window.location.href = "login.html";
        return;
    }

    const client = window.supabaseClient;

    if (!client) {
        console.error("Supabase client is not initialized.");
        alert("Unable to connect to the database. Please refresh the page.");
        return;
    }

    /* =====================================
       ELEMENTS
    ===================================== */

    const form = document.getElementById("notificationForm");
    const type = document.getElementById("notificationType");
    const recipient = document.getElementById("recipient");
    const title = document.getElementById("notificationTitle");
    const message = document.getElementById("notificationMessage");
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

    let notifications = [];
    let students = [];

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

    function showMessage(text, className = "") {
        formMessage.textContent = text;
        formMessage.className = "form-message " + className;
    }

    function formatDate(value) {
        if (!value) return "—";

        return new Date(value).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function recipientLabel(notification) {
        if (!notification.student_id && !notification.target_student_id) {
            return "All Students";
        }

        const id = notification.target_student_id || notification.student_id;
        const student = students.find(item => item.id === id);

        return student
            ? `${student.full_name} (${student.student_id || "Student"})`
            : "Individual Student";
    }

    /* =====================================
       LOAD REAL STUDENTS
    ===================================== */

    async function loadStudents() {
        const { data, error } = await client
            .from("profiles")
            .select("id, full_name, student_id")
            .eq("role", "student")
            .order("full_name");

        if (error) {
            console.error("Unable to load students:", error);
            showMessage(
                "Could not load students. Check the profiles table permissions.",
                "error"
            );
            return;
        }

        students = data || [];

        recipient.innerHTML =
            '<option value="all">All Students</option>';

        students.forEach(student => {
            const option = document.createElement("option");
            option.value = student.id;
            option.textContent =
                `${student.full_name} — ${student.student_id || "No student ID"}`;

            recipient.appendChild(option);
        });
    }

    /* =====================================
       LOAD NOTIFICATIONS FROM SUPABASE
    ===================================== */

    async function loadNotifications() {
        const { data, error, count } = await client
            .from("notifications")
            .select(
                "id, student_id, target_student_id, title, body, notification_type, created_at",
                { count: "exact" }
            )
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Unable to load notifications:", error);
            showMessage(
                "Could not load notification history. Check database permissions.",
                "error"
            );

            notifications = [];
            renderNotifications();
            updateSummary(null);
            return;
        }

        notifications = data || [];
        renderNotifications();
        updateSummary(count);
    }

    /* =====================================
       CHARACTER COUNTER
    ===================================== */

    message.addEventListener("input", () => {
        characterCount.textContent = message.value.length;
    });

    /* =====================================
       CLEAR FORM
    ===================================== */

    clearButton.addEventListener("click", () => {
        form.reset();
        characterCount.textContent = "0";
        showMessage("");
    });

    /* =====================================
       SEND REAL NOTIFICATION
    ===================================== */

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const notificationTitle = title.value.trim();
        const notificationBody = message.value.trim();
        const selectedType = type.value;
        const selectedRecipient = recipient.value;

        if (!notificationTitle || !notificationBody) {
            showMessage("Please enter both title and message.", "error");
            return;
        }

        if (sendButton.disabled) return;

        sendButton.disabled = true;
        sendButton.classList.add("loading");
        sendButton.textContent = "Sending...";

        try {
            const { data: sessionData, error: sessionError } =
                await client.auth.getSession();

            if (sessionError || !sessionData.session) {
                throw new Error(
                    "Your Supabase session has expired. Please log in again."
                );
            }

            const adminId = sessionData.session.user.id;

            const { data: profile, error: profileError } = await client
                .from("profiles")
                .select("role")
                .eq("id", adminId)
                .single();

            if (profileError || profile?.role !== "admin") {
                throw new Error(
                    "Your account is not authorized to send notifications."
                );
            }

            const selectedStudent =
                selectedRecipient === "all"
                    ? null
                    : students.find(
                        student => student.id === selectedRecipient
                    );

            if (selectedRecipient !== "all" && !selectedStudent) {
                throw new Error(
                    "Please select a valid student and try again."
                );
            }

            /*
             * Keep both recipient fields consistent.
             * NULL recipient means a notification for all students.
             */

            const notificationData = {
                student_id: selectedStudent?.id ?? null,
                target_student_id: selectedStudent?.id ?? null,
                title: notificationTitle,
                body: notificationBody,
                notification_type: selectedType,
                created_by: adminId
            };

            const { error: insertError } = await client
                .from("notifications")
                .insert(notificationData);

            if (insertError) {
                console.error("Notification insert failed:", insertError);
                throw new Error(insertError.message);
            }

            showMessage(
                "Notification saved successfully!",
                "success"
            );

            form.reset();
            characterCount.textContent = "0";

            await loadNotifications();

        } catch (error) {
            console.error("Send notification failed:", error);

            showMessage(
                error.message || "Unable to send notification.",
                "error"
            );
        } finally {
            sendButton.disabled = false;
            sendButton.classList.remove("loading");
            sendButton.innerHTML =
                "<span>➤</span> Send Notification";
        }
    });

    /* =====================================
       RENDER NOTIFICATIONS
    ===================================== */

    function renderNotifications() {
        tableBody.innerHTML = "";

        notifications.slice(0, 5).forEach(notification => {
            const config =
                typeConfig[notification.notification_type] ||
                typeConfig.general;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="notification-cell">
                        <div class="table-icon">
                            ${config.icon}
                        </div>
                        <div>
                            <strong>${escapeHTML(notification.title)}</strong>
                            <span>${escapeHTML(notification.body)}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="type-badge ${config.className}">
                        ${config.label}
                    </span>
                </td>
                <td>${escapeHTML(recipientLabel(notification))}</td>
                <td>${escapeHTML(formatDate(notification.created_at))}</td>
                <td>
                    <span class="status-badge sent">Saved</span>
                </td>
            `;

            tableBody.appendChild(row);
        });

        recentCount.textContent = Math.min(notifications.length, 5);
    }

    /* =====================================
       UPDATE SUMMARY
    ===================================== */

    function updateSummary(total = notifications.length) {
        totalNotifications.textContent = total ?? notifications.length;
        sentNotifications.textContent = total ?? notifications.length;

        if (unreadNotifications) {
            unreadNotifications.textContent = "—";
        }
    }

    /* =====================================
       MOBILE SIDEBAR
    ===================================== */

    if (menuButton && sidebar && overlay) {
        menuButton.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("show");
        });

        overlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("show");
        });
    }

    /* =====================================
       LOGOUT
    ===================================== */

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            await client.auth.signOut();

            sessionStorage.removeItem("pjtAdminLoggedIn");
            sessionStorage.removeItem("pjtAdminId");

            window.location.href = "login.html";
        });
    }

    /* =====================================
       INITIAL LOAD
    ===================================== */

    await loadStudents();
    await loadNotifications();
});
