
/* =========================================================
   PJT CLASSES — ADMIN FEE MANAGEMENT
   Supabase + Academic Year + Monthly Fee Status
========================================================= */

const months = [
    "March", "April", "May", "June",
    "July", "August", "September", "October",
    "November", "December", "January", "February"
];

const monthlyFee = 600;
const annualFee = monthlyFee * 12;

let students = [];
let currentFees = [];
let selectedStudent = null;

const studentSelect = document.getElementById("studentSelect");
const previewAvatar = document.getElementById("previewAvatar");
const previewName = document.getElementById("previewName");
const previewInfo = document.getElementById("previewInfo");
const monthlyGrid = document.getElementById("monthlyGrid");
const paidAmount = document.getElementById("paidAmount");
const pendingAmount = document.getElementById("pendingAmount");
const paidMonths = document.getElementById("paidMonths");
const paymentPercentage = document.getElementById("paymentPercentage");
const paymentProgress = document.getElementById("paymentProgress");
const formMessage = document.getElementById("formMessage");
const saveButton = document.getElementById("saveFees");

function formatRupees(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function showMessage(message, color = "#64748b") {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.style.color = color;
}

/* Academic year runs March through February. */
function getAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const startYear = now.getMonth() >= 2 ? year : year - 1;

    return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

function getMonthDueDate(index) {
    const startYear = Number(getAcademicYear().split("-")[0]);
    const year = index < 10 ? startYear : startYear + 1;
    const monthNumber = index < 10 ? index + 3 : index - 9;

    return `${year}-${String(monthNumber).padStart(2, "0")}-10`;
}

/* Find the current academic year's record for a month. */
function getMonthRecord(month) {
    return currentFees.find(fee => {
        const description = String(fee.description || "")
            .trim()
            .toLowerCase();

        return description === month.toLowerCase() ||
            description.startsWith(month.toLowerCase() + " ");
    });
}

function isMonthPaid(month) {
    const record = getMonthRecord(month);
    if (!record) return false;

    const amount = Number(record.amount || monthlyFee);
    const received = Number(record.paid_amount || 0);

    return amount > 0 && received >= amount;
}

function resetPage() {
    selectedStudent = null;
    currentFees = [];

    if (previewAvatar) previewAvatar.textContent = "--";
    if (previewName) previewName.textContent = "Select Student";
    if (previewInfo) previewInfo.textContent = "Student ID · Class";
    if (monthlyGrid) monthlyGrid.replaceChildren();
    if (paidAmount) paidAmount.textContent = "₹0";
    if (pendingAmount) pendingAmount.textContent = "₹0";
    if (paidMonths) paidMonths.textContent = "0 / 12";
    if (paymentPercentage) paymentPercentage.textContent = "0%";
    if (paymentProgress) paymentProgress.style.width = "0%";

    showMessage("");
}

function updateSummary() {
    let paid = 0;
    let pending = 0;
    let paidCount = 0;

    months.forEach(month => {
        const record = getMonthRecord(month);
        const amount = record ? Number(record.amount || monthlyFee) : monthlyFee;
        const received = record ? Number(record.paid_amount || 0) : 0;

        paid += received;
        pending += Math.max(0, amount - received);

        if (amount > 0 && received >= amount) {
            paidCount++;
        }
    });

    const percentage = Math.min(
        100,
        Math.round((paid / annualFee) * 100)
    );

    if (paidAmount) paidAmount.textContent = formatRupees(paid);
    if (pendingAmount) pendingAmount.textContent = formatRupees(pending);
    if (paidMonths) paidMonths.textContent = `${paidCount} / 12`;
    if (paymentPercentage) paymentPercentage.textContent = `${percentage}%`;
    if (paymentProgress) paymentProgress.style.width = `${percentage}%`;
}

function renderMonths() {
    if (!monthlyGrid) return;

    monthlyGrid.replaceChildren();

    months.forEach((month, index) => {
        const record = getMonthRecord(month);
        const amount = record ? Number(record.amount || monthlyFee) : monthlyFee;
        const paid = isMonthPaid(month);

        const item = document.createElement("div");
        item.className = `month-item ${paid ? "selected-paid" : "selected-pending"}`;

        const top = document.createElement("div");
        top.className = "month-top";

        const monthName = document.createElement("span");
        monthName.className = "month-name";
        monthName.textContent = month;

        const monthAmount = document.createElement("span");
        monthAmount.className = "month-amount";
        monthAmount.textContent = formatRupees(amount);

        top.append(monthName, monthAmount);

        const statusRow = document.createElement("div");
        statusRow.className = "month-status";

        const badge = document.createElement("span");
        badge.className = `status-badge ${paid ? "paid" : "pending"}`;
        badge.textContent = paid ? "Paid" : "Pending";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "toggle-status";
        toggle.textContent = paid ? "Mark Pending" : "Mark Paid";

        toggle.addEventListener("click", () => {
            let target = getMonthRecord(month);

            if (!target) {
                target = {
                    id: null,
                    student_id: selectedStudent.id,
                    description: month,
                    due_date: getMonthDueDate(index),
                    amount: monthlyFee,
                    paid_amount: 0,
                    status: "pending",
                    academic_year: getAcademicYear()
                };

                currentFees.push(target);
            }

            target.paid_amount = paid
                ? 0
                : Number(target.amount || monthlyFee);

            target.status = paid ? "pending" : "paid";

            renderMonths();
            updateSummary();
            showMessage(
                "Change not saved yet. Click Save Fee Status.",
                "#ea580c"
            );
        });

        statusRow.append(badge, toggle);
        item.append(top, statusRow);
        monthlyGrid.appendChild(item);
    });
}

async function loadStudentFees(student) {
    selectedStudent = student;
    currentFees = [];

    showMessage("Loading fee records...");

    const client = window.supabaseClient;

    if (!client) {
        showMessage("Supabase is not initialized.", "#dc2626");
        return;
    }

    try {
        const academicYear = getAcademicYear();

        const { data, error } = await client
            .from("fee_records")
            .select(
                "id, student_id, description, due_date, amount, paid_amount, status, academic_year"
            )
            .eq("student_id", student.id)
            .eq("academic_year", academicYear);

        if (error) throw error;

        currentFees = (data || []).map(fee => ({
            ...fee,
            status: String(fee.status || "").trim().toLowerCase(),
            paid_amount: Number(fee.paid_amount || 0),
            amount: Number(fee.amount || 0)
        }));

        if (previewAvatar) {
            previewAvatar.textContent = (student.full_name || "S")
                .trim()
                .split(/\s+/)
                .map(word => word.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase();
        }

        if (previewName) {
            previewName.textContent = student.full_name || "Unnamed student";
        }

        if (previewInfo) {
            previewInfo.textContent =
                `${student.student_id || "ID not assigned"} · Class ${student.student_class || "N/A"}`;
        }

        renderMonths();
        updateSummary();

        showMessage(
            `Fees loaded for academic year ${academicYear}.`,
            "#16a34a"
        );
    } catch (error) {
        console.error("Unable to load fee records:", error);
        showMessage("Could not load fees: " + error.message, "#dc2626");
    }
}

async function loadStudents() {
    const client = window.supabaseClient;

    if (!client) {
        showMessage("Supabase is not initialized. Check script imports.", "#dc2626");
        return;
    }

    if (!studentSelect) return;

    studentSelect.replaceChildren(new Option("Loading students...", ""));

    try {
        const { data, error } = await client
            .from("profiles")
            .select("id, full_name, student_id, student_class, role")
            .eq("role", "student")
            .order("full_name", { ascending: true });

        if (error) throw error;

        students = data || [];
        studentSelect.replaceChildren(new Option("Select a student", ""));

        students.forEach(student => {
            studentSelect.add(
                new Option(
                    `${student.full_name || "Unnamed student"} — ${student.student_id || "ID not assigned"}`,
                    student.id
                )
            );
        });

        showMessage(
            students.length
                ? `${students.length} student(s) loaded.`
                : "No student profiles were found.",
            students.length ? "#16a34a" : "#dc2626"
        );
    } catch (error) {
        console.error("Unable to load students:", error);
        studentSelect.replaceChildren(new Option("Unable to load students", ""));
        showMessage("Could not load students: " + error.message, "#dc2626");
    }
}

if (studentSelect) {
    studentSelect.addEventListener("change", async () => {
        const student = students.find(item => item.id === studentSelect.value);

        if (!student) {
            resetPage();
            return;
        }

        await loadStudentFees(student);
    });
}

/* Save the current month's records without duplicate inserts. */
if (saveButton) {
    saveButton.addEventListener("click", async () => {
        if (!selectedStudent) {
            showMessage("Please select a student first.", "#dc2626");
            return;
        }

        const client = window.supabaseClient;

        if (!client) {
            showMessage("Supabase is not initialized.", "#dc2626");
            return;
        }

        saveButton.disabled = true;
        showMessage("Saving fee payments...");

        try {
            const academicYear = getAcademicYear();

            for (let index = 0; index < months.length; index++) {
                const month = months[index];
                const record = getMonthRecord(month);

                // Do not create unpaid rows for months that have never been saved.
                if (!record) continue;

                const amount = Number(record.amount || monthlyFee);
                const received = Number(record.paid_amount || 0);
                const status =
                    amount > 0 && received >= amount ? "paid" : "pending";

                const payload = {
                    student_id: selectedStudent.id,
                    description: month,
                    due_date: record.due_date || getMonthDueDate(index),
                    amount,
                    paid_amount: received,
                    status,
                    academic_year: academicYear
                };

                let result;

                if (record.id) {
                    result = await client
                        .from("fee_records")
                        .update(payload)
                        .eq("id", record.id)
                        .eq("student_id", selectedStudent.id);
                } else {
                    result = await client
                        .from("fee_records")
                        .insert(payload)
                        .select("id")
                        .single();

                    if (!result.error && result.data) {
                        record.id = result.data.id;
                    }
                }

                if (result.error) throw result.error;
            }

            await loadStudentFees(selectedStudent);
            showMessage(
                `Fee payments saved for ${academicYear}.`,
                "#16a34a"
            );
        } catch (error) {
            console.error("Unable to save fee payments:", error);
            showMessage("Could not save payments: " + error.message, "#dc2626");
        } finally {
            saveButton.disabled = false;
        }
    });
}

/* Mobile sidebar and logout */
document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("adminSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const closeButton = document.getElementById("sidebarClose");
    const logoutButton = document.getElementById("logoutButton");

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
    }

    if (menuButton) {
        menuButton.addEventListener("click", () => {
            if (sidebar) sidebar.classList.add("open");
            if (overlay) overlay.classList.add("show");
        });
    }

    if (closeButton) closeButton.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            if (!window.confirm("Are you sure you want to logout?")) return;

            sessionStorage.removeItem("pjtAdminLoggedIn");
            sessionStorage.removeItem("pjtAdminId");
            window.location.href = "login.html";
        });
    }
});

document.addEventListener("DOMContentLoaded", loadStudents);
