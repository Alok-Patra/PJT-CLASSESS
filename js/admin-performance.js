/* =========================================================
   PJT CLASSES — ADMIN PERFORMANCE
   Supabase-connected version
========================================================= */

const client = window.supabaseClient;

const $ = (id) => document.getElementById(id);

const studentSelect = $("studentSelect");
const previewAvatar = $("previewAvatar");
const previewName = $("previewName");
const previewInfo = $("previewInfo");

const mathInput = $("mathMarks");
const scienceInput = $("scienceMarks");
const englishInput = $("englishMarks");

const mathDisplay = $("mathDisplay");
const scienceDisplay = $("scienceDisplay");
const englishDisplay = $("englishDisplay");

const mathProgress = $("mathProgress");
const scienceProgress = $("scienceProgress");
const englishProgress = $("englishProgress");

const overallDisplay = $("overallDisplay");
const overallProgress = $("overallProgress");

const recordName = $("recordName");
const recordId = $("recordId");
const recordClass = $("recordClass");
const recordOverall = $("recordOverall");
const formMessage = $("formMessage");
const saveButton = $("savePerformance");

const ASSESSMENT_NAME = "Overall Performance";
const SUBJECTS = [
    { key: "mathematics", label: "Mathematics", input: mathInput },
    { key: "science", label: "Science", input: scienceInput },
    { key: "english", label: "English", input: englishInput }
];

let students = [];
let currentStudent = null;
let savedRecords = [];
let isLoading = false;

/* =========================================================
   HELPERS
========================================================= */

function showMessage(message, success = false) {
    if (!formMessage) return;

    formMessage.style.color = success ? "#16a34a" : "#dc2626";
    formMessage.textContent = message;
}

function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getInitials(name) {
    return (name || "Student")
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function setProgress(element, percentage) {
    if (element) {
        element.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    }
}

function calculatePercentage(records) {
    const totalMarks = records.reduce(
        (sum, record) => sum + Number(record.marks_obtained || 0),
        0
    );

    const totalMaximum = records.reduce(
        (sum, record) => sum + Number(record.max_marks || 0),
        0
    );

    return totalMaximum > 0
        ? Math.round((totalMarks / totalMaximum) * 100)
        : 0;
}

function getSubjectRecord(subject) {
    return savedRecords.find(
        record =>
            record.subject.toLowerCase() === subject.toLowerCase() &&
            record.assessment_name === ASSESSMENT_NAME
    );
}

/* =========================================================
   LOAD REAL STUDENTS FROM PROFILES
========================================================= */

async function loadStudentOptions() {
    if (!supabaseClient) {
        showMessage(
            "Supabase client not found. Check your script loading order."
        );
        return;
    }

    if (!studentSelect) return;

    studentSelect.innerHTML =
        '<option value="">Loading students...</option>';

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, full_name, email, student_id, student_class, role")
        .eq("role", "student")
        .order("full_name");

    if (error) {
        console.error("Loading students failed:", error);
        studentSelect.innerHTML =
            '<option value="">Could not load students</option>';
        showMessage("Could not load students: " + error.message);
        return;
    }

    students = data || [];
    studentSelect.innerHTML =
        '<option value="">Select a student</option>';

    students.forEach(student => {
        const option = document.createElement("option");

        // This UUID is the value stored in performance_records.student_id.
        option.value = student.id;

        option.textContent =
            `${student.full_name || "Unnamed Student"} — ${student.student_id || "No Student ID"}`;

        studentSelect.appendChild(option);
    });

    showMessage(
        students.length
            ? "Student list loaded successfully."
            : "No student profiles were found.",
        students.length > 0
    );
}

/* =========================================================
   LOAD SAVED PERFORMANCE
========================================================= */

async function loadPerformance(student) {
    if (!student) {
        resetPerformance();
        return;
    }

    currentStudent = student;
    savedRecords = [];

    previewAvatar.textContent = getInitials(student.full_name);
    previewName.textContent = student.full_name || "Student";
    previewInfo.textContent =
        `${student.student_id || "No Student ID"} · ${student.student_class || "Class not set"}`;

    if (saveButton) saveButton.disabled = true;
    showMessage("Loading saved performance...", true);

    const { data, error } = await supabaseClient
        .from("performance_records")
        .select(
            "id, student_id, subject, assessment_name, marks_obtained, max_marks, exam_date, remarks, created_by"
        )
        .eq("student_id", student.id)
        .eq("assessment_name", ASSESSMENT_NAME)
        .order("exam_date", { ascending: false });

    if (error) {
        console.error("Loading performance failed:", error);
        showMessage("Could not load performance: " + error.message);

        if (saveButton) saveButton.disabled = false;
        return;
    }

    savedRecords = data || [];

    SUBJECTS.forEach(subject => {
        const record = getSubjectRecord(subject.label);
        if (subject.input) {
            subject.input.value = record
                ? Number(record.marks_obtained)
                : "";
        }
    });

    updatePerformanceDisplay();
    showMessage("Saved performance loaded.", true);

    if (saveButton) saveButton.disabled = false;
}

/* =========================================================
   UPDATE PERFORMANCE DISPLAY
========================================================= */

function updatePerformanceDisplay() {
    if (!currentStudent) return;

    const values = SUBJECTS.map(subject => {
        const value = Number(subject.input?.value);
        return Number.isFinite(value) ? value : 0;
    });

    const [math, science, english] = values;

    if (mathDisplay) mathDisplay.textContent = `${math}%`;
    if (scienceDisplay) scienceDisplay.textContent = `${science}%`;
    if (englishDisplay) englishDisplay.textContent = `${english}%`;

    setProgress(mathProgress, math);
    setProgress(scienceProgress, science);
    setProgress(englishProgress, english);

    const overall = Math.round((math + science + english) / 3);

    if (overallDisplay) overallDisplay.textContent = `${overall}%`;
    setProgress(overallProgress, overall);

    if (recordName) recordName.textContent = currentStudent.full_name || "-";
    if (recordId) recordId.textContent = currentStudent.student_id || "-";
    if (recordClass) {
        recordClass.textContent = currentStudent.student_class || "-";
    }
    if (recordOverall) recordOverall.textContent = `${overall}%`;
}

function liveUpdate() {
    updatePerformanceDisplay();
}

[mathInput, scienceInput, englishInput].forEach(input => {
    if (input) input.addEventListener("input", liveUpdate);
});

/* =========================================================
   SAVE PERFORMANCE TO SUPABASE
========================================================= */

async function savePerformance() {
    if (isLoading) return;

    if (!currentStudent) {
        showMessage("Please select a student.");
        return;
    }

    const marks = SUBJECTS.map(subject => ({
        subject: subject.label,
        value: Number(subject.input?.value)
    }));

    const invalid = marks.some(
        item =>
            !Number.isFinite(item.value) ||
            item.value < 0 ||
            item.value > 100 ||
            String(item.value).trim() === ""
    );

    if (invalid) {
        showMessage("Enter valid marks from 0 to 100 for all subjects.");
        return;
    }

    isLoading = true;
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    try {
        const { data: authData, error: authError } =
            await supabaseClient.auth.getUser();

        if (authError || !authData?.user) {
            throw new Error("Your admin session has expired. Please log in again.");
        }

        const adminId = authData.user.id;

        for (const item of marks) {
            const existingRecord = getSubjectRecord(item.subject);

            const recordData = {
                student_id: currentStudent.id,
                subject: item.subject,
                assessment_name: ASSESSMENT_NAME,
                marks_obtained: item.value,
                max_marks: 100,
                exam_date: getToday(),
                created_by: adminId,
                updated_at: new Date().toISOString()
            };

            let result;

            if (existingRecord) {
                result = await supabaseClient
                    .from("performance_records")
                    .update({
                        marks_obtained: recordData.marks_obtained,
                        max_marks: recordData.max_marks,
                        exam_date: recordData.exam_date,
                        updated_at: recordData.updated_at
                    })
                    .eq("id", existingRecord.id)
                    .eq("student_id", currentStudent.id);
            } else {
                result = await supabaseClient
                    .from("performance_records")
                    .insert(recordData);
            }

            if (result.error) {
                throw result.error;
            }
        }

        // Fetch again so the screen reflects what is actually stored.
        await loadPerformance(currentStudent);
        showMessage("Performance saved successfully to Supabase.", true);

    } catch (error) {
        console.error("Saving performance failed:", error);
        showMessage(
            "Could not save performance: " +
            (error.message || "Unknown error")
        );
    } finally {
        isLoading = false;

        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "Save Performance";
        }
    }
}

