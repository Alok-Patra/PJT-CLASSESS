
/* =========================================================
   PJT CLASSES
   ADMIN DASHBOARD
========================================================= */

/* =========================================================
   MOBILE SIDEBAR AND LOGOUT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("adminSidebar");
    const menuButton = document.getElementById("menuButton");
    const closeButton = document.getElementById("sidebarClose");
    const overlay = document.getElementById("sidebarOverlay");
    const logoutButton = document.getElementById("logoutButton");

    function openSidebar() {
        if (sidebar) sidebar.classList.add("open");
        if (overlay) overlay.classList.add("show");
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
    }

    if (menuButton) {
        menuButton.addEventListener("click", openSidebar);
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    document.querySelectorAll(".admin-nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 800) closeSidebar();
        });
    });

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            if (!window.confirm("Are you sure you want to logout?")) {
                return;
            }

            const client = window.supabaseClient;

            try {
                if (client) {
                    const { error } = await client.auth.signOut();

                    if (error) throw error;
                }

                sessionStorage.removeItem("pjtAdminLoggedIn");
                sessionStorage.removeItem("pjtAdminId");

                window.location.href = "login.html";
            } catch (error) {
                console.error("Logout error:", error.message);
                alert("Logout failed. Please try again.");
            }
        });
    }
});


/* =========================================================
   LOAD STUDENTS, PERFORMANCE RECORDS AND RECENT STUDENTS
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const client = window.supabaseClient;

    const totalElement =
        document.getElementById("totalStudentsValue");

    const performanceElement =
        document.getElementById("studentsWithRecordsValue");

    const list =
        document.getElementById("recentStudentsList");

    if (!client) {
        console.error("Supabase client is missing.");

        if (totalElement) totalElement.textContent = "—";
        if (performanceElement) performanceElement.textContent = "—";

        if (list) {
            list.textContent = "Unable to connect to the database.";
        }

        return;
    }

    try {
        // Verify the current Supabase session.
        const { data: sessionData, error: sessionError } =
            await client.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData.session) {
            console.error("No active Supabase session.");

            if (totalElement) totalElement.textContent = "—";
            if (performanceElement) performanceElement.textContent = "—";

            if (list) {
                list.textContent = "Please log in to view students.";
            }

            return;
        }

        // Load registered student profiles.
        const { data: students, error: studentError } = await client
            .from("profiles")
            .select(
                "id, full_name, student_id, student_class, role, created_at"
            )
            .eq("role", "student")
            .order("created_at", { ascending: false });

        if (studentError) throw studentError;

        const studentList = students || [];

        // Total registered students.
        if (totalElement) {
            totalElement.textContent = studentList.length;
        }

        // Build a set of registered student UUIDs.
        const registeredStudentIds = new Set(
            studentList.map(student => student.id).filter(Boolean)
        );

        // Count unique registered students who have performance records.
        // This query has its own error handler so the recent student
        // list can still load if performance-record access is denied.
        if (performanceElement) {
            performanceElement.textContent = "…";

            try {
                const { data: records, error: performanceError } =
                    await client
                        .from("performance_records")
                        .select("student_id");

                if (performanceError) throw performanceError;

                const studentsWithRecords = new Set(
                    (records || [])
                        .map(record => record.student_id)
                        .filter(id => registeredStudentIds.has(id))
                );

                performanceElement.textContent =
                    studentsWithRecords.size;

                console.log(
                    "Students with performance records:",
                    studentsWithRecords.size
                );
            } catch (performanceError) {
                console.error(
                    "Unable to load performance records:",
                    performanceError.message
                );

                performanceElement.textContent = "—";
            }
        }

        // Load recent students.
        if (list) {
            list.replaceChildren();

            if (studentList.length === 0) {
                list.textContent = "No student records found.";
            } else {
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
            }
        }

        console.log("Registered students loaded:", studentList.length);

    } catch (error) {
        console.error("Unable to load students:", error);

        if (totalElement) totalElement.textContent = "—";

        if (list) {
            list.textContent =
                "Unable to load students. Check the browser console.";
        }
    }
});


/* =========================================================
   LOAD SESSION FEES
   Academic session: March 2026 - February 2027
   Monthly fee: ₹600
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const client = window.supabaseClient;

    if (!client) {
        console.error("Supabase client is missing.");
        return;
    }

    try {
        const { data: students, error: studentError } = await client
            .from("profiles")
            .select("id")
            .eq("role", "student");

        if (studentError) throw studentError;

        const { data: fees, error: feeError } = await client
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

        // Use one payment value for each student and month.
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

            const paid = Math.min(
                Math.max(Number(fee.paid_amount) || 0, 0),
                amount,
                monthlyFee
            );

            const previous = monthlyPayments.get(key) || 0;

            monthlyPayments.set(
                key,
                Math.max(previous, paid)
            );
        });

        const expectedTotal =
            (students || []).length * months.length * monthlyFee;

        const paidTotal = Math.min(
            Array.from(monthlyPayments.values())
                .reduce((sum, amount) => sum + amount, 0),
            expectedTotal
        );

        const pendingTotal = Math.max(
            expectedTotal - paidTotal,
            0
        );

        const pendingRecords = Math.max(
            (students || []).length * months.length -
            monthlyPayments.size,
            0
        );

        const collectionPercentage = expectedTotal > 0
            ? Math.round((paidTotal / expectedTotal) * 100)
            : 0;

        const pendingRecordsElement =
            document.getElementById("pendingFeeRecordsValue");

        if (pendingRecordsElement) {
            pendingRecordsElement.textContent = pendingRecords;
        }

        const collectionElement =
            document.getElementById("feeCollectionPercentage");

        if (collectionElement) {
            collectionElement.textContent =
                collectionPercentage + "%";
        }

        const progressElement =
            document.getElementById("feeCollectionProgress");

        if (progressElement) {
            progressElement.style.width =
                collectionPercentage + "%";
        }

        const paidElement =
            document.getElementById("feesPaidValue");

        if (paidElement) {
            paidElement.textContent =
                "₹" + paidTotal.toLocaleString("en-IN");
        }

        [
            "pendingFeesValue",
            "feesPendingBreakdownValue",
            "feeOverviewPendingValue"
        ].forEach(id => {
            const element = document.getElementById(id);

            if (element) {
                element.textContent =
                    "₹" + pendingTotal.toLocaleString("en-IN");
            }
        });

        console.log("Session fee summary:", {
            registeredStudents: (students || []).length,
            expectedTotal,
            paidTotal,
            pendingTotal,
            pendingRecords,
            collectionPercentage
        });

    } catch (error) {
        console.error(
            "Unable to load session fee summary:",
            error
        );
    }
});

