/* =========================================================
   PJT CLASSES
   ADMIN BEHAVIOUR
========================================================= */


/* =========================================================
   STUDENT DATA
========================================================= */

const students = {

    "STU-2026-001": {
        name: "Rahul Kumar",
        id: "STU-2026-001",
        className: "Class 10",
        behaviour: "Good",
        grade: "A",
        remarks:
            "Regular attendance and participates well during class activities."
    },

    "STU-2026-002": {
        name: "Aman Singh",
        id: "STU-2026-002",
        className: "Class 9",
        behaviour: "Excellent",
        grade: "A+",
        remarks:
            "Very disciplined and consistently participates in class activities."
    },

    "STU-2026-003": {
        name: "Priya Sharma",
        id: "STU-2026-003",
        className: "Class 10",
        behaviour: "Excellent",
        grade: "A+",
        remarks:
            "Excellent classroom discipline and active participation."
    },

    "STU-2026-004": {
        name: "Rohit Verma",
        id: "STU-2026-004",
        className: "Class 8",
        behaviour: "Good",
        grade: "B+",
        remarks:
            "Generally well behaved but needs improvement in regular attendance."
    },

    "STU-2026-005": {
        name: "Neha Kumari",
        id: "STU-2026-005",
        className: "Class 12",
        behaviour: "Excellent",
        grade: "A+",
        remarks:
            "Highly disciplined, punctual and actively involved in class."
    },

    "STU-2026-006": {
        name: "Vikas Kumar",
        id: "STU-2026-006",
        className: "Class 11",
        behaviour: "Good",
        grade: "B+",
        remarks:
            "Good classroom behaviour with scope for more consistent participation."
    },

    "STU-2026-007": {
        name: "Anjali Singh",
        id: "STU-2026-007",
        className: "Class 9",
        behaviour: "Good",
        grade: "A",
        remarks:
            "Respectful and cooperative with teachers and classmates."
    },

    "STU-2026-008": {
        name: "Deepak Das",
        id: "STU-2026-008",
        className: "Class 10",
        behaviour: "Excellent",
        grade: "A+",
        remarks:
            "Consistently disciplined and maintains excellent classroom conduct."
    },

    "STU-2026-009": {
        name: "Sneha Kumari",
        id: "STU-2026-009",
        className: "Class 8",
        behaviour: "Needs Attention",
        grade: "B",
        remarks:
            "Needs improvement in attendance, regularity and classroom participation."
    },

    "STU-2026-010": {
        name: "Amit Raj",
        id: "STU-2026-010",
        className: "Class 12",
        behaviour: "Excellent",
        grade: "A+",
        remarks:
            "Excellent discipline, punctuality and classroom participation."
    }

};


/* =========================================================
   ELEMENTS
========================================================= */

const studentSelect =
    document.getElementById("studentSelect");

const previewAvatar =
    document.getElementById("previewAvatar");

const previewName =
    document.getElementById("previewName");

const previewInfo =
    document.getElementById("previewInfo");

const behaviourSelect =
    document.getElementById("behaviourSelect");

const behaviourRemarks =
    document.getElementById("behaviourRemarks");

const ratingCircle =
    document.getElementById("ratingCircle");

const behaviourRating =
    document.getElementById("behaviourRating");

const behaviourSummary =
    document.getElementById("behaviourSummary");

const recordName =
    document.getElementById("recordName");

const recordId =
    document.getElementById("recordId");

const recordClass =
    document.getElementById("recordClass");

const recordBehaviour =
    document.getElementById("recordBehaviour");

const formMessage =
    document.getElementById("formMessage");


/* =========================================================
   LOAD STUDENTS
========================================================= */

function loadStudents() {

    if (!studentSelect) return;

    Object.values(students).forEach(student => {

        const option =
            document.createElement("option");

        option.value =
            student.id;

        option.textContent =
            `${student.name} — ${student.id}`;

        studentSelect.appendChild(option);

    });

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
   SELECT STUDENT
========================================================= */

if (studentSelect) {

    studentSelect.addEventListener(
        "change",
        function () {

            const id =
                this.value;

            if (!id) {

                resetBehaviour();

                return;

            }


            const student =
                students[id];


            if (student) {

                loadBehaviour(student);

            }

        }
    );

}


/* =========================================================
   LOAD BEHAVIOUR
========================================================= */

function loadBehaviour(student) {

    const initials =
        student.name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();


    previewAvatar.textContent =
        initials;

    previewName.textContent =
        student.name;

    previewInfo.textContent =
        `${student.id} · ${student.className}`;


    behaviourSelect.value =
        student.behaviour;

    behaviourRemarks.value =
        student.remarks;


    updateBehaviourDisplay(student);


    formMessage.textContent = "";

}


/* =========================================================
   DISPLAY
========================================================= */

function updateBehaviourDisplay(student) {

    ratingCircle.textContent =
        student.grade;

    behaviourRating.textContent =
        student.behaviour;

    behaviourSummary.textContent =
        student.remarks;


    recordName.textContent =
        student.name;

    recordId.textContent =
        student.id;

    recordClass.textContent =
        student.className;

    recordBehaviour.textContent =
        student.behaviour;

}


/* =========================================================
   SAVE
========================================================= */

const saveButton =
    document.getElementById(
        "saveBehaviour"
    );


if (saveButton) {

    saveButton.addEventListener(
        "click",
        function () {

            const selectedId =
                studentSelect.value;


            if (!selectedId) {

                showMessage(
                    "Please select a student.",
                    "#dc2626"
                );

                return;

            }


            const behaviour =
                behaviourSelect.value;


            const remarks =
                behaviourRemarks.value.trim();


            if (!behaviour) {

                showMessage(
                    "Please select a behaviour status.",
                    "#dc2626"
                );

                return;

            }


            if (!remarks) {

                showMessage(
                    "Please enter behaviour remarks.",
                    "#dc2626"
                );

                return;

            }


            students[selectedId].behaviour =
                behaviour;

            students[selectedId].remarks =
                remarks;


            students[selectedId].grade =
                getGrade(behaviour);


            updateBehaviourDisplay(
                students[selectedId]
            );


            showMessage(
                "Behaviour updated successfully.",
                "#16a34a"
            );

        }
    );

}


/* =========================================================
   GRADE
========================================================= */

function getGrade(behaviour) {

    if (behaviour === "Excellent") {
        return "A+";
    }

    if (behaviour === "Good") {
        return "A";
    }

    return "B";

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    color
) {

    formMessage.textContent =
        message;

    formMessage.style.color =
        color;

}


/* =========================================================
   RESET
========================================================= */

function resetBehaviour() {

    previewAvatar.textContent =
        "--";

    previewName.textContent =
        "Select Student";

    previewInfo.textContent =
        "Student ID · Class";


    behaviourSelect.value =
        "";

    behaviourRemarks.value =
        "";


    ratingCircle.textContent =
        "-";

    behaviourRating.textContent =
        "Select Student";

    behaviourSummary.textContent =
        "Select a student to view their behaviour record.";


    recordName.textContent =
        "-";

    recordId.textContent =
        "-";

    recordClass.textContent =
        "-";

    recordBehaviour.textContent =
        "-";

    formMessage.textContent =
        "";

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