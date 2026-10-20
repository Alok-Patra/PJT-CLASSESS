/* =====================================================
   PJT CLASSES — ADMIN PROFILE REQUESTS
   Supabase Integration
   - Admin verification
   - View pending requests
   - Approve or reject requests
   - Apply approved changes through Supabase RPC
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const client = window.supabaseClient;

    const container = document.getElementById("requestsContainer");
    const statusMessage = document.getElementById("requestsMessage");
    const refreshButton = document.getElementById("refreshRequests");

    let isProcessing = false;

    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(message, isError = false) {
        if (!statusMessage) {
            if (isError) console.error(message);
            else console.log(message);
            return;
        }

        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "#b42318" : "#247a45";
    }

    /* =====================================================
       SAFE HTML
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (!value) return "Unknown date";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? "Unknown date"
            : date.toLocaleString("en-IN");
    }

    function readableLabel(value) {
        return String(value ?? "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    function readableRequestType(type) {
        const types = {
            guardian_details: "Parent / Guardian Details",
            profile_update: "Student Profile Update"
        };

        return types[type] || readableLabel(type);
    }

    /* =====================================================
       REQUEST DATA DISPLAY
    ===================================================== */

    function formatRequestData(data) {
        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return "<p>No request details supplied.</p>";
        }

        const entries = Object.entries(data);

        if (!entries.length) {
            return "<p>No request details supplied.</p>";
        }

        return `
            <dl class="request-details">
                ${entries.map(([key, value]) => {
                    const displayValue =
                        value === null || value === ""
                            ? "Not provided"
                            : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value);

                    return `
                        <div>
                            <dt>${escapeHTML(readableLabel(key))}</dt>
                            <dd>${escapeHTML(displayValue)}</dd>
                        </div>
                    `;
                }).join("")}
            </dl>
        `;
    }

    /* =====================================================
       VERIFY ADMIN SESSION
    ===================================================== */

    async function verifyAdmin() {
        if (!client) {
            throw new Error(
                "Supabase client is not initialized. Check the script order."
            );
        }

        const {
            data: sessionData,
            error: sessionError
        } = await client.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData?.session;

        if (!session) {
            window.location.replace("../login.html");
            return false;
        }

        const {
            data: profile,
            error: profileError
        } = await client
            .from("profiles")
            .select("id, role")
            .eq("id", session.user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        if (
            !profile ||
            String(profile.role || "").trim().toLowerCase() !== "admin"
        ) {
            await client.auth.signOut();
            window.location.replace("login.html");
            return false;
        }

        return true;
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    function renderEmptyState() {
        container.innerHTML = `
            <div class="empty-requests">
                <h3>No pending requests</h3>
                <p>New student submissions will appear here.</p>
            </div>
        `;
    }

    /* =====================================================
       RENDER REQUEST CARDS
    ===================================================== */

    function renderRequests(requests) {
        container.replaceChildren();

        requests.forEach(request => {
            const card = document.createElement("article");

            card.className = "profile-request-card";

            const requestType = escapeHTML(
                readableRequestType(request.request_type)
            );

            const studentId = escapeHTML(request.student_id);
            const requestId = escapeHTML(request.id);
            const createdAt = escapeHTML(formatDate(request.created_at));

            card.innerHTML = `
                <div class="request-card-header">
                    <div>
                        <h3>${requestType}</h3>
                        <p><strong>Student UUID:</strong> ${studentId}</p>
                        <p><strong>Submitted:</strong> ${createdAt}</p>
                    </div>

                    <span class="request-status pending">Pending</span>
                </div>

                <div class="request-card-body">
                    ${formatRequestData(request.requested_data)}
                </div>

                ${
                    request.admin_note
                        ? `<p class="request-admin-note">
                            <strong>Previous admin note:</strong>
                            ${escapeHTML(request.admin_note)}
                           </p>`
                        : ""
                }

                <div class="request-card-actions">
                    <button
                        type="button"
                        class="approve-request-btn"
                        data-request-id="${requestId}"
                        data-request-status="approved"
                    >
                        Approve
                    </button>

                    <button
                        type="button"
                        class="reject-request-btn"
                        data-request-id="${requestId}"
                        data-request-status="rejected"
                    >
                        Reject
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    /* =====================================================
       APPROVE / REJECT REQUEST
       The database RPC must apply the changes and update
       the request status in the same transaction.
    ===================================================== */

    async function updateRequestStatus(requestId, newStatus) {
        if (isProcessing) return;

        if (!["approved", "rejected"].includes(newStatus)) {
            showMessage("Invalid request status.", true);
            return;
        }

        const actionText =
            newStatus === "approved" ? "approve" : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this request?`
        );

        if (!confirmed) return;

        isProcessing = true;

        const actionButtons = container.querySelectorAll(
            `[data-request-id="${CSS.escape(requestId)}"]`
        );

        actionButtons.forEach(button => {
            button.disabled = true;
        });

        showMessage(
            newStatus === "approved"
                ? "Approving request and saving changes..."
                : "Rejecting request..."
        );

        try {
            const {
                data,
                error
            } = await client.rpc("review_guardian_request", {
                p_request_id: requestId,
                p_status: newStatus
            });

            if (error) throw error;

            if (!data || data.success !== true) {
                throw new Error(
                    "The database did not confirm the request update."
                );
            }

            showMessage(
                newStatus === "approved"
                    ? "Request approved. The database confirmed the operation."
                    : "Request rejected successfully."
            );

            await loadRequests();
        } catch (error) {
            console.error("Request review failed:", error);

            showMessage(
                error.message ||
                    "Could not process the request. Check the browser console.",
                true
            );

            actionButtons.forEach(button => {
                button.disabled = false;
            });
        } finally {
            isProcessing = false;
        }
    }

    /* =====================================================
       BUTTON EVENT HANDLING
    ===================================================== */

    container?.addEventListener("click", async event => {
        const button = event.target.closest(
            "[data-request-status][data-request-id]"
        );

        if (!button || button.disabled) return;

        const requestId = button.dataset.requestId;
        const newStatus = button.dataset.requestStatus;

        if (!requestId) {
            showMessage("Request ID is missing.", true);
            return;
        }

        await updateRequestStatus(requestId, newStatus);
    });

    /* =====================================================
       LOAD PENDING REQUESTS
    ===================================================== */

    async function loadRequests() {
        if (!container) {
            console.error(
                "Missing #requestsContainer in profile-requests.html."
            );
            return;
        }

        container.innerHTML = "<p>Loading requests...</p>";

        try {
            const isAdmin = await verifyAdmin();

            if (!isAdmin) return;

            const {
                data: requests,
                error
            } = await client
                .from("profile_change_requests")
                .select(`
                    id,
                    student_id,
                    request_type,
                    requested_data,
                    status,
                    admin_note,
                    created_at
                `)
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) throw error;

            if (!requests || requests.length === 0) {
                renderEmptyState();
                showMessage("Requests loaded successfully.");
                return;
            }

            renderRequests(requests);
            showMessage(
                `${requests.length} pending request(s) loaded successfully.`
            );
        } catch (error) {
            console.error("Could not load profile requests:", error);

            container.innerHTML = `
                <div class="empty-requests">
                    <h3>Unable to load requests</h3>
                    <p>Check your connection and browser console.</p>
                </div>
            `;

            showMessage(
                error.message || "Could not load requests.",
                true
            );
        }
    }

    /* =====================================================
       REFRESH BUTTON
    ===================================================== */

    refreshButton?.addEventListener("click", async () => {
        if (isProcessing) {
            showMessage(
                "Please wait for the current request to finish.",
                true
            );
            return;
        }

        await loadRequests();
    });

    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadRequests();
});