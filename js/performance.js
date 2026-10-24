/* =====================================================
   PJT CLASSES - STUDENT PERFORMANCE
   Supabase integration
   - Live student performance
   - Student profile details
   - Real unread notification count
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const client = window.supabaseClient;

    /* =================================================
       SIDEBAR
    ================================================= */

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarClose = document.getElementById("sidebarClose");
    const mobileMenu = document.getElementById("mobileMenu");

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

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && window.innerWidth <= 768) {
            closeSidebar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    document.getElementById("notificationButton")?.addEventListener(
        "click",
        () => {
            window.location.href = "notifications.html";
        }
    );

    /* =================================================
       HELPERS
    ================================================= */

    const summaryCards = [
        ...document.querySelectorAll(".summary-grid .summary-card")
    ];

    const subjectRows = [
        ...document.querySelectorAll(".subject-list .subject-row")
    ];

    const resultsBody = document.querySelector(
        ".table-wrapper tbody"
    );

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function showMessage(message) {
        let notice = document.getElementById("performanceNotice");

        if (!notice) {
            notice = document.createElement("p");
            notice.id = "performanceNotice";
            notice.setAttribute("role", "status");

            const intro = document.querySelector(".page-intro");

            if (intro) {
                intro.insertAdjacentElement("afterend", notice);
            } else {
                document.querySelector(".performance-page")
                    ?.prepend(notice);
            }
        }

        notice.textContent = message;
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function percent(record) {
        const obtained = Number(record.marks_obtained);
        const maximum = Number(record.max_marks);

        if (
            !Number.isFinite(obtained) ||
            !Number.isFinite(maximum) ||
            maximum <= 0
        ) {
            return null;
        }

        return (obtained / maximum) * 100;
    }

    function rounded(value) {
        return `${Math.round(value * 10) / 10}%`;
    }

    function statusFor(value) {
        if (value >= 90) {
            return {
                label: "Excellent",
                className: "result-excellent"
            };
        }

        if (value >= 75) {
            return {
                label: "Good",
                className: "result-good"
            };
        }

        if (value >= 50) {
            return {
                label: "Average",
                className: "result-average"
            };
        }

        return {
            label: "Needs Improvement",
            className: "result-average"
        };
    }

    function makeCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        return cell;
    }

    function clearResults() {
        if (resultsBody) resultsBody.replaceChildren();

        subjectRows.forEach(row => {
            const score = row.querySelector(".subject-score");
            const detail = row.querySelector(".subject-info span");
            const bar = row.querySelector(".progress-bar");

            setText(score, "—");
            setText(detail, "No records yet");

            if (bar) {
                bar.style.width = "0%";
                bar.dataset.progress = "0";
            }
        });

        summaryCards.forEach((card, index) => {
            const strong = card.querySelector("strong");
            const small = card.querySelector("small");

            if (index === 0) {
                setText(strong, "—");
                setText(small, "No records yet");
            } else if (index === 1) {
                setText(strong, "0");
                setText(small, "Assessments recorded");
            } else if (index === 2) {
                setText(strong, "—");
                setText(small, "No records yet");
            } else if (index === 3) {
                setText(strong, "—");
                setText(small, "Not enough results");
            }
        });
    }

    /* =================================================
       NOTIFICATION COUNT - SAME AS PROFILE PAGE
    ================================================= */

    async function loadNotificationCount(userId) {
        const badges = document.querySelectorAll(
            ".notification-badge, #notificationButton span, " +
            ".notification-button span, .mobile-alert b"
        );

        // Hide hard-coded notification counts.
        badges.forEach(badge => {
            badge.textContent = "0";
            badge.style.display = "none";
        });

        if (!client || !userId) {
            console.error(
                "Notification count: Supabase client or student session missing."
            );
            return;
        }

        try {
            const {
                data: notificationRows,
                error: notificationsError
            } = await client
                .from("notifications")
                .select("id, student_id, target_student_id");

            if (notificationsError) throw notificationsError;

            // Include messages for this student and broadcast messages.
            const relevantNotifications = (
                notificationRows || []
            ).filter(notification => {
                const studentId = notification.student_id || null;
                const targetStudentId =
                    notification.target_student_id || null;

                return (
                    studentId === userId ||
                    targetStudentId === userId ||
                    (!studentId && !targetStudentId)
                );
            });

            if (relevantNotifications.length === 0) {
                return;
            }

            const {
                data: readRows,
                error: readsError
            } = await client
                .from("notification_reads")
                .select("notification_id")
                .eq("student_id", userId);

            if (readsError) throw readsError;

            const readIds = new Set(
                (readRows || []).map(row =>
                    String(row.notification_id)
                )
            );

            const unreadCount = relevantNotifications.filter(
                notification =>
                    !readIds.has(String(notification.id))
            ).length;

            // Update sidebar, top bar and mobile badges.
            badges.forEach(badge => {
                badge.textContent = String(unreadCount);
                badge.style.display =
                    unreadCount > 0 ? "" : "none";

                badge.setAttribute(
                    "aria-label",
                    `${unreadCount} unread notifications`
                );
            });

            console.log(
                "Unread notifications loaded:",
                unreadCount
            );
        } catch (error) {
            console.error(
                "Could not load unread notification count:",
                error
            );

            // Do not show a false notification count.
            badges.forEach(badge => {
                badge.textContent = "0";
                badge.style.display = "none";
            });
        }
    }

    /* =================================================
       SUBJECT DISPLAY
    ================================================= */

    function updateSubjectRows(records) {
        const bySubject = new Map();

        records.forEach(record => {
            const value = percent(record);

            if (value === null) return;

            const name = (record.subject || "").trim();

            if (!name) return;

            if (!bySubject.has(name)) {
                bySubject.set(name, {
                    obtained: 0,
                    maximum: 0
                });
            }

            const subject = bySubject.get(name);

            subject.obtained += Number(record.marks_obtained);
            subject.maximum += Number(record.max_marks);
        });

        const subjects = [...bySubject.entries()].map(
            ([name, data]) => ({
                name,
                obtained: data.obtained,
                maximum: data.maximum,
                percentage: data.maximum > 0
                    ? (data.obtained / data.maximum) * 100
                    : 0
            })
        );

        subjectRows.forEach(row => {
            const nameElement = row.querySelector(
                ".subject-info strong"
            );

            const name = nameElement?.textContent.trim();

            const detail = row.querySelector(
                ".subject-info span"
            );

            const score = row.querySelector(".subject-score");
            const bar = row.querySelector(".progress-bar");

            const subject = subjects.find(item =>
                item.name.toLowerCase() ===
                (name || "").toLowerCase()
            );

            if (!subject) {
                setText(detail, "No records yet");
                setText(score, "—");

                if (bar) {
                    bar.style.width = "0%";
                    bar.dataset.progress = "0";
                }

                return;
            }

            setText(
                detail,
                `${subject.obtained} out of ${subject.maximum}`
            );

            setText(score, rounded(subject.percentage));

            if (bar) {
                bar.dataset.progress = subject.percentage;

                bar.style.width =
                    `${Math.min(100, subject.percentage)}%`;
            }
        });

        return subjects;
    }

    /* =================================================
       RECENT RESULTS TABLE
    ================================================= */

    function updateResultsTable(records) {
        if (!resultsBody) return;

        resultsBody.replaceChildren();

        const recent = [...records]
            .filter(record => percent(record) !== null)
            .sort((a, b) =>
                (b.exam_date || "").localeCompare(a.exam_date || "")
            )
            .slice(0, 10);

        if (recent.length === 0) {
            const row = document.createElement("tr");
            const cell = makeCell(
                "No performance records available yet."
            );

            cell.colSpan = 6;
            row.appendChild(cell);
            resultsBody.appendChild(row);

            return;
        }

        recent.forEach(record => {
            const percentage = percent(record);
            const status = statusFor(percentage);

            const row = document.createElement("tr");

            row.appendChild(
                makeCell(record.assessment_name || "Assessment")
            );

            row.appendChild(
                makeCell(record.subject || "—")
            );

            row.appendChild(
                makeCell(formatDate(record.exam_date))
            );

            row.appendChild(
                makeCell(
                    `${record.marks_obtained} / ${record.max_marks}`
                )
            );

            row.appendChild(
                makeCell(rounded(percentage))
            );

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");

            badge.className = status.className;
            badge.textContent = status.label;

            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            resultsBody.appendChild(row);
        });
    }

    /* =================================================
       SUMMARY CARDS
    ================================================= */

    function updateSummary(records, subjects) {
        const validRecords = records.filter(
            record => percent(record) !== null
        );

        const totalObtained = validRecords.reduce(
            (sum, record) =>
                sum + Number(record.marks_obtained),
            0
        );

        const totalMaximum = validRecords.reduce(
            (sum, record) =>
                sum + Number(record.max_marks),
            0
        );

        const overall = totalMaximum > 0
            ? (totalObtained / totalMaximum) * 100
            : null;

        const assessmentNames = new Set(
            validRecords
                .map(record => record.assessment_name)
                .filter(Boolean)
        );

        const highest = [...subjects].sort(
            (a, b) => b.percentage - a.percentage
        )[0];

        const cards = summaryCards;

        if (cards[0]) {
            setText(
                cards[0].querySelector("strong"),
                overall === null ? "—" : rounded(overall)
            );

            setText(
                cards[0].querySelector("small"),
                overall === null
                    ? "No records yet"
                    : statusFor(overall).label
            );
        }

        if (cards[1]) {
            setText(
                cards[1].querySelector("strong"),
                String(assessmentNames.size)
            );

            setText(
                cards[1].querySelector("small"),
                "Distinct assessments recorded"
            );
        }

        if (cards[2]) {
            setText(
                cards[2].querySelector("strong"),
                highest?.name || "—"
            );

            setText(
                cards[2].querySelector("small"),
                highest
                    ? rounded(highest.percentage)
                    : "No records yet"
            );
        }

        if (cards[3]) {
            const grouped = new Map();

            validRecords.forEach(record => {
                const key =
                    record.assessment_name || "Assessment";

                if (!grouped.has(key)) {
                    grouped.set(key, {
                        date: record.exam_date || "",
                        obtained: 0,
                        maximum: 0
                    });
                }

                const group = grouped.get(key);

                group.obtained += Number(record.marks_obtained);
                group.maximum += Number(record.max_marks);

                if ((record.exam_date || "") > group.date) {
                    group.date = record.exam_date;
                }
            });

            const assessments = [...grouped.entries()]
                .map(([name, data]) => ({
                    name,
                    date: data.date,
                    percentage: data.maximum > 0
                        ? data.obtained / data.maximum * 100
                        : 0
                }))
                .sort((a, b) =>
                    b.date.localeCompare(a.date)
                );

            let progressText = "Not enough results";
            let progressValue = "—";

            if (assessments.length >= 2) {
                const change =
                    assessments[0].percentage -
                    assessments[1].percentage;

                progressValue =
                    `${change > 0 ? "+" : ""}${rounded(change)}`;

                progressText =
                    "Compared with previous assessment";
            }

            setText(
                cards[3].querySelector("strong"),
                progressValue
            );

            setText(
                cards[3].querySelector("small"),
                progressText
            );
        }
    }

    /* =================================================
       AUTHENTICATE AND LOAD STUDENT DATA
    ================================================= */

    if (!client) {
        clearResults();

        showMessage(
            "Supabase has not initialized. Please check the script loading order."
        );

        return;
    }

    try {
        const {
            data: authData,
            error: authError
        } = await client.auth.getUser();

        if (authError || !authData?.user) {
            window.location.href = "../login.html";
            return;
        }

        const user = authData.user;

        // Notification fix: load the real unread count.
        await loadNotificationCount(user.id);

        const {
            data: profile,
            error: profileError
        } = await client
            .from("profiles")
            .select(
                "id, full_name, student_id, student_class, role"
            )
            .eq("id", user.id)
            .single();

        if (profileError) throw profileError;

        if (
            String(profile.role || "").toLowerCase() !== "student"
        ) {
            showMessage(
                "This page is available to student accounts only."
            );

            return;
        }

        // Update student information in the sidebar.
        const sidebarStudent =
            document.querySelector(".sidebar-student");

        const topbarUser =
            document.querySelector(".topbar-user");

        const initials = (profile.full_name || "S")
            .split(/\s+/)
            .map(part => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        if (sidebarStudent) {
            setText(
                sidebarStudent.querySelector("strong"),
                profile.full_name || "Student"
            );

            setText(
                sidebarStudent.querySelector("small"),
                profile.student_id || ""
            );

            setText(
                sidebarStudent.querySelector(".student-avatar"),
                initials
            );
        }

        if (topbarUser) {
            setText(
                topbarUser.querySelector("strong"),
                profile.full_name || "Student"
            );

            setText(
                topbarUser.querySelector("small"),
                profile.student_class
                    ? `Class ${String(profile.student_class).replace(/^Class\s*/i, "")}`
                    : "Student"
            );

            setText(
                topbarUser.querySelector(".user-avatar"),
                initials
            );
        }

        // Load performance records for the logged-in student.
        const {
            data: records,
            error: recordsError
        } = await client
            .from("performance_records")
            .select(
                "id, student_id, subject, assessment_name, marks_obtained, max_marks, exam_date, remarks"
            )
            .eq("student_id", user.id)
            .order("exam_date", { ascending: false });

        if (recordsError) throw recordsError;

        const safeRecords = records || [];

        if (safeRecords.length === 0) {
            clearResults();
            updateResultsTable([]);

            showMessage(
                "No performance records have been added for your account yet."
            );

            return;
        }

        const subjects = updateSubjectRows(safeRecords);

        updateResultsTable(safeRecords);
        updateSummary(safeRecords, subjects);

        showMessage(
            "Your performance records have been loaded."
        );

    } catch (error) {
        console.error(
            "Student performance loading failed:",
            error
        );

        clearResults();

        showMessage(
            "Could not load performance data. Please check your login and Supabase permissions."
        );
    }
});