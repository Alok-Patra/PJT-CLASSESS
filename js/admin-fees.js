/* =========================================================
   PJT CLASSES
   ADMIN FEES
========================================================= */


/* =========================================================
   STUDENT DATA
========================================================= */

const students = {

    "STU-2026-001": {
        name: "Rahul Kumar",
        id: "STU-2026-001",
        className: "Class 10",

        fees: [
            true,
            true,
            false,
            true,
            true,
            false,
            false,
            true,
            false,
            false,
            true,
            false
        ]
    },


    "STU-2026-002": {
        name: "Aman Singh",
        id: "STU-2026-002",
        className: "Class 9",

        fees: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ]
    },


    "STU-2026-003": {
        name: "Priya Sharma",
        id: "STU-2026-003",
        className: "Class 10",

        fees: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            true
        ]
    },


    "STU-2026-004": {
        name: "Rohit Verma",
        id: "STU-2026-004",
        className: "Class 8",

        fees: [
            true,
            true,
            true,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            true,
            false
        ]
    },


    "STU-2026-005": {
        name: "Neha Kumari",
        id: "STU-2026-005",
        className: "Class 12",

        fees: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ]
    },


    "STU-2026-006": {
        name: "Vikas Kumar",
        id: "STU-2026-006",
        className: "Class 11",

        fees: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false,
            false,
            true,
            false
        ]
    },


    "STU-2026-007": {
        name: "Anjali Singh",
        id: "STU-2026-007",
        className: "Class 9",

        fees: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false,
            true
        ]
    },


    "STU-2026-008": {
        name: "Deepak Das",
        id: "STU-2026-008",
        className: "Class 10",

        fees: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ]
    },


    "STU-2026-009": {
        name: "Sneha Kumari",
        id: "STU-2026-009",
        className: "Class 8",

        fees: [
            true,
            true,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ]
    },


    "STU-2026-010": {
        name: "Amit Raj",
        id: "STU-2026-010",
        className: "Class 12",

        fees: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            true
        ]
    }

};


/* =========================================================
   MONTHS
========================================================= */

const months = [
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February"
];


const monthlyFee = 600;


/* =========================================================
   ELEMENTS
========================================================= */

const studentSelect =
    document.getElementById(
        "studentSelect"
    );

const previewAvatar =
    document.getElementById(
        "previewAvatar"
    );

const previewName =
    document.getElementById(
        "previewName"
    );

const previewInfo =
    document.getElementById(
        "previewInfo"
    );

const monthlyGrid =
    document.getElementById(
        "monthlyGrid"
    );

const paidAmount =
    document.getElementById(
        "paidAmount"
    );

const pendingAmount =
    document.getElementById(
        "pendingAmount"
    );

const paidMonths =
    document.getElementById(
        "paidMonths"
    );

const paymentPercentage =
    document.getElementById(
        "paymentPercentage"
    );

