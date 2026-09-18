/* =========================================================
   PJT CLASSES
   ADMIN STUDENTS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const students = [

        {
            id: "STU-2026-001",
            name: "Rahul Kumar",
            className: "10",
            phone: "9876543210",
            fee: "pending",
            initials: "RK"
        },

        {
            id: "STU-2026-002",
            name: "Aman Singh",
            className: "9",
            phone: "9876543211",
            fee: "paid",
            initials: "AS"
        },

        {
            id: "STU-2026-003",
            name: "Priya Sharma",
            className: "10",
            phone: "9876543212",
            fee: "paid",
            initials: "PS"
        },

        {
            id: "STU-2026-004",
            name: "Rohit Verma",
            className: "8",
            phone: "9876543213",
            fee: "pending",
            initials: "RV"
        },

        {
            id: "STU-2026-005",
            name: "Neha Kumari",
            className: "12",
            phone: "9876543214",
            fee: "paid",
            initials: "NK"
        },

        {
            id: "STU-2026-006",
            name: "Vikas Kumar",
            className: "11",
            phone: "9876543215",
            fee: "pending",
            initials: "VK"
        },

        {
            id: "STU-2026-007",
            name: "Anjali Singh",
            className: "9",
            phone: "9876543216",
            fee: "paid",
            initials: "AS"
        },

        {
            id: "STU-2026-008",
            name: "Deepak Das",
            className: "10",
            phone: "9876543217",
            fee: "paid",
            initials: "DD"
        },

        {
            id: "STU-2026-009",
            name: "Sneha Kumari",
            className: "8",
            phone: "9876543218",
            fee: "pending",
            initials: "SK"
        },

        {
            id: "STU-2026-010",
            name: "Amit Raj",
            className: "12",
            phone: "9876543219",
            fee: "paid",
            initials: "AR"
        }

    ];


    const tableBody =
        document.getElementById(
            "studentsTableBody"
        );

    const searchInput =
        document.getElementById(
            "studentSearch"
        );

    const classFilter =
        document.getElementById(
            "classFilter"
        );

    const resultCount =
        document.getElementById(
            "resultCount"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudents(list) {

        tableBody.innerHTML = "";


        if (list.length === 0) {

            emptyState.classList.add("show");

            resultCount.textContent =
                "0 students";

            return;

        }


        emptyState.classList.remove("show");


        resultCount.textContent =
            `${list.length} student${list.length !== 1 ? "s" : ""}`;


        list.forEach(student => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="student-cell">

                        <div class="student-avatar">
                            ${student.initials}
                        </div>

                        <div class="student-name">

                            <strong>
                                ${student.name}
                            </strong>

                            <span>
                                Registered student
                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="student-id">
                        ${student.id}
                    </span>

                </td>


                <td>

                    <span class="class-badge">
                        Class ${student.className}
                    </span>

                </td>


                <td>

                    <span class="phone-number">
                        ${student.phone}
                    </span>

                </td>


                <td>

                    <span class="
                        fee-status
                        ${student.fee}
                    ">

                        <span class="status-dot"></span>

                        ${student.fee === "paid"
                            ? "Paid"
                            : "Pending"}

                    </span>

                </td>


                <td>

                    <a
                        href="student-details.html?id=${student.id}"
                        class="details-button">

                        View Details

                    </a>

                </td>

            `;


            tableBody.appendChild(row);

        });

    }


    /* =====================================================
       FILTER
    ===================================================== */

    function filterStudents() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();

        const selectedClass =
            classFilter.value;


        const filtered =
            students.filter(student => {

                const matchesSearch =
                    student.name
                        .toLowerCase()
                        .includes(search) ||

                    student.id
                        .toLowerCase()
                        .includes(search);


                const matchesClass =
                    selectedClass === "all" ||
                    student.className === selectedClass;


                return (
                    matchesSearch &&
                    matchesClass
                );

            });


        renderStudents(filtered);

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    searchInput.addEventListener(
        "input",
        filterStudents
    );

    classFilter.addEventListener(
        "change",
        filterStudents
    );


    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    renderStudents(students);

});