if (saveButton) {
    saveButton.addEventListener("click", savePerformance);
}

/* =========================================================
   RESET
========================================================= */

function resetPerformance() {
    currentStudent = null;
    savedRecords = [];

    if (previewAvatar) previewAvatar.textContent = "--";
    if (previewName) previewName.textContent = "Select Student";
    if (previewInfo) previewInfo.textContent = "Student ID · Class";

    [mathInput, scienceInput, englishInput].forEach(input => {
        if (input) input.value = "";
    });

    [mathDisplay, scienceDisplay, englishDisplay].forEach(element => {
        if (element) element.textContent = "0%";
    });

    [mathProgress, scienceProgress, englishProgress].forEach(element => {
        setProgress(element, 0);
    });

    if (overallDisplay) overallDisplay.textContent = "0%";
    setProgress(overallProgress, 0);

    if (recordName) recordName.textContent = "-";
    if (recordId) recordId.textContent = "-";
    if (recordClass) recordClass.textContent = "-";
    if (recordOverall) recordOverall.textContent = "-";

    if (saveButton) saveButton.disabled = false;
}

/* =========================================================
   STUDENT SELECTION
========================================================= */

if (studentSelect) {
    studentSelect.addEventListener("change", async function () {
        const student = students.find(item => item.id === this.value);

        if (!student) {
            resetPerformance();
            return;
        }

        await loadPerformance(student);
    });
}

/* =========================================================
   MOBILE SIDEBAR
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const menuButton = $("menuButton");
    const sidebar = $("adminSidebar");
    const overlay = $("sidebarOverlay");
    const closeButton = $("sidebarClose");

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
    }

    if (menuButton) {
        menuButton.addEventListener("click", function () {
            if (sidebar) sidebar.classList.add("open");
            if (overlay) overlay.classList.add("show");
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }
});

/* =========================================================
   LOGOUT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = $("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
            try {
                if (supabaseClient) {
                    await supabaseClient.auth.signOut();
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

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {
    await loadStudentOptions();
});