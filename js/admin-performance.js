
/* =========================================================
   PJT CLASSES — ADMIN PERFORMANCE
   Fixed Supabase integration and notification badges
========================================================= */

(() => {
    "use strict";

    const $ = (id) => document.getElementById(id);

    const getClient = () => window.supabaseClient;

    const ASSESSMENT_NAME = "Overall Performance";

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

    const SUBJECTS = [
        { label: "Mathematics", input: mathInput, display: mathDisplay, progress: mathProgress },
        { label: "Science", input: scienceInput, display: scienceDisplay, progress: scienceProgress },
        { label: "English", input: englishInput, display: englishDisplay, progress: englishProgress }
    ];

    let students = [];
    let currentStudent = null;
    let savedRecords = [];
    let isLoadingStudents = false;
    let isLoadingPerformance = false;
    let isSaving = false;
    let requestNumber = 0;

    /* =====================================================
       MESSAGES AND HELPERS
    ===================================================== */

    function showMessage(message, success = false) {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.style.color = success ? "#16a34a" : "#dc2626";
    }

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function getToday() {
        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");
    }

    function getInitials(name) {
        return String(name || "Student")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(part => part.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }

    function setProgress(element, percentage) {
        if (!element) return;

        const safePercentage = Math.max(
            0,
            Math.min(100, Number(percentage) || 0)
        );

        element.style.width = `${safePercentage}%`;
    }

    function resetInputDisplays() {
        SUBJECTS.forEach(subject => {
            if (subject.input) subject.input.value = "";

            setText(subject.display, "0%");
            setProgress(subject.progress, 0);
        });

        setText(overallDisplay, "0%");
        setProgress(overallProgress, 0);

        setText(recordName, "-");
        setText(recordId, "-");
        setText(recordClass, "-");
        setText(recordOverall, "-");
    }

    function getSubjectRecord(subjectName) {
        return savedRecords.find(record =>
            String(record.subject || "").trim().toLowerCase() ===
                subjectName.trim().toLowerCase() &&
            record.assessment_name === ASSESSMENT_NAME
        );
    }

    function calculateOverall(values) {
        if (!values.length) return 0;

        return Math.round(
            values.reduce((sum, value) => sum + value, 0) / values.length
        );
    }

    /* =====================================================
       NOTIFICATION BADGES

       Shows the total notification row count, not unread
       notifications. Both badges use the same database count.
    ===================================================== */

    function getNotificationBadges() {
        return [
            ...document.querySelectorAll(
                '.admin-nav-link[href="notifications.html"] .nav-count'
            ),
            ...document.querySelectorAll(
                '.notification-button .notification-badge'
            )
        ];
    }

    function renderNotificationCount(count) {
        const safeCount = Math.max(0, Number(count) || 0);

        getNotificationBadges().forEach(badge => {
            badge.textContent = safeCount > 99 ? "99+" : String(safeCount);
            badge.style.display = safeCount > 0 ? "" : "none";
            badge.setAttribute("aria-label", `${safeCount} notifications`);
        });
    }

    async function updateNotificationBadges() {
        const client = getClient();

        // Prevent a hardcoded HTML value from remaining visible.
        renderNotificationCount(0);

        if (!client) {
            console.error(
                "Notification count unavailable: Supabase client is missing."
            );
            return;
        }

        const { count, error } = await client
            .from("notifications")
            .select("id", { count: "exact", head: true });

        if (error) {
            console.error("Notification count error:", error.message);
            return;
        }

        renderNotificationCount(count ?? 0);
    }

    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudentOptions() {
        const client = getClient();

        if (!studentSelect || isLoadingStudents) return;

        if (!client) {
            studentSelect.innerHTML =
                '<option value="">Supabase is unavailable</option>';
            showMessage("Supabase is not initialized. Check js/supabase.js.");
            return;
        }

        isLoadingStudents = true;
        studentSelect.disabled = true;
        studentSelect.innerHTML =
            '<option value="">Loading students...</option>';

        try {
            const { data, error } = await client
                .from("profiles")
                .select("id, full_name, email, student_id, student_class, role")
                .eq("role", "student")
                .order("full_name", { ascending: true });

            if (error) throw error;

            students = data || [];

            studentSelect.replaceChildren();

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select a student";
            studentSelect.appendChild(placeholder);

            students.forEach(student => {
                const option = document.createElement("option");

                // Use the profile UUID because performance_records.student_id
                // stores the student's Auth/profile UUID.
                option.value = student.id;
                option.textContent =
                    `${student.full_name || "Unnamed Student"} — ` +
                    `${student.student_id || "No Student ID"}`;

                studentSelect.appendChild(option);
            });

            showMessage(
                students.length
                    ? `${students.length} student(s) loaded successfully.`
                    : "No student profiles were found.",
                students.length > 0
            );
        } catch (error) {
            console.error("Loading students failed:", error);

            studentSelect.innerHTML =
                '<option value="">Could not load students</option>';

            showMessage("Could not load students: " + error.message);
        } finally {
            isLoadingStudents = false;
            studentSelect.disabled = false;
        }
    }

    /* =====================================================
       LOAD SAVED PERFORMANCE
    ===================================================== */

    async function loadPerformance(student) {
        const client = getClient();

        const thisRequest = ++requestNumber;

        if (!student) {
            currentStudent = null;
            savedRecords = [];
            resetInputDisplays();

            if (previewAvatar) previewAvatar.textContent = "--";
            if (previewName) previewName.textContent = "Select Student";
            if (previewInfo) {
                previewInfo.textContent = "Student ID · Class";
            }

            showMessage("Please select a student.", true);
            if (saveButton) saveButton.disabled = true;
            return;
        }

        if (!client) {
            showMessage("Supabase is not initialized.");
            return;
        }

        currentStudent = student;
        savedRecords = [];

        if (previewAvatar) {
            previewAvatar.textContent = getInitials(student.full_name);
        }

        setText(previewName, student.full_name || "Student");
        setText(
            previewInfo,
            `${student.student_id || "No Student ID"} · ` +
            `${student.student_class || "Class not set"}`
        );

        resetInputDisplays();

        if (recordName) recordName.textContent = student.full_name || "-";
        if (recordId) recordId.textContent = student.student_id || "-";
        if (recordClass) recordClass.textContent = student.student_class || "-";

        isLoadingPerformance = true;
        if (saveButton) saveButton.disabled = true;

        showMessage("Loading saved performance...", true);

        try {
            const { data, error } = await client
                .from("performance_records")
                .select(
                    "id, student_id, subject, assessment_name, " +
                    "marks_obtained, max_marks, exam_date, remarks, created_by"
                )
                .eq("student_id", student.id)
                .eq("assessment_name", ASSESSMENT_NAME)
                .order("exam_date", { ascending: false });

            if (error) throw error;

            // Ignore an old response if another student was selected.
            if (thisRequest !== requestNumber) return;

            savedRecords = data || [];

            SUBJECTS.forEach(subject => {
                const record = getSubjectRecord(subject.label);

                if (subject.input) {
                    subject.input.value = record
                        ? String(record.marks_obtained)
                        : "";
                }
            });

            updatePerformanceDisplay();

            showMessage(
                savedRecords.length
                    ? "Saved performance loaded successfully."
                    : "No saved performance found. Enter marks to create a record.",
                true
            );
        } catch (error) {
            if (thisRequest !== requestNumber) return;

            console.error("Loading performance failed:", error);
            showMessage("Could not load performance: " + error.message);
        } finally {
            if (thisRequest === requestNumber) {
                isLoadingPerformance = false;
                if (saveButton) saveButton.disabled = false;
            }
        }
    }

    /* =====================================================
       LIVE PERFORMANCE DISPLAY
    ===================================================== */

    function updatePerformanceDisplay() {
        if (!currentStudent) return;

        const values = SUBJECTS.map(subject => {
            const rawValue = subject.input?.value ?? "";
            const value = rawValue.trim() === "" ? 0 : Number(rawValue);

            return Number.isFinite(value)
                ? Math.max(0, Math.min(100, value))
                : 0;
        });

        SUBJECTS.forEach((subject, index) => {
            setText(subject.display, `${values[index]}%`);
            setProgress(subject.progress, values[index]);
        });

        const overall = calculateOverall(values);

        setText(overallDisplay, `${overall}%`);
        setProgress(overallProgress, overall);

        setText(recordName, currentStudent.full_name || "-");
        setText(recordId, currentStudent.student_id || "-");
        setText(recordClass, currentStudent.student_class || "-");
        setText(recordOverall, `${overall}%`);
    }

    SUBJECTS.forEach(subject => {
        subject.input?.addEventListener("input", updatePerformanceDisplay);
    });

    /* =====================================================
       SAVE PERFORMANCE
    ===================================================== */

    async function savePerformance() {
        const client = getClient();

        if (isSaving) return;

        if (!client) {
            showMessage("Supabase is not initialized.");
            return;
        }

        if (!currentStudent) {
            showMessage("Please select a student first.");
            return;
        }

        if (isLoadingPerformance) {
            showMessage("Please wait until the current record finishes loading.");
            return;
        }

        const marks = [];

        for (const subject of SUBJECTS) {
            const rawValue = subject.input?.value ?? "";

            if (rawValue.trim() === "") {
                showMessage(`Enter marks for ${subject.label}.`);
                subject.input?.focus();
                return;
            }

            const value = Number(rawValue);

            if (!Number.isFinite(value) || value < 0 || value > 100) {
                showMessage(
                    `Marks for ${subject.label} must be between 0 and 100.`
                );
                subject.input?.focus();
                return;
            }

            marks.push({
                subject: subject.label,
                value
            });
        }

        isSaving = true;

        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = "Saving...";
        }

        try {
            const { data: authData, error: authError } =
                await client.auth.getUser();

            if (authError || !authData?.user) {
                throw new Error(
                    "Your admin session has expired. Please log in again."
                );
            }

            const adminId = authData.user.id;

            const { data: adminProfile, error: adminError } = await client
                .from("profiles")
                .select("id, role")
                .eq("id", adminId)
                .maybeSingle();

            if (adminError) throw adminError;

            if (
                !adminProfile ||
                String(adminProfile.role || "").trim().toLowerCase() !== "admin"
            ) {
                throw new Error(
                    "Administrator verification failed. Please sign in with an admin account."
                );
            }

            // Save each subject. Existing records are updated; missing records
            // are inserted. Do not send optional timestamp columns that may
            // not exist in the database schema.
            for (const item of marks) {
                const existingRecord = getSubjectRecord(item.subject);

                const recordData = {
                    student_id: currentStudent.id,
                    subject: item.subject,
                    assessment_name: ASSESSMENT_NAME,
                    marks_obtained: item.value,
                    max_marks: 100,
                    exam_date: getToday(),
                    created_by: adminId
                };

                let result;

                if (existingRecord) {
                    result = await client
                        .from("performance_records")
                        .update({
                            marks_obtained: item.value,
                            max_marks: 100,
                            exam_date: getToday()
                        })
                        .eq("id", existingRecord.id)
                        .eq("student_id", currentStudent.id)
                        .select("id");
                } else {
                    result = await client
                        .from("performance_records")
                        .insert(recordData)
                        .select("id");
                }

                if (result.error) throw result.error;
            }

            await loadPerformance(currentStudent);

            showMessage(
                "Performance saved successfully.",
                true
            );
        } catch (error) {
            console.error("Saving performance failed:", error);

            showMessage(
                "Could not save performance: " +
                (error.message || "Unknown error")
            );
        } finally {
            isSaving = false;

            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = "Save Performance";
            }
        }
    }

    saveButton?.addEventListener("click", savePerformance);

    /* =====================================================
       STUDENT SELECTION
    ===================================================== */

    studentSelect?.addEventListener("change", async () => {
        const student = students.find(
            item => item.id === studentSelect.value
        );

        await loadPerformance(student || null);
    });

    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    function initializeSidebar() {
        const sidebar = $("adminSidebar");
        const overlay = $("sidebarOverlay");
        const menuButton = $("menuButton");
        const closeButton = $("sidebarClose");

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

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeSidebar();
        });

        document.querySelectorAll(".admin-nav-link").forEach(link => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 768) closeSidebar();
            });
        });
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    function initializeLogout() {
        const logoutButton = $("logoutButton");

        logoutButton?.addEventListener("click", async () => {
            if (!window.confirm("Are you sure you want to log out?")) {
                return;
            }

            const client = getClient();

            try {
                if (client) {
                    const { error } = await client.auth.signOut();
                    if (error) throw error;
                }

                sessionStorage.removeItem("pjtAdminLoggedIn");
                sessionStorage.removeItem("pjtAdminId");

                window.location.replace("../login.html");
            } catch (error) {
                console.error("Logout failed:", error);
                window.alert("Logout failed: " + error.message);
            }
        });
    }

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    document.addEventListener("DOMContentLoaded", async () => {
        initializeSidebar();
        initializeLogout();

        // Render zero immediately so stale hardcoded badge values disappear.
        renderNotificationCount(0);

        await Promise.allSettled([
            loadStudentOptions(),
            updateNotificationBadges()
        ]);
    });

})();
