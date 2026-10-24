
/* =========================================================
   PJT CLASSES - ADMIN DASHBOARD
   Complete Supabase Integration
   - Sidebar and logout
   - Real student statistics
   - Real performance statistics
   - Real fee summary
   - Real recent notifications
   - Notification count badge
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const client = window.supabaseClient;

    /* =====================================================
       1. SIDEBAR AND LOGOUT
    ===================================================== */

    const sidebar = document.getElementById("adminSidebar");
    const menuButton = document.getElementById("menuButton");
    const closeButton = document.getElementById("sidebarClose");
    const overlay = document.getElementById("sidebarOverlay");
    const logoutButton = document.getElementById("logoutButton");

    function openSidebar() {
        sidebar?.classList.add("open");
        overlay?.classList.add("show");
    }

    function closeSidebar() {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
    }

    menuButton?.addEventListener("click", openSidebar);
    closeButton?.addEventListener("click", closeSidebar);
    overlay?.addEventListener("click", closeSidebar);

    document.querySelectorAll(".admin-nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 800) {
                closeSidebar();
            }
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 800) {
            closeSidebar();
        }
    });

    logoutButton?.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to logout?")) {
            return;
        }

        try {
            if (client) {
                const { error } = await client.auth.signOut();

                if (error) {
                    throw error;
                }
            }

            sessionStorage.removeItem("pjtAdminLoggedIn");
            sessionStorage.removeItem("pjtAdminId");

            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        }
    });

    /* =====================================================
       2. HELPER FUNCTIONS
    ===================================================== */

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function formatMoney(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    function formatDate(value) {
        if (!value) {
            return "Date unavailable";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function timeAgo(value) {
        if (!value) {
            return "Date unavailable";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        const minutes = Math.max(
            0,
            Math.floor((Date.now() - date.getTime()) / 60000)
        );

        if (minutes < 1) return "Just now";

        if (minutes < 60) {
            return `${minutes} min ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        }

        const days = Math.floor(hours / 24);

        if (days < 7) {
            return `${days} day${days === 1 ? "" : "s"} ago`;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function showNotice(message, isError = false) {
        let notice = document.getElementById("adminDashboardNotice");

        if (!notice) {
            notice = document.createElement("p");
            notice.id = "adminDashboardNotice";
            notice.setAttribute("role", "status");

            document.querySelector(".admin-content")
                ?.prepend(notice);
        }

        if (notice) {
            notice.textContent = message;
            notice.style.color = isError ? "#b42318" : "";
        }
    }

    /* =====================================================
       3. REAL NOTIFICATIONS
       Reads actual notification records from Supabase.
    ===================================================== */

    async function loadNotifications() {
        const notificationList = document.querySelector(
            ".notification-card .notification-list"
        );

        const sidebarBadge = document.querySelector(
            '.admin-nav-link[href="notifications.html"] .nav-count'
        );

        const topbarBadge = document.querySelector(
            ".notification-button .notification-badge"
        );

        const badges = [
            sidebarBadge,
            topbarBadge
        ].filter(Boolean);

        badges.forEach(badge => {
            badge.textContent = "";
            badge.style.display = "none";
        });

        if (notificationList) {
            notificationList.replaceChildren();

            const loading = document.createElement("p");
            loading.textContent = "Loading notifications...";
            loading.className = "notification-loading";

            notificationList.appendChild(loading);
        }

        if (!client) {
            showNotificationMessage(
                notificationList,
                "Supabase is not connected."
            );
            return;
        }

        try {
            const {
                data: notifications,
                error,
                count
            } = await client
                .from("notifications")
                .select(
                    "id, title, body, notification_type, created_at",
                    { count: "exact" }
                )
                .order("created_at", { ascending: false })
                .limit(5);

            if (error) {
                throw error;
            }

            const rows = notifications || [];
            const totalCount = count ?? rows.length;

            // Update the notification badges.
            badges.forEach(badge => {
                badge.textContent =
                    totalCount > 0 ? String(totalCount) : "";

                badge.style.display =
                    totalCount > 0 ? "" : "none";
            });

            if (!notificationList) {
                return;
            }

            notificationList.replaceChildren();

            if (rows.length === 0) {
                showNotificationMessage(
                    notificationList,
                    "No notifications have been created yet."
                );
                return;
            }

            rows.forEach(notification => {
                const row = document.createElement("div");
                row.className = "notification-row";

                const symbol = document.createElement("div");
                symbol.className = "notification-symbol";

                const type = String(
                    notification.notification_type || "announcement"
                ).toLowerCase();

                if (type.includes("fee")) {
                    symbol.classList.add("fee");
                    symbol.textContent = "₹";
                } else if (
                    type.includes("performance") ||
                    type.includes("result")
                ) {
                    symbol.classList.add("performance");
                    symbol.textContent = "▥";
                } else {
                    symbol.classList.add("announcement");
                    symbol.textContent = "!";
                }

                const content = document.createElement("div");
                content.className = "notification-content";

                const title = document.createElement("strong");
                title.textContent =
                    notification.title || "Notification";

                const body = document.createElement("span");
                body.textContent =
                    notification.body || "No message provided.";

                const date = document.createElement("small");
                date.textContent = timeAgo(notification.created_at);
                date.title = formatDate(notification.created_at);

                content.append(title, body, date);
                row.append(symbol, content);

                notificationList.appendChild(row);
            });

            console.log("Notifications loaded:", rows.length);
        } catch (error) {
            console.error("Notification loading failed:", error);

            showNotificationMessage(
                notificationList,
                "Could not load notifications. Check Supabase permissions and column names."
            );
        }
    }

    function showNotificationMessage(container, message) {
        if (!container) return;

        container.replaceChildren();

        const paragraph = document.createElement("p");
        paragraph.className = "notification-empty";
        paragraph.textContent = message;

        container.appendChild(paragraph);
    }

    /* =====================================================
       4. LOAD STUDENTS AND PERFORMANCE STATISTICS
    ===================================================== */

    async function loadStudents() {
        const list = document.getElementById("recentStudentsList");

        try {
            const {
                data: students,
                error
            } = await client
                .from("profiles")
                .select(
                    "id, full_name, student_id, student_class, role, created_at"
                )
                .eq("role", "student")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const studentList = students || [];

            setText("totalStudentsValue", studentList.length);

            const studentIds = new Set(
                studentList.map(student => student.id).filter(Boolean)
            );

            try {
                const {
                    data: records,
                    error: performanceError
                } = await client
                    .from("performance_records")
                    .select("student_id");

                if (performanceError) throw performanceError;

                const studentsWithRecords = new Set(
                    (records || [])
                        .map(record => record.student_id)
                        .filter(id => studentIds.has(id))
                );

                setText(
                    "studentsWithRecordsValue",
                    studentsWithRecords.size
                );
            } catch (error) {
                console.error(
                    "Performance statistics failed:",
                    error
                );

                setText("studentsWithRecordsValue", "—");
            }

            if (!list) return;

            list.replaceChildren();

            if (studentList.length === 0) {
                list.textContent = "No student records found.";
                return;
            }

            studentList.slice(0, 4).forEach(student => {
                const row = document.createElement("div");
                row.className = "student-row";

                const avatar = document.createElement("div");
                avatar.className = "student-avatar";

                avatar.textContent = (student.full_name || "S")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(part => part.charAt(0))
                    .join("")
                    .toUpperCase();

                const info = document.createElement("div");
                info.className = "student-info";

                const name = document.createElement("strong");
                name.textContent =
                    student.full_name || "Unnamed student";

                const details = document.createElement("span");
                details.textContent =
                    `${student.student_id || "No student ID"} · Class ${student.student_class || "N/A"}`;

                const status = document.createElement("span");
                status.className = "student-status active";
                status.textContent = "Registered";

                info.append(name, details);
                row.append(avatar, info, status);

                list.appendChild(row);
            });
        } catch (error) {
            console.error("Unable to load students:", error);

            setText("totalStudentsValue", "—");
            setText("studentsWithRecordsValue", "—");

            if (list) {
                list.textContent =
                    "Unable to load students. Check the browser console.";
            }
        }
    }

    /* =====================================================
       5. LOAD SESSION FEE SUMMARY
       Session: March 2026 - February 2027
       Monthly fee: ₹600
    ===================================================== */

    async function loadSessionFees() {
        try {
            const {
                data: students,
                error: studentError
            } = await client
                .from("profiles")
                .select("id")
                .eq("role", "student");

            if (studentError) throw studentError;

            const {
                data: fees,
                error: feeError
            } = await client
                .from("fee_records")
                .select(
                    "student_id, description, due_date, amount, paid_amount, status"
                )
                .gte("due_date", "2026-03-01")
                .lt("due_date", "2027-03-01");

            if (feeError) throw feeError;

            const monthlyFee = 600;

            const months = [
                "March", "April", "May", "June", "July", "August",
                "September", "October", "November", "December",
                "January", "February"
            ];

            const monthlyPayments = new Map();

            (fees || []).forEach(fee => {
                const description = (fee.description || "")
                    .trim()
                    .toLowerCase();

                const month = months.find(name =>
                    description === name.toLowerCase() ||
                    description.startsWith(name.toLowerCase() + " ")
                );

                if (!month) return;

                const key = `${fee.student_id}:${month}`;
                const amount = Number(fee.amount) || monthlyFee;

                let paid = Math.min(
                    Math.max(Number(fee.paid_amount) || 0, 0),
                    amount,
                    monthlyFee
                );

                if (
                    String(fee.status || "").toLowerCase() === "paid" &&
                    paid === 0
                ) {
                    paid = Math.min(amount, monthlyFee);
                }

                monthlyPayments.set(
                    key,
                    Math.max(monthlyPayments.get(key) || 0, paid)
                );
            });

            const expectedTotal =
                (students || []).length * months.length * monthlyFee;

            const paidTotal = Math.min(
                [...monthlyPayments.values()].reduce(
                    (sum, amount) => sum + amount,
                    0
                ),
                expectedTotal
            );

            const pendingTotal = Math.max(
                expectedTotal - paidTotal,
                0
            );

            const expectedRecords =
                (students || []).length * months.length;

            const pendingRecords = Math.max(
                expectedRecords - monthlyPayments.size,
                0
            );

            const collectionPercentage = expectedTotal > 0
                ? Math.round((paidTotal / expectedTotal) * 100)
                : 0;

            setText("pendingFeeRecordsValue", pendingRecords);

            setText(
                "feeCollectionPercentage",
                `${collectionPercentage}%`
            );

            setText("feesPaidValue", formatMoney(paidTotal));
            setText("pendingFeesValue", formatMoney(pendingTotal));
            setText(
                "feesPendingBreakdownValue",
                formatMoney(pendingTotal)
            );
            setText(
                "feeOverviewPendingValue",
                formatMoney(pendingTotal)
            );

            const progress = document.getElementById(
                "feeCollectionProgress"
            );

            if (progress) {
                progress.style.width = `${collectionPercentage}%`;
            }
        } catch (error) {
            console.error("Fee summary loading failed:", error);

            setText("pendingFeesValue", "—");
            setText("pendingFeeRecordsValue", "—");
            setText("feeOverviewPendingValue", "—");
            setText("feesPaidValue", "—");
            setText("feesPendingBreakdownValue", "—");
            setText("feeCollectionPercentage", "—");
        }
    }

    /* =====================================================
       6. INITIALIZE DASHBOARD
    ===================================================== */

    if (!client) {
        showNotice(
            "Supabase is not initialized. Check js/supabase.js.",
            true
        );

        showNotificationMessage(
            document.querySelector(
                ".notification-card .notification-list"
            ),
            "Supabase is not connected."
        );

        return;
    }

    try {
        const {
            data: sessionData,
            error: sessionError
        } = await client.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData?.session) {
            window.location.href = "login.html";
            return;
        }

        await Promise.allSettled([
            loadStudents(),
            loadSessionFees(),
            loadNotifications()
        ]);

        console.log("Admin dashboard loaded successfully.");
    } catch (error) {
        console.error("Admin dashboard initialization failed:", error);

        showNotice(
            "Dashboard could not initialize. Check login and Supabase permissions.",
            true
        );
    }
});
