/* =========================================================
   PJT CLASSES — STUDENT DASHBOARD
   Live Supabase Profile, Fees, Performance and Search
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

    const $ = (selector) => document.querySelector(selector);
    const byId = (id) => document.getElementById(id);

    const money = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);

    const initials = (name) =>
        String(name || "Student")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0].toUpperCase())
            .join("");

    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
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
            .single();

        if (error) throw error;

        if (profile.role !== "student") {
            throw new Error(
                "This account is not registered as a student."
            );
        }

        studentProfile = profile;

        const fullName = profile.full_name || "Student";
        const studentId = profile.student_id || "ID not assigned";
        const studentClass =
            profile.student_class || "Class not assigned";

        if (byId("studentName")) {
            byId("studentName").textContent = fullName;
        }

        if (byId("studentDetails")) {
            byId("studentDetails").textContent =
                `${studentClass} • ${studentId}`;
        }

        if (byId("studentAvatar")) {
            byId("studentAvatar").textContent = initials(fullName);
        }

        if (byId("welcomeStudentName")) {
            byId("welcomeStudentName").textContent = fullName;
        }

        if (byId("welcomeStudentClass")) {
            byId("welcomeStudentClass").textContent = studentClass;
        }

        if (byId("welcomeStudentId")) {
            byId("welcomeStudentId").textContent = studentId;
        }

        console.log("Student profile loaded.");

        return profile;
    }

    /* =====================================================
       FEE SUMMARY CARDS
    ===================================================== */

    function updateCardValue(selector, value) {
        const card = $(selector);
        if (!card) return;

        const valueElement = card.querySelector(
            "[data-value], .fee-amount, .amount, .card-value, strong"
        );

        if (valueElement) {
            valueElement.textContent = value;
        }
    }

    /* =====================================================
       LOAD AND DISPLAY REAL FEE RECORDS
    ===================================================== */

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

    // Annual fee structure: ₹600 per month × 12 months.
    const monthlyFee = 600;
    const totalFees = monthlyFee * 12;

    // Calculate the actual amount paid from Supabase.
    const paidAmount = feeRecords.reduce(
        (sum, fee) => {
            const paid = Math.max(Number(fee.paid_amount) || 0, 0);
            return sum + paid;
        },
        0
    );

    // Never show a negative pending balance.
    const pendingAmount = Math.max(0, totalFees - paidAmount);

    // Update only the existing fee summary cards.
    updateCardValue(".total-fee", money(totalFees));
    updateCardValue(".paid-fee", money(paidAmount));
    updateCardValue(".pending-fee", money(pendingAmount));

    // Keep the existing fee table and search data working.
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
        const paid = Number(fee.paid_amount) || 0;
        const databaseStatus = String(fee.status || "")
            .trim()
            .toLowerCase();

        if (amount > 0 && paid >= amount) {
            return { label: "Paid", className: "paid" };
        }

        if (paid > 0 && paid < amount) {
            return { label: "Partially Paid", className: "pending" };
        }

        if (databaseStatus === "paid") {
            return { label: "Paid", className: "paid" };
        }

        if (
            databaseStatus === "partial" ||
            databaseStatus === "partially paid"
        ) {
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
        // Actual HTML uses .fees-card > .fee-table.
        const table = $(".fees-card .fee-table");

        if (!table) {
            console.warn("Fee table container was not found.");
            return;
        }

        // Keep the existing Month / Amount / Status header.
        table.querySelectorAll(".fee-row:not(.fee-head)")
            .forEach((row) => row.remove());

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

        records.forEach((fee) => {
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
       LOAD AND DISPLAY REAL ACADEMIC PERFORMANCE
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

        // Group assessments by subject and calculate actual percentages.
        const subjects = {};

        performanceRecords.forEach((record) => {
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

        console.log(
            "Performance records loaded:",
            performanceRecords.length
        );

        console.log("Calculated subject performance:", subjects);
    }

    function getSubjectIconClass(subject) {
        const name = subject.toLowerCase();

        if (
            name.includes("math") ||
            name.includes("algebra")
        ) {
            return "maths";
        }

        if (name.includes("science")) {
            return "science";
        }

        if (
            name.includes("english") ||
            name.includes("language")
        ) {
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
        // Actual HTML uses .performance-card > .subjects.
        const container = $(".performance-card .subjects");

        if (!container) {
            console.warn("Performance subjects container was not found.");
            return;
        }

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
            icon.className =
                `subject-icon ${getSubjectIconClass(subject)}`;
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
                : `${percentage.toFixed(percentage % 1 ? 1 : 0)}%`;

            top.append(subjectName, score);

            const progressBar = document.createElement("div");
            progressBar.className = "progress-bar";

            const progress = document.createElement("span");

            const safePercentage = percentage === null
                ? 0
                : Math.min(100, Math.max(0, percentage));

            progress.style.width = `${safePercentage}%`;
            progress.setAttribute(
                "aria-valuenow",
                String(Math.round(safePercentage))
            );
            progress.setAttribute("aria-valuemin", "0");
            progress.setAttribute("aria-valuemax", "100");

            progressBar.appendChild(progress);
            middle.append(top, progressBar);
            row.append(icon, middle);
            container.appendChild(row);
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

    mobileMenu?.addEventListener("click", (event) => {
        event.stopPropagation();

        if (sidebar?.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    sidebarClose?.addEventListener("click", closeSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    /* =====================================================
       SEARCH — USE LIVE PROFILE, FEE AND PERFORMANCE DATA
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

        const total = feeRecords.reduce(
            (sum, fee) => sum + (Number(fee.amount) || 0),
            0
        );

        const paid = feeRecords.reduce(
            (sum, fee) => sum + (Number(fee.paid_amount) || 0),
            0
        );

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

        performanceRecords.forEach((record) => {
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

        feeRecords.forEach((fee) => {
            data.push({
                title: getFeeDescription(fee),
                description:
                    `${money(fee.amount)} — ${getFeeStatus(fee).label}`,
                target: ".fees-card"
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

        const matches = buildSearchData().filter((item) => {
            const text =
                `${item.title} ${item.description}`.toLowerCase();

            return words.every((word) => text.includes(word));
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

        matches.slice(0, 8).forEach((item) => {
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
                searchInput.value = "";
                searchContainer?.classList.remove("searching");

                if (!element) return;

                searchInput.blur();

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
    }

    function clearSearch() {
        if (!searchInput) return;

        searchInput.value = "";
        hideSearchResults();
        searchContainer?.classList.remove("searching");
        searchInput.focus();
    }

    searchInput?.addEventListener("input", performSearch);
    searchClear?.addEventListener("click", clearSearch);

    searchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchResults?.querySelector(".search-result")?.click();
        }

        if (event.key === "Escape") {
            hideSearchResults();
        }
    });

    document.addEventListener("click", (event) => {
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

    document.addEventListener("keydown", (event) => {
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

            // The user was redirected to login if no session exists.
            if (!profile) return;

            // Each query uses the logged-in student's profile UUID.
            const results = await Promise.allSettled([
                loadFees(profile.id),
                loadPerformance(profile.id)
            ]);

            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    const section = index === 0 ? "fees" : "performance";

                    console.error(
                        `Unable to load ${section}:`,
                        result.reason
                    );
                }
            });

            if (results.every((result) => result.status === "fulfilled")) {
                console.log("Student dashboard data loaded successfully.");
            } else {
                console.warn(
                    "Dashboard loaded with one or more data sections unavailable."
                );
            }
        } catch (error) {
            console.error("Dashboard loading error:", error);

            if (byId("studentName")) {
                byId("studentName").textContent = "Unable to load profile";
            }

            if (byId("studentDetails")) {
                byId("studentDetails").textContent =
                    "Please refresh or contact your administrator.";
            }
        }
    }

    initializeDashboard();
});