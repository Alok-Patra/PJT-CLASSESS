
/* =========================================================
   PJT CLASSES
   ADMIN STUDENTS — SUPABASE INTEGRATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const client = window.supabaseClient;

    const tableBody = document.getElementById("studentsTableBody");
    const searchInput = document.getElementById("studentSearch");
    const classFilter = document.getElementById("classFilter");
    const resultCount = document.getElementById("resultCount");
    const emptyState = document.getElementById("emptyState");
    const studentTotal = document.getElementById("studentTotal");

    if (!client) {
        console.error("Supabase client is missing.");
        showError("Unable to connect to the database.");
        return;
    }

    let students = [];

    function showError(message) {
        if (tableBody) tableBody.replaceChildren();

        if (emptyState) {
            emptyState.classList.add("show");
            const paragraph = emptyState.querySelector("p");
            if (paragraph) paragraph.textContent = message;
        }

        if (resultCount) resultCount.textContent = "Unable to load students";
        if (studentTotal) studentTotal.textContent = "—";
    }

    function makeCell(text, className) {
        const cell = document.createElement("td");
        const span = document.createElement("span");

        if (className) span.className = className;
        span.textContent = text;
        cell.appendChild(span);

        return cell;
    }

    function getInitials(name) {
        return (name || "Student")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join("")
            .toUpperCase();
    }

    function renderStudents(list) {
        tableBody.replaceChildren();

        if (resultCount) {
            resultCount.textContent =
                `${list.length} student${list.length !== 1 ? "s" : ""}`;
        }

        if (emptyState) {
            const paragraph = emptyState.querySelector("p");

            if (list.length === 0) {
                emptyState.classList.add("show");
                if (paragraph) {
                    paragraph.textContent =
                        students.length === 0
                            ? "No registered student profiles were found."
                            : "Try changing your search or class filter.";
                }
            } else {
                emptyState.classList.remove("show");
                if (paragraph) {
                    paragraph.textContent =
                        "Try changing your search or class filter.";
                }
            }
        }

        list.forEach(student => {
            const row = document.createElement("tr");

            // Student name and initials
            const studentCell = document.createElement("td");
            const studentWrapper = document.createElement("div");
            studentWrapper.className = "student-cell";

            const avatar = document.createElement("div");
            avatar.className = "student-avatar";
            avatar.textContent = getInitials(student.name);

            const nameWrapper = document.createElement("div");
            nameWrapper.className = "student-name";

            const name = document.createElement("strong");
            name.textContent = student.name;

            const subtitle = document.createElement("span");
            subtitle.textContent = "Registered student";

            nameWrapper.append(name, subtitle);
            studentWrapper.append(avatar, nameWrapper);
            studentCell.appendChild(studentWrapper);
            row.appendChild(studentCell);

            // Student ID
            row.appendChild(
                makeCell(student.studentCode, "student-id")
            );

            // Class
            row.appendChild(
                makeCell(
                    student.className
                        ? `Class ${student.className}`
                        : "Not assigned",
                    "class-badge"
                )
            );

            // Phone
            row.appendChild(
                makeCell(student.phone || "Not provided", "phone-number")
            );

            // Fee status
            const feeCell = document.createElement("td");
            const feeBadge = document.createElement("span");
            feeBadge.className = `fee-status ${student.fee}`;

            const dot = document.createElement("span");
            dot.className = "status-dot";
            feeBadge.appendChild(dot);

            const feeLabel = {
                paid: "Paid",
                pending: "Pending",
                unknown: "No record"
            };

            feeBadge.append(
                document.createTextNode(` ${feeLabel[student.fee]}`)
            );

            feeCell.appendChild(feeBadge);
            row.appendChild(feeCell);

            // View details — use the actual profile UUID
            const actionCell = document.createElement("td");
            const detailsLink = document.createElement("a");

            detailsLink.href =
                `student-details.html?id=${encodeURIComponent(student.id)}`;
            detailsLink.className = "details-button";
            detailsLink.textContent = "View Details";

            actionCell.appendChild(detailsLink);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });
    }

    function filterStudents() {
        const search = (searchInput?.value || "")
            .trim()
            .toLowerCase();

        const selectedClass = classFilter?.value || "all";

        const filtered = students.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(search) ||
                student.studentCode.toLowerCase().includes(search);

            const matchesClass =
                selectedClass === "all" ||
                student.className === selectedClass;

            return matchesSearch && matchesClass;
        });

        renderStudents(filtered);
    }

    searchInput?.addEventListener("input", filterStudents);
    classFilter?.addEventListener("change", filterStudents);

    // Load registered student profiles
    try {
        if (resultCount) resultCount.textContent = "Loading students...";

        const { data: profiles, error: profileError } = await client
            .from("profiles")
            .select("id, full_name, student_id, student_class, mobile_number, role, created_at")
            .eq("role", "student")
            .order("created_at", { ascending: false });

        if (profileError) throw profileError;

        const { data: fees, error: feeError } = await client
            .from("fee_records")
            .select("student_id, amount, paid_amount, status");

        if (feeError) throw feeError;

        const feeTotals = new Map();

        (fees || []).forEach(fee => {
            const key = fee.student_id;
            if (!key) return;

            const current = feeTotals.get(key) || {
                hasRecord: false,
                outstanding: 0
            };

            current.hasRecord = true;
            current.outstanding += Math.max(
                0,
                (Number(fee.amount) || 0) -
                (Number(fee.paid_amount) || 0)
            );

            feeTotals.set(key, current);
        });

        students = (profiles || []).map(profile => {
            const feeInfo = feeTotals.get(profile.id);

            let feeStatus = "unknown";

            if (feeInfo?.hasRecord) {
                feeStatus = feeInfo.outstanding > 0 ? "pending" : "paid";
            }

            return {
                id: profile.id,
                name: profile.full_name || "Unnamed student",
                studentCode: profile.student_id || "Not assigned",
                className: profile.student_class
                    ? String(profile.student_class).replace(/^Class\s*/i, "")
                    : "",
                phone: profile.mobile_number || "",
                fee: feeStatus
            };
        });

        if (studentTotal) {
            studentTotal.textContent = students.length;
        }

        console.log("Supabase student profiles loaded:", students.length);

        filterStudents();
    } catch (error) {
        console.error("Unable to load student records:", error);
        showError(
            "Student data could not be loaded. Check the database connection and access permissions."
        );
    }
});
