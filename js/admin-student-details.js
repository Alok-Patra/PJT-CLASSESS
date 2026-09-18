/* =========================================================
   PJT CLASSES
   ADMIN STUDENT DETAILS
========================================================= */


/* =========================================================
   STUDENT DATABASE - DEMO DATA
========================================================= */

const students = {

    "STU-2026-001": {
        id: "STU-2026-001",
        name: "Rahul Kumar",
        className: "Class 10",
        session: "2026–27",
        phone: "9876543210",
        guardian: "Rajesh Kumar",
        guardianPhone: "9876543220",

        paid: 3600,
        pending: 3600,

        performance: {
            overall: 78,
            Mathematics: 82,
            Science: 76,
            English: 80
        },

        behaviour: {
            rating: "Good",
            grade: "A",
            note: "Regular attendance and participates well during class activities."
        },

        fees: [
            "Paid",
            "Paid",
            "Pending",
            "Paid",
            "Paid",
            "Pending",
            "Pending",
            "Paid",
            "Pending",
            "Pending",
            "Paid",
            "Pending"
        ],

        members: [
            {
                name: "Ankit Kumar",
                relation: "Brother"
            },
            {
                name: "Suman Kumar",
                relation: "Sister"
            }
        ]
    },


    "STU-2026-002": {
        id: "STU-2026-002",
        name: "Aman Singh",
        className: "Class 9",
        session: "2026–27",
        phone: "9876543211",
        guardian: "Sanjay Singh",
        guardianPhone: "9876543221",

        paid: 7200,
        pending: 0,

        performance: {
            overall: 84,
            Mathematics: 88,
            Science: 82,
            English: 81
        },

        behaviour: {
            rating: "Excellent",
            grade: "A+",
            note: "Very disciplined and consistently participates in class activities."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid"
        ],

        members: [
            {
                name: "Arun Singh",
                relation: "Brother"
            }
        ]
    },


    "STU-2026-003": {
        id: "STU-2026-003",
        name: "Priya Sharma",
        className: "Class 10",
        session: "2026–27",
        phone: "9876543212",
        guardian: "Manoj Sharma",
        guardianPhone: "9876543222",

        paid: 6000,
        pending: 1200,

        performance: {
            overall: 89,
            Mathematics: 92,
            Science: 88,
            English: 87
        },

        behaviour: {
            rating: "Excellent",
            grade: "A+",
            note: "Excellent classroom discipline and active participation."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Pending",
            "Paid"
        ],

        members: [
            {
                name: "Pooja Sharma",
                relation: "Sister"
            },
            {
                name: "Neha Sharma",
                relation: "Sister"
            }
        ]
    },


    "STU-2026-004": {
        id: "STU-2026-004",
        name: "Rohit Verma",
        className: "Class 8",
        session: "2026–27",
        phone: "9876543213",
        guardian: "Ramesh Verma",
        guardianPhone: "9876543223",

        paid: 3000,
        pending: 4200,

        performance: {
            overall: 71,
            Mathematics: 74,
            Science: 70,
            English: 69
        },

        behaviour: {
            rating: "Good",
            grade: "B+",
            note: "Generally well behaved but needs improvement in regular attendance."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Pending",
            "Pending",
            "Pending",
            "Pending",
            "Pending",
            "Paid",
            "Pending"
        ],

        members: [
            {
                name: "Mohit Verma",
                relation: "Brother"
            }
        ]
    },


    "STU-2026-005": {
        id: "STU-2026-005",
        name: "Neha Kumari",
        className: "Class 12",
        session: "2026–27",
        phone: "9876543214",
        guardian: "Mahesh Kumar",
        guardianPhone: "9876543224",

        paid: 7200,
        pending: 0,

        performance: {
            overall: 91,
            Mathematics: 94,
            Science: 90,
            English: 89
        },

        behaviour: {
            rating: "Excellent",
            grade: "A+",
            note: "Highly disciplined, punctual and actively involved in class."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid"
        ],

        members: []
    },


    "STU-2026-006": {
        id: "STU-2026-006",
        name: "Vikas Kumar",
        className: "Class 11",
        session: "2026–27",
        phone: "9876543215",
        guardian: "Dinesh Kumar",
        guardianPhone: "9876543225",

        paid: 4200,
        pending: 3000,

        performance: {
            overall: 74,
            Mathematics: 78,
            Science: 73,
            English: 71
        },

        behaviour: {
            rating: "Good",
            grade: "B+",
            note: "Good classroom behaviour with scope for more consistent participation."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Pending",
            "Pending",
            "Pending",
            "Paid",
            "Pending"
        ],

        members: [
            {
                name: "Vijay Kumar",
                relation: "Brother"
            }
        ]
    },


    "STU-2026-007": {
        id: "STU-2026-007",
        name: "Anjali Singh",
        className: "Class 9",
        session: "2026–27",
        phone: "9876543216",
        guardian: "Rakesh Singh",
        guardianPhone: "9876543226",

        paid: 5400,
        pending: 1800,

        performance: {
            overall: 86,
            Mathematics: 89,
            Science: 85,
            English: 84
        },

        behaviour: {
            rating: "Good",
            grade: "A",
            note: "Respectful and cooperative with teachers and classmates."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Pending",
            "Pending",
            "Paid"
        ],

        members: [
            {
                name: "Ankit Singh",
                relation: "Brother"
            }
        ]
    },


    "STU-2026-008": {
        id: "STU-2026-008",
        name: "Deepak Das",
        className: "Class 10",
        session: "2026–27",
        phone: "9876543217",
        guardian: "Prakash Das",
        guardianPhone: "9876543227",

        paid: 7200,
        pending: 0,

        performance: {
            overall: 88,
            Mathematics: 91,
            Science: 87,
            English: 86
        },

        behaviour: {
            rating: "Excellent",
            grade: "A+",
            note: "Consistently disciplined and maintains excellent classroom conduct."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid"
        ],

        members: []
    },


    "STU-2026-009": {
        id: "STU-2026-009",
        name: "Sneha Kumari",
        className: "Class 8",
        session: "2026–27",
        phone: "9876543218",
        guardian: "Sunil Kumar",
        guardianPhone: "9876543228",

        paid: 2400,
        pending: 4800,

        performance: {
            overall: 69,
            Mathematics: 70,
            Science: 68,
            English: 67
        },

        behaviour: {
            rating: "Needs Attention",
            grade: "B",
            note: "Needs improvement in attendance, regularity and classroom participation."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Pending",
            "Pending",
            "Pending",
            "Pending",
            "Pending",
            "Pending",
            "Pending",
            "Pending"
        ],

        members: [
            {
                name: "Riya Kumari",
                relation: "Sister"
            }
        ]
    },


    "STU-2026-010": {
        id: "STU-2026-010",
        name: "Amit Raj",
        className: "Class 12",
        session: "2026–27",
        phone: "9876543219",
        guardian: "Ajay Raj",
        guardianPhone: "9876543229",

        paid: 6600,
        pending: 600,

        performance: {
            overall: 93,
            Mathematics: 95,
            Science: 92,
            English: 91
        },

        behaviour: {
            rating: "Excellent",
            grade: "A+",
            note: "Excellent discipline, punctuality and classroom participation."
        },

        fees: [
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Paid",
            "Pending",
            "Paid"
        ],

        members: [
            {
                name: "Rahul Raj",
                relation: "Brother"
            }
        ]
    }

};


