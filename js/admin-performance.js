/* =========================================================
   PJT CLASSES
   ADMIN PERFORMANCE
========================================================= */


/* =========================================================
   STUDENT DATA
========================================================= */

const students = {

    "STU-2026-001": {
        name: "Rahul Kumar",
        id: "STU-2026-001",
        className: "Class 10",
        mathematics: 82,
        science: 76,
        english: 80
    },

    "STU-2026-002": {
        name: "Aman Singh",
        id: "STU-2026-002",
        className: "Class 9",
        mathematics: 88,
        science: 82,
        english: 81
    },

    "STU-2026-003": {
        name: "Priya Sharma",
        id: "STU-2026-003",
        className: "Class 10",
        mathematics: 92,
        science: 88,
        english: 87
    },

    "STU-2026-004": {
        name: "Rohit Verma",
        id: "STU-2026-004",
        className: "Class 8",
        mathematics: 74,
        science: 70,
        english: 69
    },

    "STU-2026-005": {
        name: "Neha Kumari",
        id: "STU-2026-005",
        className: "Class 12",
        mathematics: 94,
        science: 90,
        english: 89
    },

    "STU-2026-006": {
        name: "Vikas Kumar",
        id: "STU-2026-006",
        className: "Class 11",
        mathematics: 78,
        science: 73,
        english: 71
    },

    "STU-2026-007": {
        name: "Anjali Singh",
        id: "STU-2026-007",
        className: "Class 9",
        mathematics: 89,
        science: 85,
        english: 84
    },

    "STU-2026-008": {
        name: "Deepak Das",
        id: "STU-2026-008",
        className: "Class 10",
        mathematics: 91,
        science: 87,
        english: 86
    },

    "STU-2026-009": {
        name: "Sneha Kumari",
        id: "STU-2026-009",
        className: "Class 8",
        mathematics: 70,
        science: 68,
        english: 67
    },

    "STU-2026-010": {
        name: "Amit Raj",
        id: "STU-2026-010",
        className: "Class 12",
        mathematics: 95,
        science: 92,
        english: 91
    }

};


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

const mathInput =
    document.getElementById(
        "mathMarks"
    );

const scienceInput =
    document.getElementById(
        "scienceMarks"
    );

const englishInput =
    document.getElementById(
        "englishMarks"
    );

const mathDisplay =
    document.getElementById(
        "mathDisplay"
    );

const scienceDisplay =
    document.getElementById(
        "scienceDisplay"
    );

const englishDisplay =
    document.getElementById(
        "englishDisplay"
    );

const mathProgress =
    document.getElementById(
        "mathProgress"
    );

const scienceProgress =
    document.getElementById(
        "scienceProgress"
    );

const englishProgress =
    document.getElementById(
        "englishProgress"
    );

const overallDisplay =
    document.getElementById(
        "overallDisplay"
    );

const overallProgress =
    document.getElementById(
        "overallProgress"
    );

const recordName =
    document.getElementById(
        "recordName"
    );

const recordId =
    document.getElementById(
        "recordId"
    );

const recordClass =
    document.getElementById(
        "recordClass"
    );

const recordOverall =
    document.getElementById(
        "recordOverall"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


/* =========================================================
   INITIALIZE STUDENTS
========================================================= */

function loadStudentOptions() {

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

        loadStudentOptions();

    }
);


/* =========================================================
   STUDENT SELECT CHANGE
========================================================= */

if (studentSelect) {

    studentSelect.addEventListener(
        "change",
        function () {

            const id =
                this.value;

            if (!id) {

                resetPerformance();

                return;

            }


            const student =
                students[id];


            if (student) {

                loadPerformance(
                    student
                );

            }

        }
    );

}


/* =========================================================
   LOAD PERFORMANCE
========================================================= */

function loadPerformance(
    student
) {

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


    mathInput.value =
        student.mathematics;

    scienceInput.value =
        student.science;

    englishInput.value =
        student.english;


    updatePerformanceDisplay(
        student
    );


    formMessage.textContent =
        "";

}


/* =========================================================
   UPDATE DISPLAY
========================================================= */

