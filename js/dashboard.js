
/* =========================================================
   PJT CLASSES — STUDENT DASHBOARD
   Supabase Profile, Fees, Performance, Notifications & Search
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const client = window.supabaseClient;

    if (!client) {
        console.error("Supabase client is not initialized.");
        return;
    }

    let studentProfile = null;
    let feeRecords = [];
    let performanceRecords = [];
    let dashboardNotifications = [];

    const $ = selector => document.querySelector(selector);
    const byId = id => document.getElementById(id);

    const money = amount =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);

    const initials = name =>
        String(name || "Student")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word[0].toUpperCase())
            .join("");

    const formatDate = value => {
        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    /* =====================================================
       STUDENT PROFILE
    ===================================================== */

    async function loadStudentProfile() {
        const { data: sessionData, error: sessionError } =
            await client.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session) {
            window.location.href = "login.html";
            return null;
        }

        const { data: profile, error } = await client
            .from("profiles")
            .select("id, full_name, student_id, student_class, role")
            .eq("id", session.user.id)
            .maybeSingle();

        if (error) throw error;

        if (!profile) {
            throw new Error("Student profile was not found.");
        }

        if (
            String(profile.role || "").trim().toLowerCase() !== "student"
        ) {
            throw new Error("This account is not registered as a student.");
        }

        studentProfile = profile;

        const fullName = profile.full_name || "Student";
        const studentCode = profile.student_id || "ID not assigned";
        const studentClass = profile.student_class
            ? (
                String(profile.student_class)
                    .toLowerCase()
                    .startsWith("class")
                    ? String(profile.student_class)
                    : `Class ${profile.student_class}`
            )
            : "Class not assigned";

        // Update the IDs used by this dashboard, if present.
        setText("studentName", fullName);
        setText("studentDetails", `${studentClass} • ${studentCode}`);
        setText("studentAvatar", initials(fullName));
        setText("welcomeStudentName", fullName);
        setText("welcomeStudentClass", studentClass);
        setText("welcomeStudentId", studentCode);

        // Also support the data attributes used on other project pages.
        document.querySelectorAll("[data-student-name]").forEach(el => {
            el.textContent = fullName;
        });

        document.querySelectorAll("[data-student-initials]").forEach(el => {
            el.textContent = initials(fullName);
        });

        document.querySelectorAll("[data-student-id]").forEach(el => {
            el.textContent = studentCode;
        });

        document.querySelectorAll("[data-student-class]").forEach(el => {
            el.textContent = studentClass;
        });

        console.log("Student profile loaded.");

        return profile;
    }

    function setText(id, value) {
        const element = byId(id);
        if (element) element.textContent = value;
    }

    /* =====================================================
       FEE SUMMARY
    ===================================================== */

    function updateCardValue(selector, value) {
        const card = $(selector);
        if (!card) return;

        const element = card.querySelector(
            "[data-value], .fee-amount, .amount, .card-value, strong"
        );

        if (element) element.textContent = value;
    }

    async function loadFees(studentId) {
        const { data, error } = await client
            .from("fee_records")
            .select(
                "student_id, description, amount, paid_amount, status, due_date, academic_year"
            )
            .eq("student_id", studentId)
            .order("due_date", { ascending: true });

        if (error) throw error;

        feeRecords = data || [];

        const monthlyFee = 600;
        const totalFees = monthlyFee * 12;

        const paidAmount = feeRecords.reduce((sum, fee) => {
            const amount = Math.max(Number(fee.paid_amount) || 0, 0);
            const status = String(fee.status || "").toLowerCase();

            // Compatibility with legacy records marked paid but with
            // an empty paid_amount field.
            if (status === "paid" && amount === 0) {
                return sum + Math.max(Number(fee.amount) || monthlyFee, 0);
            }

            return sum + amount;
        }, 0);

        const pendingAmount = Math.max(0, totalFees - paidAmount);

        updateCardValue(".total-fee", money(totalFees));
        updateCardValue(".paid-fee", money(paidAmount));
        updateCardValue(".pending-fee", money(pendingAmount));

        renderFeeRows(feeRecords);

        console.log("Fee records loaded:", feeRecords.length);
        console.log("Fee totals:", {
            totalFees,
            paidAmount,
            pendingAmount
        });
    }

    function getFeeStatus(fee) {
        const amount = Number(fee.amount) || 0;
        let paid = Math.max(Number(fee.paid_amount) || 0, 0);
        const databaseStatus = String(fee.status || "")
            .trim()
            .toLowerCase();

        if (databaseStatus === "paid" && paid === 0) {
            paid = amount;
        }

        if (amount > 0 && paid >= amount) {
            return { label: "Paid", className: "paid" };
        }

        if (paid > 0) {
            return { label: "Partially Paid", className: "pending" };
        }

        if (databaseStatus === "partial" ||
            databaseStatus === "partially paid") {
            return { label: "Partially Paid", className: "pending" };
        }

        return { label: "Pending", className: "pending" };
    }

    function getFeeDescription(fee) {
        if (fee.description && fee.description.trim()) {
            return fee.description.trim();
        }

        if (fee.due_date) {
            const date = new Date(`${fee.due_date}T00:00:00`);

            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric"
                });
            }
        }

        return "Fee";
    }

    function renderFeeRows(records) {
        const table = $(".fees-card .fee-table");
        if (!table) return;

        table.querySelectorAll(".fee-row:not(.fee-head)")
            .forEach(row => row.remove());

        if (!records.length) {
            const row = document.createElement("div");
            row.className = "fee-row";

            const message = document.createElement("span");
            message.textContent = "No fee records found.";
            message.style.gridColumn = "1 / -1";

            row.appendChild(message);
            table.appendChild(row);
            return;
        }

        records.forEach(fee => {
            const row = document.createElement("div");
            row.className = "fee-row";

            const description = document.createElement("span");
            description.textContent = getFeeDescription(fee);

            const amount = document.createElement("span");
            amount.textContent = money(fee.amount);

            const status = getFeeStatus(fee);
            const statusElement = document.createElement("b");

            statusElement.className = `status ${status.className}`;
            statusElement.textContent = status.label;
            statusElement.title = fee.due_date
                ? `Due date: ${formatDate(fee.due_date)}`
                : status.label;

            row.append(description, amount, statusElement);
            table.appendChild(row);
        });
    }

    /* =====================================================
       ACADEMIC PERFORMANCE
    ===================================================== */

    async function loadPerformance(studentId) {
        const { data, error } = await client
            .from("performance_records")
            .select(
                "id, student_id, subject, assessment_name, marks_obtained, max_marks, exam_date, remarks"
            )
            .eq("student_id", studentId)
            .order("exam_date", { ascending: false });

        if (error) throw error;

        performanceRecords = data || [];

        const subjects = {};

        performanceRecords.forEach(record => {
            const subject = (record.subject || "Other").trim();

            if (!subjects[subject]) {
                subjects[subject] = {
                    marks: 0,
                    maximum: 0,
                    count: 0
                };
            }

            subjects[subject].marks +=
                Number(record.marks_obtained) || 0;

            subjects[subject].maximum +=
                Number(record.max_marks) || 0;

            subjects[subject].count += 1;
        });

        renderPerformanceSubjects(subjects);

        console.log("Performance records loaded:", performanceRecords.length);
    }

    function getSubjectIconClass(subject) {
        const name = subject.toLowerCase();

        if (name.includes("math") || name.includes("algebra")) {
            return "maths";
        }

        if (name.includes("science")) return "science";

        if (name.includes("english") || name.includes("language")) {
            return "english";
        }

        return "social";
    }

    function getSubjectIcon(subject) {
        const name = subject.toLowerCase();

        if (name.includes("math")) return "∑";
        if (name.includes("science")) return "S";
        if (name.includes("english")) return "A";

        return subject.trim().charAt(0).toUpperCase() || "S";
    }

    function renderPerformanceSubjects(subjects) {
        const container = $(".performance-card .subjects");
        if (!container) return;

        container.replaceChildren();

        const entries = Object.entries(subjects);

        if (!entries.length) {
            const message = document.createElement("p");
            message.textContent = "No performance records available yet.";
            container.appendChild(message);
            return;
        }

        entries.forEach(([subject, result]) => {
            const percentage = result.maximum > 0
                ? (result.marks / result.maximum) * 100
                : null;

            const row = document.createElement("div");
            row.className = "subject";

            const icon = document.createElement("div");
            icon.className = `subject-icon ${getSubjectIconClass(subject)}`;
            icon.textContent = getSubjectIcon(subject);

            const middle = document.createElement("div");
            middle.className = "subject-middle";

            const top = document.createElement("div");
            top.className = "subject-top";

            const subjectName = document.createElement("strong");
            subjectName.textContent = subject;

            const score = document.createElement("b");
            score.textContent = percentage === null
                ? "No marks"
                : `${Number(percentage.toFixed(1))}%`;

            top.append(subjectName, score);

            const progressBar = document.createElement("div");
            progressBar.className = "progress-bar";

            const progress = document.createElement("span");
            const safePercentage = percentage === null
                ? 0
                : Math.min(100, Math.max(0, percentage));

            progress.style.width = `${safePercentage}%`;
            progress.setAttribute("aria-valuenow", String(Math.round(safePercentage)));
            progress.setAttribute("aria-valuemin", "0");
            progress.setAttribute("aria-valuemax", "100");

            progressBar.appendChild(progress);
            middle.append(top, progressBar);
            row.append(icon, middle);
            container.appendChild(row);
        });
    }

    /* =====================================================
       LIVE NOTIFICATIONS AND BADGES
    ===================================================== */

    function updateDashboardNotificationBadges(count) {
        const selectors = [
            ".notification-nav-icon b",
            "#notificationButton span",
            ".mobile-alert b",
            ".notification-badge",
            ".notification-button span"
        ];

        const found = new Set();

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(badge => {
                if (found.has(badge)) return;
                found.add(badge);

                badge.textContent = String(count);
                badge.style.display = count > 0 ? "" : "none";
            });
        });

        const button = byId("notificationButton");

        if (button) {
            button.setAttribute(
                "aria-label",
                count > 0
                    ? `Notifications, ${count} unread`
                    : "Notifications"
            );
        }
    }

    function notificationIcon(type) {
        const value = String(type || "").toLowerCase();

        if (value.includes("fee") || value.includes("payment")) {
            return { symbol: "₹", color: "red" };
        }

        if (value.includes("test") || value.includes("performance")) {
            return { symbol: "✓", color: "blue" };
        }

        if (value.includes("study") || value.includes("material")) {
            return { symbol: "★", color: "orange" };
        }

        if (value.includes("announcement") || value.includes("class")) {
            return { symbol: "i", color: "blue" };
        }

        return { symbol: "!", color: "orange" };
    }

    function relativeNotificationDate(value) {
        if (!value) return "";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";

        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes} min ago`;

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
        }

        const days = Math.floor(hours / 24);

        if (days === 1) return "Yesterday";
        if (days < 7) return `${days} days ago`;

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
        });
    }

    function renderDashboardNotifications() {
        const list = $(".notifications-card .notification-list");
        if (!list) return;

        list.replaceChildren();

        if (!dashboardNotifications.length) {
            const empty = document.createElement("p");
            empty.className = "dashboard-notification-empty";
            empty.textContent = "You have no notifications yet.";
            list.appendChild(empty);
            return;
        }

        dashboardNotifications.slice(0, 4).forEach(notification => {
            const item = document.createElement("a");
            item.href = "notifications.html";
            item.className = "notification";

            if (notification.unread) {
                item.classList.add("unread");
            }

            const iconInfo = notificationIcon(notification.type);

            const icon = document.createElement("span");
            icon.className = `notification-icon ${iconInfo.color}`;
            icon.textContent = iconInfo.symbol;

            const content = document.createElement("span");
            content.className = "notification-content";

            const title = document.createElement("strong");
            title.textContent = notification.title || "Notification";

            const body = document.createElement("small");
            body.textContent = notification.body || "You have a new update.";

            const date = document.createElement("em");
            date.textContent = relativeNotificationDate(notification.created_at);

            const arrow = document.createElement("span");
            arrow.className = "notification-arrow";
            arrow.textContent = "→";

            content.append(title, body, date);
            item.append(icon, content, arrow);
            list.appendChild(item);
        });
    }

    async function loadDashboardNotifications(userId) {
        const list = $(".notifications-card .notification-list");

        try {
            const { data: rows, error } = await client
                .from("notifications")
                .select(
                    "id, student_id, target_student_id, title, body, notification_type, created_at"
                )
                .order("created_at", { ascending: false });

            if (error) throw error;

            const relevantRows = (rows || []).filter(notification => {
                const recipients = [
                    notification.student_id,
                    notification.target_student_id
                ].filter(value =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                );

                // An empty recipient means the notification is a broadcast.
                if (recipients.length === 0) return true;

                return recipients.some(
                    recipient => String(recipient) === String(userId)
                );
            });

            const { data: readRows, error: readError } = await client
                .from("notification_reads")
                .select("notification_id")
                .eq("student_id", userId);

            if (readError) throw readError;

            const readIds = new Set(
                (readRows || []).map(row => String(row.notification_id))
            );

            dashboardNotifications = relevantRows.map(row => ({
                id: row.id,
                type: row.notification_type || "general",
                title: row.title || "Notification",
                body: row.body || "",
                created_at: row.created_at,
                unread: !readIds.has(String(row.id))
            }));

            const unreadCount = dashboardNotifications.filter(
                item => item.unread
            ).length;

            updateDashboardNotificationBadges(unreadCount);
            renderDashboardNotifications();

        } catch (error) {
            console.error("Unable to load dashboard notifications:", error);

            updateDashboardNotificationBadges(0);

            if (list) {
                list.replaceChildren();

                const message = document.createElement("p");
                message.className = "dashboard-notification-empty";
                message.textContent =
                    "Notifications could not be loaded. Please refresh the page.";

                list.appendChild(message);
            }
        }
    }

    /* =====================================================
       DASHBOARD CARD ORDER
       Row 1: Fee Status + Recent Notifications
       Row 2: Behaviour + Academic Performance
    ===================================================== */

    function reorderDashboardCards() {
        const grid = $(".dashboard-grid");
        if (!grid) return;

        const selectors = [
            ".fees-card",
            ".notifications-card",
            ".behaviour-card",
            ".performance-card"
        ];

        selectors.forEach(selector => {
            const card = grid.querySelector(selector);
            if (card) grid.appendChild(card);
        });
    }

    /* =====================================================
       SIDEBAR AND MOBILE NAVIGATION
    ===================================================== */

    const sidebar = byId("sidebar");
    const mobileMenu = byId("mobileMenu");
    const sidebarClose = byId("sidebarClose");
    const sidebarOverlay = byId("sidebarOverlay");

    function openSidebar() {
        if (!sidebar) return;

        sidebar.classList.add("open");
        sidebarOverlay?.classList.add("show");
        mobileMenu?.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sidebar?.classList.remove("open");
        sidebarOverlay?.classList.remove("show");
        mobileMenu?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    mobileMenu?.addEventListener("click", event => {
        event.stopPropagation();

        if (sidebar?.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    sidebarClose?.addEventListener("click", closeSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    /* =====================================================
       SEARCH
    ===================================================== */

    const searchInput = byId("dashboardSearch");
    const searchClear = byId("searchClear");
    const searchResults = byId("searchResults");
    const searchContainer = byId("searchContainer");

    function buildSearchData() {
        const data = [];

        if (studentProfile) {
            data.push({
                title: "Student Dashboard",
                description:
                    `${studentProfile.full_name || "Student"} • ` +
                    `${studentProfile.student_class || "Class not assigned"} • ` +
                    `${studentProfile.student_id || "ID not assigned"}`,
                target: ".welcome-card"
            });
        }

        const total = 600 * 12;

        const paid = feeRecords.reduce((sum, fee) => {
            const value = Math.max(Number(fee.paid_amount) || 0, 0);
            const status = String(fee.status || "").toLowerCase();

            if (status === "paid" && value === 0) {
                return sum + Math.max(Number(fee.amount) || 600, 0);
            }

            return sum + value;
        }, 0);

        data.push(
            {
                title: "Total Fees",
                description: `Total fees: ${money(total)}`,
                target: ".total-fee"
            },
            {
                title: "Paid Fees",
                description: `Paid amount: ${money(paid)}`,
                target: ".paid-fee"
            },
            {
                title: "Pending Fees",
                description: `Pending amount: ${money(Math.max(0, total - paid))}`,
                target: ".pending-fee"
            }
        );

        performanceRecords.forEach(record => {
            const marks = Number(record.marks_obtained) || 0;
            const maximum = Number(record.max_marks) || 0;

            const percentage = maximum > 0
                ? `${((marks / maximum) * 100).toFixed(1)}%`
                : "Percentage unavailable";

            data.push({
                title: record.subject || "Subject",
                description:
                    `${record.assessment_name || "Assessment"}: ` +
                    `${marks}/${maximum} (${percentage})`,
                target: ".performance-card"
            });
        });

        feeRecords.forEach(fee => {
            data.push({
                title: getFeeDescription(fee),
                description:
                    `${money(fee.amount)} — ${getFeeStatus(fee).label}`,
                target: ".fees-card"
            });
        });

        dashboardNotifications.forEach(notification => {
            data.push({
                title: notification.title,
                description: notification.body,
                target: ".notifications-card"
            });
        });

        return data;
    }

    function performSearch() {
        if (!searchInput || !searchResults) return;

        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            hideSearchResults();
            return;
        }

        searchContainer?.classList.add("searching");

        const words = query.split(/\s+/).filter(Boolean);

        const matches = buildSearchData().filter(item => {
            const text =
                `${item.title} ${item.description}`.toLowerCase();

            return words.every(word => text.includes(word));
        });

        renderSearchResults(matches);
    }

    function renderSearchResults(matches) {
        if (!searchResults) return;

        searchResults.replaceChildren();

        if (!matches.length) {
            const empty = document.createElement("div");
            empty.className = "search-empty";
            empty.textContent = "No matching information found.";

            searchResults.appendChild(empty);
            searchResults.classList.add("show");
            return;
        }

        matches.slice(0, 8).forEach(item => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "search-result";

            const icon = document.createElement("span");
            icon.className = "search-result-icon";
            icon.textContent =
                item.title.toLowerCase().includes("fee") ? "₹" : "Σ";

            const text = document.createElement("span");
            text.className = "search-result-text";

            const title = document.createElement("strong");
            title.textContent = item.title;

            const description = document.createElement("span");
            description.textContent = item.description;

            text.append(title, description);
            button.append(icon, text);

            button.addEventListener("click", () => {
                const element = document.querySelector(item.target);

                hideSearchResults();

                if (searchInput) {
                    searchInput.value = "";
                    searchInput.blur();
                }

                searchContainer?.classList.remove("searching");

                if (!element) return;

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                element.classList.add("search-highlight");

                setTimeout(() => {
                    element.classList.remove("search-highlight");
                }, 1600);
            });

            searchResults.appendChild(button);
        });

        searchResults.classList.add("show");
    }

    function hideSearchResults() {
        searchResults?.classList.remove("show");
        searchContainer?.classList.remove("searching");
    }

    function clearSearch() {
        if (!searchInput) return;

        searchInput.value = "";
        hideSearchResults();
        searchInput.focus();
    }

    searchInput?.addEventListener("input", performSearch);
    searchClear?.addEventListener("click", clearSearch);

    searchInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchResults?.querySelector(".search-result")?.click();
        }

        if (event.key === "Escape") hideSearchResults();
    });

    document.addEventListener("click", event => {
        if (
            searchContainer &&
            !searchContainer.contains(event.target)
        ) {
            hideSearchResults();
        }
    });

    byId("notificationButton")?.addEventListener("click", () => {
        window.location.href = "notifications.html";
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSidebar();
            hideSearchResults();
        }
    });

    /* =====================================================
       INITIALIZE DASHBOARD
    ===================================================== */

    async function initializeDashboard() {
        try {
            const profile = await loadStudentProfile();

            if (!profile) return;

            reorderDashboardCards();

            const results = await Promise.allSettled([
                loadFees(profile.id),
                loadPerformance(profile.id),
                loadDashboardNotifications(profile.id)
            ]);

            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    const section = [
                        "fees",
                        "performance",
                        "notifications"
                    ][index];

                    console.error(
                        `Unable to load ${section}:`,
                        result.reason
                    );
                }
            });

            if (results.every(result => result.status === "fulfilled")) {
                console.log("Student dashboard data loaded successfully.");
            } else {
                console.warn(
                    "Dashboard loaded, but some sections could not be retrieved."
                );
            }

        } catch (error) {
            console.error("Dashboard loading error:", error);

            setText("studentName", "Unable to load profile");
            setText(
                "studentDetails",
                "Please refresh or contact your administrator."
            );
        }
    }

    initializeDashboard();
});
