/* =====================================================
   PJT CLASSES - FEES JS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       FEE CONFIGURATION
    ================================================= */

    const MONTHLY_FEE = 600;

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


    /*
     * SAMPLE PAYMENT DATA
     *
     * true  = paid
     * false = pending
     *
     * Later this data will come from the backend/database.
     */

    const paymentStatus = [
        true,   // March
        true,   // April
        false,  // May
        true,   // June
        true,   // July
        false,  // August
        false,  // September
        true,   // October
        false,  // November
        false,  // December
        true,   // January
        false   // February
    ];


    /* =================================================
       SIDEBAR
    ================================================= */

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const sidebarClose =
        document.getElementById("sidebarClose");

    const mobileMenu =
        document.getElementById("mobileMenu");


    function openSidebar() {

        if (!sidebar || !sidebarOverlay) {
            return;
        }

        sidebar.classList.add("open");

        sidebarOverlay.classList.add("show");

        document.body.style.overflow = "hidden";
    }


    function closeSidebar() {

        if (!sidebar || !sidebarOverlay) {
            return;
        }

        sidebar.classList.remove("open");

        sidebarOverlay.classList.remove("show");

        document.body.style.overflow = "";
    }


    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            openSidebar
        );

    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    if (window.innerWidth <= 768) {
                        closeSidebar();
                    }

                }
            );

        });


    /* =================================================
       CALCULATE FEES
    ================================================= */

    const totalMonths =
        months.length;

    const paidMonthsCount =
        paymentStatus.filter(
            status => status === true
        ).length;

    const pendingMonthsCount =
        totalMonths - paidMonthsCount;


    const annualFee =
        MONTHLY_FEE * totalMonths;

    const paidAmount =
        MONTHLY_FEE * paidMonthsCount;

    const pendingAmount =
        MONTHLY_FEE * pendingMonthsCount;


    const paymentPercentage =
        Math.round(
            (paidAmount / annualFee) * 100
        );


    /* =================================================
       UPDATE SUMMARY
    ================================================= */

    document.getElementById("annualFee").textContent =
        formatCurrency(annualFee);

    document.getElementById("paidAmount").textContent =
        formatCurrency(paidAmount);

    document.getElementById("pendingAmount").textContent =
        formatCurrency(pendingAmount);

    document.getElementById("paidMonths").textContent =
        `${paidMonthsCount} month${paidMonthsCount !== 1 ? "s" : ""} paid`;

    document.getElementById("pendingMonths").textContent =
        `${pendingMonthsCount} month${pendingMonthsCount !== 1 ? "s" : ""} pending`;


    document.getElementById("paymentPercentage").textContent =
        `${paymentPercentage}%`;

    document.getElementById("progressPaid").textContent =
        formatCurrency(paidAmount);


    /* =================================================
       PROGRESS BAR
    ================================================= */

    setTimeout(() => {

        const progressBar =
            document.getElementById(
                "largeProgressBar"
            );

        if (progressBar) {

            progressBar.style.width =
                `${paymentPercentage}%`;

        }

    }, 250);


    /* =================================================
       CREATE MONTHLY TABLE
    ================================================= */

    const tableBody =
        document.getElementById(
            "feeTableBody"
        );


    if (tableBody) {

        months.forEach(
            (month, index) => {

                const isPaid =
                    paymentStatus[index];

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        <span class="month-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>
                    </td>

                    <td>
                        <span class="month-name">
                            ${month}
                        </span>
                    </td>

                    <td>
                        <span class="amount">
                            ${formatCurrency(MONTHLY_FEE)}
                        </span>
                    </td>

                    <td>
                        <span class="amount">
                            ${formatCurrency(
                                isPaid ? MONTHLY_FEE : 0
                            )}
                        </span>
                    </td>

                    <td>

                        <span class="status ${isPaid ? "paid" : "pending"}">

                            <span class="status-dot-small"></span>

                            ${isPaid ? "Paid" : "Pending"}

                        </span>

                    </td>

                `;


                tableBody.appendChild(row);

            }
        );

    }


    /* =================================================
       PENDING ALERT
    ================================================= */

    const feeAlert =
        document.getElementById(
            "feeAlert"
        );

    const feeAlertText =
        document.getElementById(
            "feeAlertText"
        );


    if (pendingMonthsCount === 0) {

        if (feeAlert) {

            feeAlert.style.display =
                "none";

        }

    } else {

        const pendingMonthNames =
            months.filter(
                (_, index) =>
                    !paymentStatus[index]
            );


        if (feeAlertText) {

            feeAlertText.textContent =
                `Your fee is pending for ${pendingMonthsCount} month${
                    pendingMonthsCount !== 1 ? "s" : ""
                }: ${pendingMonthNames.join(", ")}. ` +
                `Please contact PJT Classes administration for payment details.`;

        }

    }


    /* =================================================
       NOTIFICATION
    ================================================= */

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );


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
       ESCAPE KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                window.innerWidth <= 768
            ) {

                closeSidebar();

            }

        }
    );


    /* =================================================
       RESIZE
    ================================================= */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 768) {

                closeSidebar();

            }

        }
    );


    /* =================================================
       CURRENCY FORMATTER
    ================================================= */

    function formatCurrency(amount) {

        return `₹${amount.toLocaleString("en-IN")}`;

    }

});