function updatePerformanceDisplay(
    student
) {

    const math =
        Number(student.mathematics) || 0;

    const science =
        Number(student.science) || 0;

    const english =
        Number(student.english) || 0;


    const overall =
        Math.round(
            (math + science + english) / 3
        );


    mathDisplay.textContent =
        `${math}%`;

    scienceDisplay.textContent =
        `${science}%`;

    englishDisplay.textContent =
        `${english}%`;


    mathProgress.style.width =
        `${math}%`;

    scienceProgress.style.width =
        `${science}%`;

    englishProgress.style.width =
        `${english}%`;


    overallDisplay.textContent =
        `${overall}%`;

    overallProgress.style.width =
        `${overall}%`;


    recordName.textContent =
        student.name;

    recordId.textContent =
        student.id;

    recordClass.textContent =
        student.className;

    recordOverall.textContent =
        `${overall}%`;

}


/* =========================================================
   LIVE INPUT UPDATE
========================================================= */

function liveUpdate() {

    const math =
        Number(mathInput.value) || 0;

    const science =
        Number(scienceInput.value) || 0;

    const english =
        Number(englishInput.value) || 0;


    const overall =
        Math.round(
            (math + science + english) / 3
        );


    mathDisplay.textContent =
        `${math}%`;

    scienceDisplay.textContent =
        `${science}%`;

    englishDisplay.textContent =
        `${english}%`;


    mathProgress.style.width =
        `${math}%`;

    scienceProgress.style.width =
        `${science}%`;

    englishProgress.style.width =
        `${english}%`;


    overallDisplay.textContent =
        `${overall}%`;

    overallProgress.style.width =
        `${overall}%`;


    recordOverall.textContent =
        `${overall}%`;

}


if (mathInput) {

    mathInput.addEventListener(
        "input",
        liveUpdate
    );

}


if (scienceInput) {

    scienceInput.addEventListener(
        "input",
        liveUpdate
    );

}


if (englishInput) {

    englishInput.addEventListener(
        "input",
        liveUpdate
    );

}


/* =========================================================
   SAVE PERFORMANCE
========================================================= */

const saveButton =
    document.getElementById(
        "savePerformance"
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


            const math =
                Number(mathInput.value);

            const science =
                Number(scienceInput.value);

            const english =
                Number(englishInput.value);


            if (
                Number.isNaN(math) ||
                Number.isNaN(science) ||
                Number.isNaN(english)
            ) {

                formMessage.style.color =
                    "#dc2626";

                formMessage.textContent =
                    "Please enter marks for all subjects.";

                return;

            }


            if (
                math < 0 ||
                math > 100 ||
                science < 0 ||
                science > 100 ||
                english < 0 ||
                english > 100
            ) {

                formMessage.style.color =
                    "#dc2626";

                formMessage.textContent =
                    "Marks must be between 0 and 100.";

                return;

            }


            students[selectedId].mathematics =
                math;

            students[selectedId].science =
                science;

            students[selectedId].english =
                english;


            updatePerformanceDisplay(
                students[selectedId]
            );


            formMessage.style.color =
                "#16a34a";

            formMessage.textContent =
                "Performance updated successfully.";

        }
    );

}


/* =========================================================
   RESET
========================================================= */

function resetPerformance() {

    previewAvatar.textContent =
        "--";

    previewName.textContent =
        "Select Student";

    previewInfo.textContent =
        "Student ID · Class";


    mathInput.value = "";
    scienceInput.value = "";
    englishInput.value = "";


    mathDisplay.textContent =
        "0%";

    scienceDisplay.textContent =
        "0%";

    englishDisplay.textContent =
        "0%";


    mathProgress.style.width =
        "0%";

    scienceProgress.style.width =
        "0%";

    englishProgress.style.width =
        "0%";


    overallDisplay.textContent =
        "0%";

    overallProgress.style.width =
        "0%";


    recordName.textContent =
        "-";

    recordId.textContent =
        "-";

    recordClass.textContent =
        "-";

    recordOverall.textContent =
        "-";

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