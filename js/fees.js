
/* =====================================================
   PJT CLASSES - STUDENT FEE DASHBOARD
   Academic cycle: March 2026 - February 2027
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const MONTHLY_FEE = 600;
    const ACADEMIC_START_YEAR = 2026;

    const months = [
        "March", "April", "May", "June",
        "July", "August", "September", "October",
        "November", "December", "January", "February"
    ];

    const $ = (id) => document.getElementById(id);

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    // -------------------------------------------------
    // SIDEBAR
    // -------------------------------------------------

    const sidebar = $("sidebar");
    const sidebarOverlay = $("sidebarOverlay");
    const sidebarClose = $("sidebarClose");
    const mobileMenu = $("mobileMenu");

    function openSidebar() {
        if (!sidebar || !sidebarOverlay) return;

        sidebar.classList.add("open");
        sidebarOverlay.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        if (!sidebar || !sidebarOverlay) return;

        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("show");
        document.body.style.overflow = "";
    }

    mobileMenu?.addEventListener("click", openSidebar);
    sidebarClose?.addEventListener("click", closeSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && window.innerWidth <= 768) {
            closeSidebar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    $("notificationButton")?.addEventListener("click", () => {
        window.location.href = "notifications.html";
    });

    // -------------------------------------------------
    // LOAD AUTHENTICATED STUDENT'S FEE RECORDS
    // -------------------------------------------------

    async function loadStudentFees() {
        if (typeof supabaseClient === "undefined") {
            throw new Error(
                "Supabase client not found. Check js/supabase.js and script order."
            );
        }

        const { data: authData, error: authError } =
            await supabaseClient.auth.getUser();

        if (authError || !authData?.user) {
            window.location.href = "login.html";
            return null;
        }

const { data, error } = await supabaseClient
    .from("fee_records")
    .select(
        "id, student_id, description, amount, due_date, paid_amount, status, academic_year"
    )
    .eq("student_id", authData.user.id)
    .eq("academic_year", `${ACADEMIC_START_YEAR}-${String(ACADEMIC_START_YEAR + 1).slice(-2)}`)
    .order("due_date", { ascending: true });

        if (error) {
            console.error("Fee loading error:", error);
            throw new Error(
                "Could not load fee records. Check the fee_records SELECT policy in Supabase."
            );
        }

        console.log("Student fee records:", data);
        return data || [];
    }

    // -------------------------------------------------
    // ERROR MESSAGE
    // -------------------------------------------------

    function showError(message) {
        console.error(message);

        const alertBox = $("feeAlert");
        const alertText = $("feeAlertText");

        if (alertBox) alertBox.style.display = "";
        if (alertText) alertText.textContent = message;
    }

    // -------------------------------------------------
    // FETCH AND DISPLAY FEES
    // -------------------------------------------------

    let feeRecords;

    try {
        feeRecords = await loadStudentFees();
    } catch (error) {
        showError(error.message || "Unable to load your fees.");
        return;
    }

    // A null result means the student is being redirected to login.
    if (feeRecords === null) return;

    // -------------------------------------------------
    // BUILD THE 12-MONTH ACADEMIC CYCLE
    // Missing database records are NOT treated as payments.
    // -------------------------------------------------

    const monthlyRecords = months.map((month, index) => {
        const expectedMonth = (index + 2) % 12;
        const expectedYear =
            index < 10 ? ACADEMIC_START_YEAR : ACADEMIC_START_YEAR + 1;

        const record = feeRecords.find((fee) => {
            if (!fee.due_date) return false;

            // Read YYYY-MM-DD directly to avoid timezone shifts.
            const [year, monthNumber] = fee.due_date
                .slice(0, 10)
                .split("-")
                .map(Number);

            return (
                year === expectedYear &&
                monthNumber === expectedMonth + 1
            );
        });

        const amount = record ? Number(record.amount || 0) : MONTHLY_FEE;
        const paidAmount = record
            ? Math.min(
                amount,
                Math.max(0, Number(record.paid_amount || 0))
            )
            : 0;

        let status;

        if (!record) {
            status = "no-record";
        } else if (
            record.status === "paid" ||
            (amount > 0 && paidAmount >= amount)
        ) {
            status = "paid";
        } else if (
            record.status === "partial" ||
            paidAmount > 0
        ) {
            status = "partial";
        } else {
            status = "pending";
        }

        return {
            month,
            year: expectedYear,
            record,
            amount,
            paidAmount,
            outstanding: Math.max(0, amount - paidAmount),
            status
        };
    });

    // -------------------------------------------------
    // SUMMARY CALCULATIONS
    // Annual fee is the expected 12-month fee.
    // Paid/pending totals use actual records only.
    // -------------------------------------------------

    const annualFee = MONTHLY_FEE * months.length;

    const paidAmount = monthlyRecords.reduce(
        (total, item) => total + item.paidAmount,
        0
    );

    const pendingAmount = monthlyRecords.reduce(
        (total, item) => total + item.outstanding,
        0
    );

    const paidMonthsCount = monthlyRecords.filter(
        (item) => item.status === "paid"
    ).length;

    const pendingMonthsCount = monthlyRecords.filter(
        (item) => item.status === "pending" || item.status === "partial"
    ).length;

    const noRecordCount = monthlyRecords.filter(
        (item) => item.status === "no-record"
    ).length;

    const paymentPercentage = Math.min(
        100,
        Math.round((paidAmount / annualFee) * 100)
    );

    // -------------------------------------------------
    // UPDATE SUMMARY CARDS
    // -------------------------------------------------

    if ($("annualFee")) {
        $("annualFee").textContent = formatCurrency(annualFee);
    }

    if ($("paidAmount")) {
        $("paidAmount").textContent = formatCurrency(paidAmount);
    }

    if ($("pendingAmount")) {
        $("pendingAmount").textContent = formatCurrency(pendingAmount);
    }

    if ($("paidMonths")) {
        $("paidMonths").textContent =
            `${paidMonthsCount} month${paidMonthsCount === 1 ? "" : "s"} paid`;
    }

    if ($("pendingMonths")) {
        $("pendingMonths").textContent =
            `${pendingMonthsCount} month${pendingMonthsCount === 1 ? "" : "s"} pending`;
    }

    if ($("paymentPercentage")) {
        $("paymentPercentage").textContent = `${paymentPercentage}%`;
    }

    if ($("progressPaid")) {
        $("progressPaid").textContent = formatCurrency(paidAmount);
    }

    // -------------------------------------------------
    // UPDATE PROGRESS BAR
    // -------------------------------------------------

    const progressBar = $("largeProgressBar");

    if (progressBar) {
        progressBar.style.width = `${paymentPercentage}%`;
        progressBar.setAttribute("aria-valuenow", String(paymentPercentage));
    }

    // -------------------------------------------------
    // CREATE MONTHLY TABLE
    // -------------------------------------------------

    const tableBody = $("feeTableBody");

    if (tableBody) {
        // Clear existing rows before rendering.
        tableBody.replaceChildren();

        monthlyRecords.forEach((item, index) => {
            const row = document.createElement("tr");

            const statusLabel = {
                paid: "Paid",
                pending: "Pending",
                partial: "Partial",
                "no-record": "No record"
            }[item.status];

            const statusClass =
                item.status === "paid"
                    ? "paid"
                    : item.status === "no-record"
                        ? "no-record"
                        : "pending";

            const values = [
                String(index + 1).padStart(2, "0"),
                item.month,
                formatCurrency(item.amount),
                formatCurrency(item.paidAmount)
            ];

            values.forEach((value, cellIndex) => {
                const cell = document.createElement("td");
                const span = document.createElement("span");

                if (cellIndex === 0) {
                    span.className = "month-number";
                } else if (cellIndex === 1) {
                    span.className = "month-name";
                    span.textContent = `${value} ${item.year}`;
                } else {
                    span.className = "amount";
                    span.textContent = value;
                }

                if (cellIndex < 2) {
                    if (cellIndex === 0) span.textContent = value;
                    cell.appendChild(span);
                } else {
                    cell.appendChild(span);
                }

                row.appendChild(cell);
            });

            const statusCell = document.createElement("td");
            const statusSpan = document.createElement("span");
            statusSpan.className = `status ${statusClass}`;

            const dot = document.createElement("span");
            dot.className = "status-dot-small";

            statusSpan.append(dot, document.createTextNode(statusLabel));
            statusCell.appendChild(statusSpan);
            row.appendChild(statusCell);

            tableBody.appendChild(row);
        });
    }

    // -------------------------------------------------
    // PENDING / DATA ALERT
    // -------------------------------------------------

    const feeAlert = $("feeAlert");
    const feeAlertText = $("feeAlertText");

    if (feeAlert && feeAlertText) {
        if (pendingMonthsCount === 0 && noRecordCount === 0) {
            feeAlert.style.display = "none";
        } else {
            feeAlert.style.display = "";

            const pendingNames = monthlyRecords
                .filter(
                    (item) =>
                        item.status === "pending" ||
                        item.status === "partial"
                )
                .map((item) => item.month);

            const messages = [];

            if (pendingNames.length > 0) {
                messages.push(
                    `Recorded fees pending or partially paid: ${pendingNames.join(", ")}.`
                );
            }

            if (noRecordCount > 0) {
                messages.push(
                    `${noRecordCount} month${noRecordCount === 1 ? "" : "s"} have no fee record in the database.`
                );
            }

            messages.push(
                "Please contact PJT Classes administration to confirm fee records and payment details."
            );

            feeAlertText.textContent = messages.join(" ");
        }
    }

    // -------------------------------------------------
    // DEBUG SUMMARY
    // -------------------------------------------------

    console.log("Fee dashboard summary:", {
        academicYear: "March 2026 - February 2027",
        annualFee,
        paidAmount,
        pendingAmount,
        paidMonthsCount,
        pendingMonthsCount,
        noRecordCount
    });
});
