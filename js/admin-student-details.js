
/* =========================================================
   PJT CLASSES — ADMIN STUDENT DETAILS
   Loads real student profile and fee records from Supabase
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {
    const client = window.supabaseClient;

    if (!client) {
        showError("Supabase is not connected. Please check js/supabase.js.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const profileId = params.get("id");

    if (!profileId) {
        showError("No student was selected. Please return to Student Records.");
        return;
    }

    try {
        // 1. Load the selected student's real profile
        const { data: student, error: profileError } = await client
            .from("profiles")
            .select("id, full_name, email, student_id, student_class, mobile_number, role, created_at")
            .eq("id", profileId)
            .eq("role", "student")
            .maybeSingle();

        if (profileError) throw profileError;

        if (!student) {
            showError("No student record was found for this student.");
            return;
        }

        // 2. Load this student's fee records
        const { data: fees, error: feeError } = await client
            .from("fee_records")
            .select("id, student_id, description, amount, paid_amount, due_date, status")
            .eq("student_id", student.id);

        if (feeError) throw feeError;

        populateStudentDetails(student, fees || []);
    } catch (error) {
        console.error("Could not load student details:", error);
        showError(
            "Unable to load student details. Please refresh the page and try again."
        );
    }
});

/* =========================================================
   DISPLAY STUDENT DETAILS
========================================================= */

function populateStudentDetails(student, fees) {
    const name = student.full_name || "Name not provided";
    const studentCode = student.student_id || "Not assigned";
    const className = student.student_class
        ? (/^class\s/i.test(student.student_class)
            ? student.student_class
            : `Class ${student.student_class}`)
        : "Not assigned";
    const phone = student.mobile_number || "Not provided";

    setText("studentName", name);
    setText("studentId", studentCode);
    setText("studentClass", className);

    setText("infoName", name);
    setText("infoId", studentCode);
    setText("infoClass", className);
    setText("infoPhone", phone);
    setText("infoGuardian", "Not provided");
    setText("infoGuardianPhone", "Not provided");

    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    setText("studentAvatar", initials || "ST");

    const createdDate = student.created_at
        ? new Date(student.created_at).getFullYear()
        : new Date().getFullYear();

    const sessionElement = document.querySelector(".student-meta span:nth-of-type(5)");
    if (sessionElement) {
        sessionElement.textContent = `Registered ${createdDate}`;
    }

    // Real fee totals
    const totalPaid = fees.reduce(
        (sum, fee) => sum + (Number(fee.paid_amount) || 0),
        0
    );

    const totalPending = fees.reduce((sum, fee) => {
        const amount = Number(fee.amount) || 0;
        const paid = Number(fee.paid_amount) || 0;
        return sum + Math.max(0, amount - paid);
    }, 0);

    const annualFee = 7200;

    setText("paidAmount", formatRupees(totalPaid));
    setText("pendingAmount", formatRupees(totalPending));

    // Update the annual fee display without changing the HTML layout
    const annualFeeValue = document.querySelector(
        ".fee-summary-main .fee-amount-box:first-child strong"
    );

    if (annualFeeValue) {
        annualFeeValue.textContent = formatRupees(annualFee);
    }

    const percentage = annualFee > 0
        ? Math.min(100, Math.round((totalPaid / annualFee) * 100))
        : 0;

    setText("paymentPercentage", `${percentage}%`);

    const progress = document.getElementById("paymentProgress");
    if (progress) {
        progress.style.width = `${percentage}%`;
    }

    // Show real monthly statuses based on fee due dates
    renderMonthlyFees(fees);

    // No performance, behaviour, guardian or member tables have
    // been connected here, so do not display invented records.
    setText("studentPerformanceUnavailable", "");
    showPerformanceUnavailable();
    showBehaviourUnavailable();
    renderMembers([]);
}

/* =========================================================
   MONTHLY FEES — BASED ON DUE DATE
========================================================= */