const paymentProgress =
    document.getElementById(
        "paymentProgress"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


/* =========================================================
   LOAD STUDENTS
========================================================= */

function loadStudents() {

    if (!studentSelect) return;


    Object.values(students).forEach(
        student => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                student.id;

            option.textContent =
                `${student.name} — ${student.id}`;

            studentSelect.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudents();

    }
);


/* =========================================================
   STUDENT CHANGE
========================================================= */

if (studentSelect) {

    studentSelect.addEventListener(
        "change",
        function () {

            const student =
                students[this.value];


            if (!student) {

                resetPage();

                return;

            }


            loadStudent(student);

        }
    );

}


/* =========================================================
   LOAD STUDENT
========================================================= */

function loadStudent(student) {

    const initials =
        student.name
            .split(" ")
            .map(word =>
                word.charAt(0)
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();


    previewAvatar.textContent =
        initials;


    previewName.textContent =
        student.name;


    previewInfo.textContent =
        `${student.id} · ${student.className}`;


    renderMonths(
        student.fees
    );


    updateSummary(
        student.fees
    );


    formMessage.textContent = "";

}


/* =========================================================
   RENDER MONTHS
========================================================= */

function renderMonths(
    fees
) {

    monthlyGrid.innerHTML = "";


    months.forEach(
        function (month, index) {

            const paid =
                fees[index];


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                `month-item ${
                    paid
                        ? "selected-paid"
                        : "selected-pending"
                }`;


            item.innerHTML = `

                <div class="month-top">

                    <span class="month-name">
                        ${month}
                    </span>

                    <span class="month-amount">
                        ₹600
                    </span>

                </div>


                <div class="month-status">

                    <span
                        class="status-badge ${
                            paid
                                ? "paid"
                                : "pending"
                        }"
                    >
                        ${
                            paid
                                ? "Paid"
                                : "Pending"
                        }
                    </span>


                    <button
                        type="button"
                        class="toggle-status"
                        data-index="${index}"
                    >
                        ${
                            paid
                                ? "Mark Pending"
                                : "Mark Paid"
                        }
                    </button>

                </div>

            `;


            const toggle =
                item.querySelector(
                    ".toggle-status"
                );


            toggle.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const selectedId =
                        studentSelect.value;


                    if (!selectedId) return;


                    students[selectedId]
                        .fees[index] =
                            !students[selectedId]
                                .fees[index];


                    renderMonths(
                        students[selectedId]
                            .fees
                    );


                    updateSummary(
                        students[selectedId]
                            .fees
                    );


                    formMessage.textContent =
                        "Fee status changed. Click Save to confirm.";

                    formMessage.style.color =
                        "#ea580c";

                }
            );


            monthlyGrid.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(
    fees
) {

    const count =
        fees.filter(Boolean).length;


    const paid =
        count * monthlyFee;


    const pending =
        7200 - paid;


    const percentage =
        Math.round(
            (paid / 7200) * 100
        );


    paidAmount.textContent =
        formatRupees(paid);


    pendingAmount.textContent =
        formatRupees(pending);


    paidMonths.textContent =
        `${count} / 12`;


    paymentPercentage.textContent =
        `${percentage}%`;


    paymentProgress.style.width =
        `${percentage}%`;

}


/* =========================================================
   SAVE
========================================================= */

const saveButton =
    document.getElementById(
        "saveFees"
    );


if (saveButton) {

    saveButton.addEventListener(
        "click",
        function () {

            const selectedId =
                studentSelect.value;


            if (!selectedId) {

                formMessage.style.color =
                    "#dc2626";

                formMessage.textContent =
                    "Please select a student.";

                return;

            }


            formMessage.style.color =
                "#16a34a";

            formMessage.textContent =
                "Fee status saved successfully.";

        }
    );

}


/* =========================================================
   RESET
========================================================= */

function resetPage() {

    previewAvatar.textContent =
        "--";


    previewName.textContent =
        "Select Student";


    previewInfo.textContent =
        "Student ID · Class";


    monthlyGrid.innerHTML = "";


    paidAmount.textContent =
        "₹0";


    pendingAmount.textContent =
        "₹0";


    paidMonths.textContent =
        "0 / 12";


    paymentPercentage.textContent =
        "0%";


    paymentProgress.style.width =
        "0%";


    formMessage.textContent =
        "";

}


/* =========================================================
   RUPEE FORMAT
========================================================= */

function formatRupees(amount) {

    return "₹" +
        Number(amount)
            .toLocaleString("en-IN");

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const menuButton =
            document.getElementById(
                "menuButton"
            );

        const sidebar =
            document.getElementById(
                "adminSidebar"
            );

        const overlay =
            document.getElementById(
                "sidebarOverlay"
            );

        const closeButton =
            document.getElementById(
                "sidebarClose"
            );


        function closeSidebar() {

            sidebar.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "show"
            );

        }


        if (menuButton) {

            menuButton.addEventListener(
                "click",
                function () {

                    sidebar.classList.add(
                        "open"
                    );

                    overlay.classList.add(
                        "show"
                    );

                }
            );

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeSidebar
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeSidebar
            );

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                function () {

                    sessionStorage.removeItem(
                        "pjtAdminLoggedIn"
                    );

                    sessionStorage.removeItem(
                        "pjtAdminId"
                    );


                    window.location.href =
                        "login.html";

                }
            );

        }

    }
);