/* =========================================================
   PJT CLASSES
   STUDENT DASHBOARD JAVASCRIPT
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           ELEMENTS
        ================================================= */

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const mobileMenu =
            document.getElementById(
                "mobileMenu"
            );


        const sidebarClose =
            document.getElementById(
                "sidebarClose"
            );


        const sidebarOverlay =
            document.getElementById(
                "sidebarOverlay"
            );


        const searchInput =
            document.getElementById(
                "dashboardSearch"
            );


        const searchClear =
            document.getElementById(
                "searchClear"
            );


        const searchResults =
            document.getElementById(
                "searchResults"
            );


        const searchContainer =
            document.getElementById(
                "searchContainer"
            );


        const notificationButton =
            document.getElementById(
                "notificationButton"
            );


        /* =================================================
           SIDEBAR OPEN
        ================================================= */

        function openSidebar() {

            if (!sidebar) {
                return;
            }


            sidebar.classList.add(
                "open"
            );


            if (sidebarOverlay) {

                sidebarOverlay.classList.add(
                    "show"
                );

            }


            if (mobileMenu) {

                mobileMenu.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }


            document.body.style.overflow =
                "hidden";

        }



        /* =================================================
           SIDEBAR CLOSE
        ================================================= */

        function closeSidebar() {

            if (!sidebar) {
                return;
            }


            sidebar.classList.remove(
                "open"
            );


            if (sidebarOverlay) {

                sidebarOverlay.classList.remove(
                    "show"
                );

            }


            if (mobileMenu) {

                mobileMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }


            document.body.style.overflow =
                "";

        }



        /* =================================================
           TOGGLE BUTTON
        ================================================= */

        if (mobileMenu) {

            mobileMenu.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    if (
                        sidebar.classList.contains(
                            "open"
                        )
                    ) {

                        closeSidebar();

                    } else {

                        openSidebar();

                    }

                }
            );

        }



        /* =================================================
           CLOSE BUTTON
        ================================================= */

        if (sidebarClose) {

            sidebarClose.addEventListener(
                "click",
                () => {

                    closeSidebar();

                }
            );

        }



        /* =================================================
           OVERLAY CLOSE
        ================================================= */

        if (sidebarOverlay) {

            sidebarOverlay.addEventListener(
                "click",
                () => {

                    closeSidebar();

                }
            );

        }



        /* =================================================
           SIDEBAR NAVIGATION
        ================================================= */

        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        navItems.forEach(
            (item) => {

                item.addEventListener(
                    "click",
                    () => {

                        if (
                            window.innerWidth <= 768
                        ) {

                            closeSidebar();

                        }

                    }
                );

            }
        );



        /* =================================================
           SEARCH DATA
        ================================================= */

        const searchData = [

            {
                title:
                    "Student Dashboard",

                description:
                    "Rahul Kumar • Class 10 • STU-2026-001",

                keywords:
                    "student dashboard rahul kumar class 10 id",

                target:
                    ".welcome-card"
            },


            {
                title:
                    "Total Annual Fees",

                description:
                    "₹24,000 total annual fees",

                keywords:
                    "fee fees total annual 24000",

                target:
                    ".total-fee"
            },


            {
                title:
                    "Paid Amount",

                description:
                    "₹16,000 paid so far",

                keywords:
                    "paid amount payment fees 16000",

                target:
                    ".paid-fee"
            },


            {
                title:
                    "Pending Amount",

                description:
                    "₹8,000 pending fees",

                keywords:
                    "pending due amount fees 8000",

                target:
                    ".pending-fee"
            },


            {
                title:
                    "Attendance",

                description:
                    "18 out of 24 classes • 75%",

                keywords:
                    "attendance present absent 18 24 75",

                target:
                    ".attendance-card"
            },


            {
                title:
                    "Academic Performance",

                description:
                    "Mathematics 88% • Science 82% • English 91%",

                keywords:
                    "academic performance marks subjects mathematics science english social",

                target:
                    ".performance-card"
            },


            {
                title:
                    "Mathematics",

                description:
                    "Current performance: 88%",

                keywords:
                    "math mathematics 88",

                target:
                    ".performance-card"
            },


            {
                title:
                    "Science",

                description:
                    "Current performance: 82%",

                keywords:
                    "science 82",

                target:
                    ".performance-card"
            },


            {
                title:
                    "English",

                description:
                    "Current performance: 91%",

                keywords:
                    "english 91",

                target:
                    ".performance-card"
            },


            {
                title:
                    "Social Science",

                description:
                    "Current performance: 78%",

                keywords:
                    "social science sst 78",

                target:
                    ".performance-card"
            },


            {
                title:
                    "Behaviour & Conduct",

                description:
                    "Overall behaviour rating: 85%",

                keywords:
                    "behaviour conduct discipline participation punctuality homework",

                target:
                    ".behaviour-card"
            },


            {
                title:
                    "Discipline",

                description:
                    "Current rating: Good",

                keywords:
                    "discipline behaviour good",

                target:
                    ".behaviour-card"
            },


            {
                title:
                    "Participation",

                description:
                    "Current rating: Excellent",

                keywords:
                    "participation behaviour excellent",

                target:
                    ".behaviour-card"
            },


            {
                title:
                    "Punctuality",

                description:
                    "Current rating: Good",

                keywords:
                    "punctuality behaviour good",

                target:
                    ".behaviour-card"
            },


            {
                title:
                    "Fee Status",

                description:
                    "March 2026 – February 2027",

                keywords:
                    "fee status payment march april may june july august september october november december january february",

                target:
                    ".fees-card"
            },


            {
                title:
                    "March Fee",

                description:
                    "₹2,000 • Paid",

                keywords:
                    "march 2000 paid fee",

                target:
                    ".fees-card"
            },


            {
                title:
                    "April Fee",

                description:
                    "₹2,000 • Paid",

                keywords:
                    "april 2000 paid fee",

                target:
                    ".fees-card"
            },


            {
                title:
                    "May Fee",

                description:
                    "₹2,000 • Pending",

                keywords:
                    "may 2000 pending fee",

                target:
                    ".fees-card"
            },


            {
                title:
                    "June Fee",

                description:
                    "₹2,000 • Paid",

                keywords:
                    "june 2000 paid fee",

                target:
                    ".fees-card"
            },


            {
                title:
                    "July Fee",

                description:
                    "₹2,000 • Paid",

                keywords:
                    "july 2000 paid fee",

                target:
                    ".fees-card"
            },


            {
                title:
                    "Monthly Fee Pending",

                description:
                    "May fee payment is pending",

                keywords:
                    "notification fee pending payment may",

                target:
                    ".notifications-card"
            },


            {
                title:
                    "Class Test Scheduled",

                description:
                    "Mathematics test scheduled",

                keywords:
                    "class test mathematics exam test scheduled",

                target:
                    ".notifications-card"
            },


            {
                title:
                    "New Study Material",

                description:
                    "New study material is available",

                keywords:
                    "study material notes learning",

                target:
                    ".notifications-card"
            }

        ];



        /* =================================================
           ESCAPE HTML
        ================================================= */

        function escapeHTML(
            value
        ) {

            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }



        /* =================================================
           SEARCH ICON
        ================================================= */

        function getSearchIcon(
            title
        ) {

            const value =
                title.toLowerCase();


            if (
                value.includes("fee") ||
                value.includes("payment")
            ) {

                return "₹";

            }


            if (
                value.includes("performance") ||
                value.includes("mathematics") ||
                value.includes("science") ||
                value.includes("english")
            ) {

                return "Σ";

            }


            if (
                value.includes("behaviour") ||
                value.includes("discipline") ||
                value.includes("participation") ||
                value.includes("punctuality")
            ) {

                return "✓";

            }


            if (
                value.includes("notification") ||
                value.includes("test") ||
                value.includes("study")
            ) {

                return "!";

            }


            return "•";

        }



        /* =================================================
           SEARCH
        ================================================= */

        function performSearch() {

            if (
                !searchInput ||
                !searchResults
            ) {

                return;

            }


            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (
                query.length === 0
            ) {

                hideSearchResults();

                return;

            }


            if (searchContainer) {

                searchContainer.classList.add(
                    "searching"
                );

            }


            const words =
                query
                    .split(/\s+/)
                    .filter(Boolean);


            const matches =
                searchData.filter(
                    (item) => {

                        const text =
                            (
                                item.title +
                                " " +
                                item.description +
                                " " +
                                item.keywords
                            ).toLowerCase();


                        return words.every(
                            (word) =>
                                text.includes(
                                    word
                                )
                        );

                    }
                );


            renderSearchResults(
                matches
            );

        }



        /* =================================================
           RENDER SEARCH RESULTS
        ================================================= */

        function renderSearchResults(
            matches
        ) {

            searchResults.innerHTML =
                "";


            if (
                matches.length === 0
            ) {

                searchResults.innerHTML = `
                    <div class="search-empty">
                        No matching information found.
                    </div>
                `;


                searchResults.classList.add(
                    "show"
                );


                return;

            }


            matches
                .slice(0, 8)
                .forEach(
                    (item) => {

                        const button =
                            document.createElement(
                                "button"
                            );


                        button.type =
                            "button";


                        button.className =
                            "search-result";


                        button.innerHTML = `

                            <span class="search-result-icon">
                                ${getSearchIcon(item.title)}
                            </span>

                            <span class="search-result-text">

                                <strong>
                                    ${escapeHTML(item.title)}
                                </strong>

                                <span>
                                    ${escapeHTML(item.description)}
                                </span>

                            </span>

                        `;


                        button.addEventListener(
                            "click",
                            () => {

                                goToResult(
                                    item.target
                                );

                            }
                        );


                        searchResults.appendChild(
                            button
                        );

                    }
                );


            searchResults.classList.add(
                "show"
            );

        }



        /* =================================================
           GO TO RESULT
        ================================================= */

        function goToResult(
            target
        ) {

            const element =
                document.querySelector(
                    target
                );


            if (!element) {

                return;

            }


            hideSearchResults();


            searchInput.value =
                "";


            if (searchContainer) {

                searchContainer.classList.remove(
                    "searching"
                );

            }


            searchInput.blur();


            element.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            element.classList.add(
                "search-highlight"
            );


            setTimeout(
                () => {

                    element.classList.remove(
                        "search-highlight"
                    );

                },
                1600
            );

        }



        /* =================================================
           HIDE SEARCH
        ================================================= */

        function hideSearchResults() {

            if (searchResults) {

                searchResults.classList.remove(
                    "show"
                );

            }

        }



        /* =================================================
           CLEAR SEARCH
        ================================================= */

        function clearSearch() {

            if (!searchInput) {

                return;

            }


            searchInput.value =
                "";


            hideSearchResults();


            if (searchContainer) {

                searchContainer.classList.remove(
                    "searching"
                );

            }


            searchInput.focus();

        }



        /* =================================================
           SEARCH INPUT
        ================================================= */

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                performSearch
            );


            searchInput.addEventListener(
                "keydown",
                (event) => {


                    /* ENTER */

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();


                        const firstResult =
                            searchResults.querySelector(
                                ".search-result"
                            );


                        if (firstResult) {

                            firstResult.click();

                        }

                    }


                    /* ESC */

                    if (
                        event.key === "Escape"
                    ) {

                        hideSearchResults();

                    }

                }
            );

        }



        /* =================================================
           CLEAR SEARCH BUTTON
        ================================================= */

        if (searchClear) {

            searchClear.addEventListener(
                "click",
                clearSearch
            );

        }



        /* =================================================
           CLICK OUTSIDE SEARCH
        ================================================= */

        document.addEventListener(
            "click",
            (event) => {

                if (
                    searchContainer &&
                    !searchContainer.contains(
                        event.target
                    )
                ) {

                    hideSearchResults();

                }

            }
        );



        /* =================================================
           NOTIFICATION BUTTON
        ================================================= */

        if (notificationButton) {

            notificationButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "notifications.html";

                }
            );

        }



        /* =================================================
           KEYBOARD ESC
        ================================================= */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    closeSidebar();

                    hideSearchResults();

                }

            }
        );



        /* =================================================
           WINDOW RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 768
                ) {

                    closeSidebar();

                }

            }
        );


    }
);