function renderMonthlyFees(fees) {
    const months = [
        "Mar", "Apr", "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"
    ];

    const container = document.querySelector(".monthly-fee-grid");
    if (!container) return;

    container.replaceChildren();

    // Use the latest fee record for each calendar month.
    const recordsByMonth = new Map();

    fees.forEach(fee => {
        if (!fee.due_date) return;

        const date = new Date(`${fee.due_date}T00:00:00`);
        if (Number.isNaN(date.getTime())) return;

        const month = date.getMonth();
        const academicMonthIndex = month >= 2 ? month - 2 : month + 10;

        const previous = recordsByMonth.get(academicMonthIndex);
        if (
            !previous ||
            String(fee.due_date) >= String(previous.due_date)
        ) {
            recordsByMonth.set(academicMonthIndex, fee);
        }
    });

    months.forEach((month, index) => {
        const fee = recordsByMonth.get(index);
        let status = "No record";
        let className = "unrecorded";

        if (fee) {
            const amount = Number(fee.amount) || 0;
            const paid = Number(fee.paid_amount) || 0;

            if (amount > 0 && paid >= amount) {
                status = "Paid";
                className = "paid";
            } else {
                status = "Pending";
                className = "pending";
            }
        }

        const item = document.createElement("div");
        item.className = `month-item ${className}`;

        const monthLabel = document.createElement("span");
        monthLabel.textContent = month;

        const statusLabel = document.createElement("strong");
        statusLabel.textContent = status;

        item.append(monthLabel, statusLabel);
        container.appendChild(item);
    });
}

/* =========================================================
   PERFORMANCE — NO CONNECTED DATA TABLE YET
========================================================= */

function showPerformanceUnavailable() {
    const score = document.querySelector(".performance-score strong");
    if (score) score.textContent = "—";

    const scoreLabel = document.querySelector(".performance-score span");
    if (scoreLabel) scoreLabel.textContent = "No performance record loaded";

    document.querySelectorAll(".subject-row").forEach(row => {
        const value = row.querySelector("strong");
        const fill = row.querySelector(".subject-fill");

        if (value) value.textContent = "—";
        if (fill) fill.style.width = "0%";
    });
}

/* =========================================================
   BEHAVIOUR — NO CONNECTED DATA TABLE YET
========================================================= */

function showBehaviourUnavailable() {
    const rating = document.querySelector(".behaviour-rating strong");
    if (rating) rating.textContent = "No record";

    const grade = document.querySelector(".rating-circle");
    if (grade) grade.textContent = "—";

    const note = document.querySelector(".behaviour-notes p");
    if (note) note.textContent = "No behaviour record has been added yet.";
}

/* =========================================================
   ADDED MEMBERS — NO CONNECTED MEMBERS TABLE YET
========================================================= */

function renderMembers(members) {
    const container = document.querySelector(".members-list");
    if (!container) return;

    container.replaceChildren();

    members.slice(0, 3).forEach(member => {
        const item = document.createElement("div");
        item.className = "member-item";

        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        avatar.textContent = (member.name || "M")
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

        const info = document.createElement("div");
        info.className = "member-info";

        const name = document.createElement("strong");
        name.textContent = member.name || "Name not provided";

        const relation = document.createElement("span");
        relation.textContent = `${member.relation || "Member"} · Added member`;

        info.append(name, relation);
        item.append(avatar, info);
        container.appendChild(item);
    });

    for (let i = members.length; i < 3; i++) {
        const empty = document.createElement("div");
        empty.className = "member-empty";

        const plus = document.createElement("span");
        plus.textContent = "+";

        const message = document.createElement("p");
        message.textContent = "No member record";

        empty.append(plus, message);
        container.appendChild(empty);
    }
}

/* =========================================================
   ERROR DISPLAY
========================================================= */

function showError(message) {
    const content = document.querySelector(".admin-content");
    if (!content) {
        alert(message);
        return;
    }

    content.replaceChildren();

    const box = document.createElement("div");
    box.style.cssText =
        "background:#fff;border:1px solid #e7ebf2;border-radius:14px;padding:32px;text-align:center;";

    const heading = document.createElement("h2");
    heading.textContent = "Student Details";

    const description = document.createElement("p");
    description.textContent = message;

    const back = document.createElement("a");
    back.href = "students.html";
    back.textContent = "← Back to Students";
    back.style.cssText =
        "display:inline-block;margin-top:12px;padding:11px 18px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;";

    box.append(heading, description, back);
    content.appendChild(box);
}

/* =========================================================
   HELPERS
========================================================= */

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value == null || value === ""
            ? "Not provided"
            : String(value);
    }
}

function formatRupees(amount) {
    return "₹" + (Number(amount) || 0).toLocaleString("en-IN");
}

/* =========================================================
   MOBILE SIDEBAR
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("adminSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const closeButton = document.getElementById("sidebarClose");

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
    }

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", function () {
            sidebar.classList.add("open");
            if (overlay) overlay.classList.add("show");
        });
    }

    if (closeButton) closeButton.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
            try {
                if (window.supabaseClient) {
                    await window.supabaseClient.auth.signOut();
                }
            } catch (error) {
                console.error("Logout error:", error);
            }

            sessionStorage.removeItem("pjtAdminLoggedIn");
            sessionStorage.removeItem("pjtAdminId");
            window.location.href = "login.html";
        });
    }
});