/* =========================================================
   GET STUDENT ID FROM URL
========================================================= */

const urlParams = new URLSearchParams(
    window.location.search
);

const studentIdFromURL =
    urlParams.get("id");


/* =========================================================
   FIND STUDENT
========================================================= */

const student =
    students[studentIdFromURL];


/* =========================================================
   STUDENT NOT FOUND
========================================================= */

if (!student) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const content =
                document.querySelector(".admin-content");

            if (!content) return;

            content.innerHTML = `

                <div style="
                    background:#ffffff;
                    border:1px solid #e7ebf2;
                    border-radius:14px;
                    padding:50px;
                    text-align:center;
                ">

                    <div style="
                        font-size:42px;
                        margin-bottom:15px;
                    ">
                        🔍
                    </div>

                    <h2 style="
                        margin:0 0 10px;
                    ">
                        Student Not Found
                    </h2>

                    <p style="
                        color:#718096;
                        margin-bottom:22px;
                    ">
                        No student record was found for
                        <strong>
                            ${studentIdFromURL || "this request"}
                        </strong>.
                    </p>

                    <a
                        href="students.html"
                        style="
                            display:inline-block;
                            padding:11px 18px;
                            border-radius:8px;
                            background:#2563eb;
                            color:#ffffff;
                            text-decoration:none;
                            font-size:12px;
                            font-weight:700;
                        "
                    >
                        ← Back to Students
                    </a>

                </div>

            `;

        }
    );

} else {


    /* =====================================================
       WAIT FOR HTML
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            populateStudentDetails(student);

        }
    );

}


/* =========================================================
   MAIN FUNCTION
========================================================= */

function populateStudentDetails(student) {


    /* =====================================================
       PROFILE HEADER
    ===================================================== */

    setText(
        "studentName",
        student.name
    );

    setText(
        "studentId",
        student.id
    );

    setText(
        "studentClass",
        student.className
    );


    const sessionElement =
        document.querySelector(
            ".student-meta span:nth-of-type(5)"
        );

    if (sessionElement) {

        sessionElement.textContent =
            `Session ${student.session}`;

    }


    /* =====================================================
       AVATAR
    ===================================================== */

    const initials =
        student.name
            .split(" ")
            .map(name => name.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();


    setText(
        "studentAvatar",
        initials
    );


    /* =====================================================
       PERSONAL INFORMATION
    ===================================================== */

    setText(
        "infoName",
        student.name
    );

    setText(
        "infoId",
        student.id
    );

    setText(
        "infoClass",
        student.className
    );

    setText(
        "infoPhone",
        student.phone
    );

    setText(
        "infoGuardian",
        student.guardian
    );

    setText(
        "infoGuardianPhone",
        student.guardianPhone
    );


    /* =====================================================
       FEES
    ===================================================== */

    setText(
        "paidAmount",
        formatRupees(student.paid)
    );

    setText(
        "pendingAmount",
        formatRupees(student.pending)
    );


    const annualFee = 7200;

    const percentage =
        Math.round(
            (student.paid / annualFee) * 100
        );


    setText(
        "paymentPercentage",
        `${percentage}%`
    );


    const progress =
        document.getElementById(
            "paymentProgress"
        );

    if (progress) {

        progress.style.width =
            `${percentage}%`;

    }


    /* =====================================================
       PERFORMANCE
    ===================================================== */

    const performanceScore =
        document.querySelector(
            ".performance-score strong"
        );

    if (performanceScore) {

        performanceScore.textContent =
            `${student.performance.overall}%`;

    }


    const subjectRows =
        document.querySelectorAll(
            ".subject-row"
        );


    subjectRows.forEach(
        function (row) {

            const subjectName =
                row.querySelector(
                    "span"
                );

            const subjectValue =
                row.querySelector(
                    "strong"
                );

            const subjectFill =
                row.querySelector(
                    ".subject-fill"
                );


            if (!subjectName) return;


            const subject =
                subjectName.textContent.trim();


            const value =
                student.performance[subject];


            if (
                value !== undefined
            ) {

                if (subjectValue) {

                    subjectValue.textContent =
                        `${value}%`;

                }

                if (subjectFill) {

                    subjectFill.style.width =
                        `${value}%`;

                }

            }

        }
    );


    /* =====================================================
       BEHAVIOUR
    ===================================================== */

    const behaviourRating =
        document.querySelector(
            ".behaviour-rating strong"
        );

    if (behaviourRating) {

        behaviourRating.textContent =
            student.behaviour.rating;

    }


    const ratingCircle =
        document.querySelector(
            ".rating-circle"
        );

    if (ratingCircle) {

        ratingCircle.textContent =
            student.behaviour.grade;

    }


    const behaviourNote =
        document.querySelector(
            ".behaviour-notes p"
        );

    if (behaviourNote) {

        behaviourNote.textContent =
            student.behaviour.note;

    }


    /* =====================================================
       MONTHLY FEES
    ===================================================== */

    renderMonthlyFees(
        student.fees
    );


    /* =====================================================
       MEMBERS
    ===================================================== */

    renderMembers(
        student.members
    );

}


/* =========================================================
   MONTHLY FEES
========================================================= */

function renderMonthlyFees(
    feeData
) {

    const months = [
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb"
    ];


    const container =
        document.querySelector(
            ".monthly-fee-grid"
        );


    if (!container) return;


    container.innerHTML = "";


    months.forEach(
        function (month, index) {

            const status =
                feeData[index];


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                `month-item ${
                    status === "Paid"
                        ? "paid"
                        : "pending"
                }`;


            item.innerHTML = `

                <span>
                    ${month}
                </span>

                <strong>
                    ${status}
                </strong>

            `;


            container.appendChild(item);

        }
    );

}


/* =========================================================
   MEMBERS
========================================================= */

function renderMembers(
    members
) {

    const container =
        document.querySelector(
            ".members-list"
        );


    if (!container) return;


    container.innerHTML = "";


    members.forEach(
        function (member) {

            const initials =
                member.name
                    .split(" ")
                    .map(word => word.charAt(0))
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "member-item";


            item.innerHTML = `

                <div class="member-avatar">
                    ${initials}
                </div>

                <div class="member-info">

                    <strong>
                        ${member.name}
                    </strong>

                    <span>
                        ${member.relation} · Added member
                    </span>

                </div>

            `;


            container.appendChild(item);

        }
    );


    /* =====================================================
       EMPTY SLOTS
    ===================================================== */

    const emptySlots =
        3 - members.length;


    for (
        let i = 0;
        i < emptySlots;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "member-empty";


        empty.innerHTML = `

            <span>+</span>

            <p>
                No ${getOrdinal(i + members.length + 1)}
                member added
            </p>

        `;


        container.appendChild(empty);

    }

}


/* =========================================================
   ORDINAL
========================================================= */

function getOrdinal(number) {

    if (number === 1) return "first";
    if (number === 2) return "second";
    if (number === 3) return "third";

    return `${number}th`;

}


/* =========================================================
   SET TEXT HELPER
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   RUPEE FORMAT
========================================================= */

function formatRupees(
    amount
) {

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


        if (
            menuButton &&
            sidebar
        ) {

            menuButton.addEventListener(
                "click",
                function () {

                    sidebar.classList.add(
                        "open"
                    );

                    if (overlay) {

                        overlay.classList.add(
                            "show"
                        );

                    }

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


        function closeSidebar() {

            if (sidebar) {

                sidebar.classList.remove(
                    "open"
                );

            }

            if (overlay) {

                overlay.classList.remove(
                    "show"
                );

            }

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