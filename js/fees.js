
/* =====================================================
   PJT CLASSES — STUDENT FEES DASHBOARD
   Matches the supplied student/fees.html
   Academic session: March 2026 – February 2027
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const client =
        window.supabaseClient ||
        (typeof supabaseClient !== "undefined" ? supabaseClient : null);

    const MONTHLY_FEE = 600;
    const START_YEAR = 2026;
    const TOTAL_MONTHS = 12;
    const ANNUAL_FEE = MONTHLY_FEE * TOTAL_MONTHS;

    const months = [
        "March", "April", "May", "June",
        "July", "August", "September", "October",
        "November", "December", "January", "February"
    ];

    const $ = id => document.getElementById(id);

    const money = value =>
        `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

    /* =====================================================
       MOBILE SIDEBAR AND NAVIGATION
    ===================================================== */

    const sidebar = $("sidebar");
    const overlay = $("sidebarOverlay");

    function closeSidebar() {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
        document.body.style.overflow = "";
    }

    $("mobileMenu")?.addEventListener("click", () => {
        sidebar?.classList.add("open");
        overlay?.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    $("sidebarClose")?.addEventListener("click", closeSidebar);
    overlay?.addEventListener("click", closeSidebar);

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeSidebar();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    $("notificationButton")?.addEventListener("click", () => {
        window.location.href = "notifications.html";
    });

    /* =====================================================
       LOAD AUTHENTICATED STUDENT PROFILE
    ===================================================== */

    async function loadStudentProfile(user) {
        const { data: profile, error } = await client
            .from("profiles")
            .select("id, full_name, email, student_id, student_class, role")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            throw new Error("Profile loading failed: " + error.message);
        }

        if (!profile) {
            throw new Error("No profile was found for your account.");
        }

        if (String(profile.role || "").toLowerCase() !== "student") {
            throw new Error("This account is not registered as a student.");
        }

        const name = String(
            profile.full_name || user.email || "Student"
        ).trim();

        const studentCode = profile.student_id || "ID not assigned";

        const rawClass = profile.student_class;
        const className = rawClass
            ? (
                String(rawClass).toLowerCase().startsWith("class")
                    ? String(rawClass)
                    : `Class ${rawClass}`
            )
            : "Class not assigned";

        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join("");

        // Exact data attributes used in your fees.html.
        document.querySelectorAll("[data-student-name]").forEach(el => {
            el.textContent = name;
        });

        document.querySelectorAll("[data-student-initials]").forEach(el => {
            el.textContent = initials;
        });

        document.querySelectorAll("[data-student-id]").forEach(el => {
            el.textContent = studentCode;
        });

        document.querySelectorAll("[data-student-class]").forEach(el => {
            el.textContent = className;
        });

        console.log("Student profile loaded:", {
            name,
            studentCode,
            className
        });

        return profile;
    }

    /* =====================================================
       UNREAD NOTIFICATION BADGES
    ===================================================== */

    function updateNotificationBadges(count) {
        document.querySelectorAll(
            ".notification-badge, .notification-button span"
        ).forEach(badge => {
            badge.textContent = String(count);
            badge.style.display = count > 0 ? "" : "none";
        });
    }

    async function loadUnreadNotifications(userId) {
        try {
            const { data: notifications, error } = await client
                .from("notifications")
                .select("id, student_id, target_student_id");

            if (error) throw error;

            const relevant = (notifications || []).filter(item => {
                const targets = [
                    item.student_id,
                    item.target_student_id
                ].filter(value => value !== null && value !== undefined);

                // No target means a broadcast to all students.
                if (targets.length === 0) return true;

                return targets.some(
                    value => String(value) === String(userId)
                );
            });

            if (relevant.length === 0) {
                updateNotificationBadges(0);
                return;
            }

            const { data: reads, error: readsError } = await client
                .from("notification_reads")
                .select("notification_id")
                .eq("student_id", userId);

            if (readsError) throw readsError;

            const readIds = new Set(
                (reads || []).map(row => String(row.notification_id))
            );

            const unreadCount = relevant.filter(
                item => !readIds.has(String(item.id))
            ).length;

            updateNotificationBadges(unreadCount);
        } catch (error) {
            console.error("Notification count error:", error.message);

            // Do not leave the hardcoded demo count visible.
            updateNotificationBadges(0);
        }
    }

    /* =====================================================
       LOAD STUDENT FEE RECORDS
    ===================================================== */

    async function loadFeeRecords(userId) {
        const { data, error } = await client
            .from("fee_records")
            .select(
                "id, student_id, description, amount, due_date, paid_amount, status, academic_year"
            )
            .eq("student_id", userId)
            .order("due_date", { ascending: true });

        if (error) {
            throw new Error("Fee records loading failed: " + error.message);
        }

        console.log("Fee records from Supabase:", data);
        return data || [];
    }

    /* =====================================================
       BUILD THE 12-MONTH FEE SCHEDULE
    ===================================================== */

    function buildMonthlyRecords(records) {
        return months.map((month, index) => {
            const monthNumber = ((index + 2) % 12) + 1;
            const year = index < 10 ? START_YEAR : START_YEAR + 1;

            const monthRecords = records.filter(record => {
                if (!record.due_date) return false;

                const [recordYear, recordMonth] = String(record.due_date)
                    .slice(0, 10)
                    .split("-")
                    .map(Number);

                return recordYear === year && recordMonth === monthNumber;
            });

            const dueAmount = monthRecords.length
                ? monthRecords.reduce((sum, record) => {
                    const amount = Number(record.amount);
                    return sum + (amount > 0 ? amount : MONTHLY_FEE);
                }, 0)
                : MONTHLY_FEE;

            const paidAmount = Math.min(
                dueAmount,
                monthRecords.reduce((sum, record) => {
                    const recordAmount = Number(record.amount) > 0
                        ? Number(record.amount)
                        : MONTHLY_FEE;

                    const recordedPaid = Math.max(
                        0,
                        Number(record.paid_amount) || 0
                    );

                    /*
                     * Compatibility for older admin records:
                     * status=paid with no paid_amount means the
                     * full recorded fee was paid.
                     */
                    const effectivePaid =
                        String(record.status || "").toLowerCase() === "paid"
                        && recordedPaid === 0
                            ? recordAmount
                            : recordedPaid;

                    return sum + Math.min(effectivePaid, recordAmount);
                }, 0)
            );

            let status;

            if (monthRecords.length === 0) {
                status = "no-record";
            } else if (paidAmount >= dueAmount && dueAmount > 0) {
                status = "paid";
            } else if (paidAmount > 0) {
                status = "partial";
            } else {
                status = "pending";
            }

            return {
                month,
                year,
                records: monthRecords,
                dueAmount,
                paidAmount,
                outstanding: Math.max(0, dueAmount - paidAmount),
                status
            };
        });
    }

    /* =====================================================
       UPDATE SUMMARY CARDS AND PROGRESS BAR
    ===================================================== */

    function renderSummary(monthlyRecords) {
        const paidAmount = monthlyRecords.reduce(
            (sum, item) => sum + item.paidAmount,
            0
        );

        const pendingAmount = monthlyRecords.reduce(
            (sum, item) => sum + item.outstanding,
            0
        );

        const paidMonths = monthlyRecords.filter(
            item => item.status === "paid"
        ).length;

        // Includes months without a fee record.
        const pendingMonths = monthlyRecords.filter(
            item => item.status !== "paid"
        ).length;

        const missingRecords = monthlyRecords.filter(
            item => item.status === "no-record"
        ).length;

        const percentage = Math.min(
            100,
            Math.round((paidAmount / ANNUAL_FEE) * 100)
        );

        if ($("annualFee")) {
            $("annualFee").textContent = money(ANNUAL_FEE);
        }

        if ($("paidAmount")) {
            $("paidAmount").textContent = money(paidAmount);
        }

        if ($("pendingAmount")) {
            $("pendingAmount").textContent = money(pendingAmount);
        }

        if ($("paidMonths")) {
            $("paidMonths").textContent =
                `${paidMonths} month${paidMonths === 1 ? "" : "s"} paid`;
        }

        if ($("pendingMonths")) {
            $("pendingMonths").textContent =
                `${pendingMonths} month${pendingMonths === 1 ? "" : "s"} pending`;
        }

        if ($("paymentPercentage")) {
            $("paymentPercentage").textContent = `${percentage}%`;
        }

        if ($("progressPaid")) {
            $("progressPaid").textContent = money(paidAmount);
        }

        const progress = $("largeProgressBar");

        if (progress) {
            progress.style.width = `${percentage}%`;
            progress.setAttribute("aria-valuenow", String(percentage));
        }

        return {
            paidAmount,
            pendingAmount,
            paidMonths,
            pendingMonths,
            missingRecords,
            percentage
        };
    }

    /* =====================================================
       MONTHLY TABLE
       Due Amount = REMAINING BALANCE
    ===================================================== */

    function renderMonthlyTable(monthlyRecords) {
        const tableBody = $("feeTableBody");
        if (!tableBody) return;

        tableBody.replaceChildren();

        const labels = {
            paid: "Paid",
            pending: "Pending",
            partial: "Partial",
            "no-record": "No record"
        };

        monthlyRecords.forEach((item, index) => {
            const row = document.createElement("tr");

            const values = [
                String(index + 1).padStart(2, "0"),
                `${item.month} ${item.year}`,
                money(item.outstanding),
                money(item.paidAmount)
            ];

            values.forEach((value, columnIndex) => {
                const cell = document.createElement("td");
                const span = document.createElement("span");

                span.className = [
                    "month-number",
                    "month-name",
                    "amount",
                    "amount"
                ][columnIndex];

                span.textContent = value;
                cell.appendChild(span);
                row.appendChild(cell);
            });

            const statusCell = document.createElement("td");
            const statusSpan = document.createElement("span");

            const statusClass = item.status === "paid"
                ? "paid"
                : item.status === "no-record"
                    ? "no-record"
                    : "pending";

            statusSpan.className = `status ${statusClass}`;

            const dot = document.createElement("span");
            dot.className = "status-dot-small";

            statusSpan.append(
                dot,
                document.createTextNode(labels[item.status])
            );

            statusCell.appendChild(statusSpan);
            row.appendChild(statusCell);
            tableBody.appendChild(row);
        });
    }

    /* =====================================================
       FEE ALERT
    ===================================================== */

    function renderFeeAlert(monthlyRecords, summary) {
        const alertBox = $("feeAlert");
        const alertText = $("feeAlertText");

        if (!alertBox || !alertText) return;

        if (summary.pendingAmount === 0 && summary.missingRecords === 0) {
            alertBox.style.display = "none";
            return;
        }

        alertBox.style.display = "";

        const pending = monthlyRecords
            .filter(item => item.status === "pending" || item.status === "partial")
            .map(item => `${item.month} ${item.year}`);

        const missing = monthlyRecords
            .filter(item => item.status === "no-record")
            .map(item => `${item.month} ${item.year}`);

        const messages = [];

        if (summary.pendingAmount > 0) {
            messages.push(
                `Your outstanding fee balance is ${money(summary.pendingAmount)}.`
            );
        }

        if (pending.length) {
            messages.push(`Payment pending or partial for: ${pending.join(", ")}.`);
        }

        if (missing.length) {
            messages.push(`No fee record found for: ${missing.join(", ")}.`);
        }

        messages.push(
            "Please contact PJT Classes administration to confirm your fee records."
        );

        alertText.textContent = messages.join(" ");
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */

    try {
        if (!client) {
            throw new Error(
                "Supabase client not found. Check ../js/supabase.js."
            );
        }

        const { data: authData, error: authError } =
            await client.auth.getUser();

        if (authError) throw authError;

        if (!authData.user) {
            window.location.href = "login.html";
            return;
        }

        const user = authData.user;

        await loadStudentProfile(user);
        await loadUnreadNotifications(user.id);

        const records = await loadFeeRecords(user.id);
        const monthlyRecords = buildMonthlyRecords(records);
        const summary = renderSummary(monthlyRecords);

        renderMonthlyTable(monthlyRecords);
        renderFeeAlert(monthlyRecords, summary);

        console.log("Fee dashboard summary:", {
            session: "March 2026 – February 2027",
            annualFee: ANNUAL_FEE,
            ...summary
        });
    } catch (error) {
        console.error("Fees page error:", error);

        const alertBox = $("feeAlert");
        const alertText = $("feeAlertText");

        if (alertBox) alertBox.style.display = "";

        if (alertText) {
            alertText.textContent =
                error.message || "Unable to load your fee information.";
        }
    }
});
