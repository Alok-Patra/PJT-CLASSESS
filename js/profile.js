/* =====================================================
   PJT CLASSES - STUDENT PROFILE
   Supabase Integration
   - Live student profile
   - Direct editing: address, DOB, gender
   - Admin approval: name, mobile, guardian details
   - Request history
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const client = window.supabaseClient;

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarClose = document.getElementById("sidebarClose");
    const mobileMenu = document.getElementById("mobileMenu");
    const addMemberBtn = document.getElementById("addMemberBtn");
    const membersList = document.getElementById("membersList");

    let currentUser = null;
    let currentProfile = null;
    let currentMobile = "";
    let currentAddress = "";
    let currentDOB = "";
    let currentGender = "";

    /* =====================================================
       SIDEBAR
    ===================================================== */

    function openSidebar() {
        sidebar?.classList.add("open");
        sidebarOverlay?.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sidebar?.classList.remove("open");
        sidebarOverlay?.classList.remove("show");
        document.body.style.overflow = "";
    }

    mobileMenu?.addEventListener("click", openSidebar);
    sidebarClose?.addEventListener("click", closeSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });

    /* =====================================================
       HELPERS
    ===================================================== */

    function setText(element, value) {
        if (element) {
            element.textContent = value ?? "Not available";
        }
    }

    function getInitials(name) {
        return (name || "Student")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part[0]?.toUpperCase() || "")
            .join("") || "S";
    }

    function formatDate(value) {
        if (!value) return "Not provided";

        // Handle YYYY-MM-DD as a local calendar date.
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

        const date = match
            ? new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            )
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function updateInformation(label, value) {
        document.querySelectorAll(".info-item").forEach(item => {
            const labelElement = item.querySelector(".info-label");

            if (
                labelElement?.textContent.trim().toLowerCase() ===
                label.trim().toLowerCase()
            ) {
                setText(
                    item.querySelector("strong"),
                    value || "Not provided"
                );
            }
        });
    }

    function updateAvatars(name) {
        const initials = getInitials(name);

        document.querySelectorAll(
            ".student-avatar, .user-avatar, .large-avatar"
        ).forEach(avatar => {
            avatar.textContent = initials;
        });
    }

    function showMessage(element, message, type = "info") {
        if (!element) return;

        element.textContent = message;
        element.className = `profile-message ${type}`;
        element.hidden = false;
    }

    function createButton(
        text,
        className = "profile-action-btn"
    ) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = text;
        return button;
    }

    function createField(
        label,
        name,
        value = "",
        type = "text",
        required = true
    ) {
        const wrapper = document.createElement("div");
        wrapper.className = "profile-form-field";

        const labelElement = document.createElement("label");
        labelElement.htmlFor = `profile-field-${name}`;
        labelElement.textContent = label;

        const input = document.createElement("input");
        input.id = `profile-field-${name}`;
        input.name = name;
        input.type = type;
        input.value = value ?? "";
        input.autocomplete = "off";

        if (required) input.required = true;

        if (type === "tel") {
            input.maxLength = 16;
            input.placeholder = "Enter mobile number";
        }

        if (type === "date") {
            input.max = new Date().toISOString().slice(0, 10);
            input.min = "1900-01-01";
        }

        wrapper.append(labelElement, input);

        return wrapper;
    }

    function validPhone(value) {
        return /^[+()\d\s-]{7,16}$/.test(value);
    }

    /* =====================================================
       LOAD STUDENT PROFILE
    ===================================================== */

    async function loadProfile() {
        if (!client) {
            throw new Error(
                "Supabase client not found. Check script order in profile.html."
            );
        }

        const {
            data: sessionData,
            error: sessionError
        } = await client.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData?.session;

        if (!session) {
            window.location.href = "../login.html";
            return false;
        }

        currentUser = session.user;

        const {
            data: profile,
            error: profileError
        } = await client
            .from("profiles")
            .select(`
                id,
                full_name,
                email,
                role,
                student_id,
                student_class,
                created_at,
                address,
                date_of_birth,
                gender
            `)
            .eq("id", currentUser.id)
            .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
            throw new Error(
                "Your student profile was not found. Please contact the administrator."
            );
        }

        if (
            String(profile.role || "").trim().toLowerCase() !== "student"
        ) {
            alert("This page is only available to student accounts.");
            window.location.href = "../login.html";
            return false;
        }

        currentProfile = profile;

        const name = profile.full_name || "Student";
        const email = profile.email || currentUser.email || "";
        const studentId = profile.student_id || "Not assigned";
        const studentClass = profile.student_class || "Not assigned";

        // Sidebar student information.
        setText(
            document.querySelector(".sidebar-student strong"),
            name
        );

        setText(
            document.querySelector(".sidebar-student small"),
            studentId
        );

        // Top bar.
        setText(
            document.querySelector(".user-info strong"),
            name
        );

        setText(
            document.querySelector(".user-info small"),
            studentClass === "Not assigned"
                ? studentClass
                : `Class ${studentClass.replace(/^Class\s*/i, "")}`
        );

        // Profile heading.
        setText(
            document.querySelector(".profile-heading h2"),
            name
        );

        setText(
            document.querySelector(".profile-heading p strong"),
            studentId
        );

        // Existing profile fields.
        updateInformation("Full Name", name);
        updateInformation("Student ID", studentId);
        updateInformation("Class", studentClass);
        updateInformation("Email Address", email);

        updateInformation(
            "Registration Date",
            formatDate(profile.created_at)
        );

        // Student-editable fields.
        currentAddress = profile.address || "";
        currentDOB = profile.date_of_birth || "";
        currentGender = profile.gender || "";

        updateInformation(
            "Address",
            currentAddress || "Not provided"
        );

        updateInformation(
            "Date of Birth",
            currentDOB ? formatDate(currentDOB) : "Not provided"
        );

        updateInformation(
            "Gender",
            currentGender || "Not provided"
        );

        updateAvatars(name);

        // Load mobile number using the confirmed column name.
        const {
            data: mobileData,
            error: mobileError
        } = await client
            .from("profiles")
            .select("mobile_number")
            .eq("id", currentUser.id)
            .maybeSingle();

        if (mobileError) {
            console.error(
                "Mobile number could not be loaded:",
                mobileError.message
            );

            currentMobile = "";
            updateInformation("Mobile Number", "Not available");
        } else {
            currentMobile = mobileData?.mobile_number || "";

            updateInformation(
                "Mobile Number",
                currentMobile || "Not provided"
            );
        }

        // Load approved guardian details.
        await loadGuardianDetails();

        console.log("Student profile loaded successfully.");

        return true;
    }

    /* =====================================================
       LOAD APPROVED GUARDIAN DETAILS
    ===================================================== */

    async function loadGuardianDetails() {
        const {
            data: guardianRows,
            error: guardianError
        } = await client
            .from("student_guardians")
            .select(`
                father_name,
                mother_name,
                guardian_name,
                relationship,
                mobile_number
            `)
            .eq("student_id", currentUser.id)
            .order("created_at", { ascending: true })
            .limit(1);

        if (guardianError) {
            console.error(
                "Guardian details could not be loaded:",
                guardianError.message
            );

            updateInformation("Father's Name", "Not available");
            updateInformation("Mother's Name", "Not available");
            updateInformation("Guardian Contact", "Not available");
            updateInformation("Relationship", "Not available");

            return;
        }

        const guardian = guardianRows?.[0];

        updateInformation(
            "Father's Name",
            guardian?.father_name || "Not provided"
        );

        updateInformation(
            "Mother's Name",
            guardian?.mother_name || "Not provided"
        );

        updateInformation(
            "Guardian Contact",
            guardian?.mobile_number || "Not provided"
        );

        updateInformation(
            "Relationship",
            guardian?.relationship || "Not provided"
        );
    }

    /* =====================================================
       FORM CREATION
    ===================================================== */

    function makeForm(title, description, buttonText) {
        const section = document.createElement("section");
        section.className = "profile-edit-panel";
        section.hidden = true;

        const heading = document.createElement("h4");
        heading.textContent = title;

        const intro = document.createElement("p");
        intro.className = "profile-form-description";
        intro.textContent = description;

        const form = document.createElement("form");
        form.className = "profile-edit-form";

        const fields = document.createElement("div");
        fields.className = "profile-form-grid";

        const message = document.createElement("div");
        message.className = "profile-message";
        message.hidden = true;
        message.setAttribute("role", "status");
        message.setAttribute("aria-live", "polite");

        const actions = document.createElement("div");
        actions.className = "profile-form-actions";

        const submit = createButton(
            buttonText,
            "profile-action-btn primary"
        );

        submit.type = "submit";

        const cancel = createButton(
            "Cancel",
            "profile-action-btn secondary"
        );

        actions.append(submit, cancel);
        form.append(fields, message, actions);
        section.append(heading, intro, form);

        cancel.addEventListener("click", () => {
            section.hidden = true;
            form.reset();
            message.hidden = true;
        });

        return {
            section,
            form,
            fields,
            message,
            submit
        };
    }

    function attachFormToCard(
        card,
        title,
        description,
        buttonText,
        submitText = "Submit for Approval"
    ) {
        const header = card?.querySelector(".card-header");

        if (!header) return null;

        const button = createButton(buttonText);
        header.appendChild(button);

        const formParts = makeForm(
            title,
            description,
            submitText
        );

        header.insertAdjacentElement(
            "afterend",
            formParts.section
        );

        button.addEventListener("click", () => {
            formParts.section.hidden = !formParts.section.hidden;

            if (!formParts.section.hidden) {
                formParts.section.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }
        });

        return formParts;
    }

    /* =====================================================
       DIRECT EDIT: ADDRESS, DOB AND GENDER
       Saved immediately through the secure Supabase RPC.
    ===================================================== */

    function setupDirectPersonalDetailsEdit() {
        const cards = [
            ...document.querySelectorAll(".profile-card")
        ];

        const personalCard = cards.find(card =>
            card.querySelector(".section-label")
                ?.textContent.trim()
                .toLowerCase()
                .includes("personal information")
        );

        if (!personalCard) {
            console.error("Personal Information card not found.");
            return;
        }

        const formParts = attachFormToCard(
            personalCard,
            "Edit Personal Details",
            "Update your address, date of birth, and gender. These changes are saved directly.",
            "Edit Personal Details",
            "Save Details"
        );

        if (!formParts) return;

        const { form, fields, message, submit } = formParts;

        fields.append(
            createField(
                "Address",
                "address",
                currentAddress,
                "text",
                false
            ),
            createField(
                "Date of Birth",
                "date_of_birth",
                currentDOB,
                "date",
                false
            )
        );

        // Gender dropdown.
        const genderWrapper = document.createElement("div");
        genderWrapper.className = "profile-form-field";

        const genderLabel = document.createElement("label");
        genderLabel.htmlFor = "profile-field-gender";
        genderLabel.textContent = "Gender";

        const genderSelect = document.createElement("select");
        genderSelect.id = "profile-field-gender";
        genderSelect.name = "gender";

        [
            ["", "Select gender"],
            ["Male", "Male"],
            ["Female", "Female"],
            ["Other", "Other"],
            ["Prefer not to say", "Prefer not to say"]
        ].forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            genderSelect.appendChild(option);
        });

        genderSelect.value = currentGender;

        genderWrapper.append(genderLabel, genderSelect);
        fields.appendChild(genderWrapper);

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const address = form.elements.address.value.trim();
            const dob = form.elements.date_of_birth.value || null;
            const gender = form.elements.gender.value || null;

            if (address.length > 500) {
                showMessage(
                    message,
                    "Address must be 500 characters or fewer.",
                    "error"
                );
                return;
            }

            if (dob) {
                const selectedDate = new Date(`${dob}T00:00:00`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (
                    Number.isNaN(selectedDate.getTime()) ||
                    selectedDate > today ||
                    dob < "1900-01-01"
                ) {
                    showMessage(
                        message,
                        "Please enter a valid date of birth.",
                        "error"
                    );
                    return;
                }
            }

            submit.disabled = true;
            submit.textContent = "Saving...";
            message.hidden = true;

            try {
                const { data, error } = await client.rpc(
                    "update_my_profile_details",
                    {
                        p_address: address || null,
                        p_date_of_birth: dob,
                        p_gender: gender
                    }
                );

                if (error) throw error;

                if (!data?.success) {
                    throw new Error(
                        "Supabase did not confirm that the details were saved."
                    );
                }

                // Update local state after the database confirms success.
                currentAddress = address;
                currentDOB = dob || "";
                currentGender = gender || "";

                currentProfile.address = currentAddress;
                currentProfile.date_of_birth = currentDOB || null;
                currentProfile.gender = currentGender;

                // Immediately update the displayed profile.
                updateInformation(
                    "Address",
                    currentAddress || "Not provided"
                );

                updateInformation(
                    "Date of Birth",
                    currentDOB
                        ? formatDate(currentDOB)
                        : "Not provided"
                );

                updateInformation(
                    "Gender",
                    currentGender || "Not provided"
                );

                showMessage(
                    message,
                    "Your personal details have been saved successfully.",
                    "success"
                );
            } catch (error) {
                console.error(
                    "Personal details update failed:",
                    error
                );

                showMessage(
                    message,
                    error.message ||
                        "Could not save your personal details.",
                    "error"
                );
            } finally {
                submit.disabled = false;
                submit.textContent = "Save Details";
            }
        });
    }

    /* =====================================================
       ADMIN APPROVAL: OFFICIAL NAME AND MOBILE
    ===================================================== */

    async function submitRequest(
        requestType,
        requestedData,
        messageBox,
        submitButton
    ) {
        messageBox.hidden = true;
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
            if (!currentUser) {
                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const { error } = await client
                .from("profile_change_requests")
                .insert({
                    student_id: currentUser.id,
                    request_type: requestType,
                    requested_data: requestedData,
                    status: "pending"
                });

            if (error) throw error;

            showMessage(
                messageBox,
                "Your request was submitted and is waiting for administrator approval.",
                "success"
            );

            await loadRequestHistory();
        } catch (error) {
            console.error("Request submission failed:", error);

            showMessage(
                messageBox,
                error.message || "Could not submit your request.",
                "error"
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit for Approval";
        }
    }

    function setupPersonalEdit() {
        const cards = [
            ...document.querySelectorAll(".profile-card")
        ];

        const personalCard = cards.find(card =>
            card.querySelector(".section-label")
                ?.textContent.trim()
                .toLowerCase()
                .includes("personal information")
        );

        if (!personalCard) {
            console.error("Personal Information card not found.");
            return;
        }

        const formParts = attachFormToCard(
            personalCard,
            "Edit Official Information",
            "Name and mobile number changes require administrator approval.",
            "Edit Profile",
            "Submit for Approval"
        );

        if (!formParts) return;

        const { form, fields, message, submit } = formParts;

        fields.append(
            createField(
                "Full Name",
                "full_name",
                currentProfile.full_name || ""
            ),
            createField(
                "Mobile Number",
                "mobile_number",
                currentMobile,
                "tel"
            )
        );

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const fullName =
                form.elements.full_name.value.trim();

            const mobileNumber =
                form.elements.mobile_number.value.trim();

            if (fullName.length < 2) {
                showMessage(
                    message,
                    "Please enter your full name.",
                    "error"
                );
                return;
            }

            if (mobileNumber && !validPhone(mobileNumber)) {
                showMessage(
                    message,
                    "Please enter a valid mobile number.",
                    "error"
                );
                return;
            }

            await submitRequest(
                "profile_update",
                {
                    full_name: fullName,
                    mobile_number: mobileNumber
                },
                message,
                submit
            );
        });
    }

    /* =====================================================
       ADMIN APPROVAL: GUARDIAN DETAILS
    ===================================================== */

    function setupGuardianEdit() {
        const cards = [
            ...document.querySelectorAll(".profile-card")
        ];

        const guardianCard = cards.find(card =>
            card.querySelector(".section-label")
                ?.textContent.trim()
                .toLowerCase()
                .includes("family information")
        );

        if (!guardianCard) {
            console.error("Family Information card not found.");
            return;
        }

        const formParts = attachFormToCard(
            guardianCard,
            "Edit Parent / Guardian Details",
            "Submit parent or guardian corrections for administrator approval.",
            "Edit Guardian Details",
            "Submit for Approval"
        );

        if (!formParts) return;

        const { form, fields, message, submit } = formParts;

        fields.append(
            createField(
                "Father's Name",
                "father_name",
                "",
                "text",
                false
            ),
            createField(
                "Mother's Name",
                "mother_name",
                "",
                "text",
                false
            ),
            createField(
                "Guardian Name",
                "guardian_name"
            ),
            createField(
                "Relationship",
                "relationship"
            ),
            createField(
                "Guardian Mobile Number",
                "mobile_number",
                "",
                "tel"
            ),
            createField(
                "Guardian Email",
                "email",
                "",
                "email",
                false
            ),
            createField(
                "Guardian Address",
                "address",
                "",
                "text",
                false
            )
        );

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const values = Object.fromEntries(
                new FormData(form).entries()
            );

            const guardianName =
                values.guardian_name.trim();

            const relationship =
                values.relationship.trim();

            const mobileNumber =
                values.mobile_number.trim();

            if (!guardianName || !relationship || !mobileNumber) {
                showMessage(
                    message,
                    "Enter the guardian name, relationship, and mobile number.",
                    "error"
                );
                return;
            }

            if (!validPhone(mobileNumber)) {
                showMessage(
                    message,
                    "Please enter a valid guardian mobile number.",
                    "error"
                );
                return;
            }

            await submitRequest(
                "guardian_details",
                {
                    father_name: values.father_name.trim(),
                    mother_name: values.mother_name.trim(),
                    guardian_name: guardianName,
                    relationship,
                    mobile_number: mobileNumber,
                    email: values.email.trim(),
                    address: values.address.trim()
                },
                message,
                submit
            );
        });
    }

    /* =====================================================
       REQUEST HISTORY
    ===================================================== */

    function createRequestHistorySection() {
        if (document.getElementById("profileRequestHistory")) {
            return;
        }

        const page = document.querySelector(".profile-page");
        if (!page) return;

        const card = document.createElement("section");
        card.className = "profile-card";

        const header = document.createElement("div");
        header.className = "card-header";

        const content = document.createElement("div");

        const label = document.createElement("span");
        label.className = "section-label";
        label.textContent = "REQUEST TRACKING";

        const heading = document.createElement("h3");
        heading.textContent = "My Profile Requests";

        const description = document.createElement("p");
        description.textContent =
            "Track your submitted profile and guardian requests.";

        content.append(label, heading, description);
        header.appendChild(content);

        const history = document.createElement("div");
        history.id = "profileRequestHistory";
        history.className = "profile-request-history";

        card.append(header, history);

        const note = page.querySelector(".profile-note");

        if (note) {
            note.insertAdjacentElement("beforebegin", card);
        } else {
            page.appendChild(card);
        }
    }

    async function loadRequestHistory() {
        const history = document.getElementById(
            "profileRequestHistory"
        );

        if (!history || !currentUser) return;

        history.replaceChildren();

        const loading = document.createElement("p");
        loading.className = "profile-form-description";
        loading.textContent = "Loading your requests...";
        history.appendChild(loading);

        const { data, error } = await client
            .from("profile_change_requests")
            .select(
                "id, request_type, status, admin_note, created_at"
            )
            .eq("student_id", currentUser.id)
            .order("created_at", { ascending: false });

        history.replaceChildren();

        if (error) {
            console.error(
                "Request history could not be loaded:",
                error
            );

            const errorText = document.createElement("p");
            errorText.textContent =
                "Request history could not be loaded. Please refresh.";

            history.appendChild(errorText);
            return;
        }

        if (!data?.length) {
            const empty = document.createElement("p");
            empty.className = "profile-form-description";
            empty.textContent =
                "You have not submitted any profile requests yet.";

            history.appendChild(empty);
            return;
        }

        data.forEach(request => {
            const item = document.createElement("article");
            item.className = "profile-request-item";

            const title = document.createElement("strong");
            title.textContent =
                request.request_type === "guardian_details"
                    ? "Guardian Details Update"
                    : "Profile Correction";

            const validStatuses = [
                "pending",
                "approved",
                "rejected"
            ];

            const rawStatus =
                String(request.status || "pending").toLowerCase();

            const statusValue = validStatuses.includes(rawStatus)
                ? rawStatus
                : "pending";

            const status = document.createElement("span");
            status.className = `request-status ${statusValue}`;
            status.textContent =
                statusValue.charAt(0).toUpperCase() +
                statusValue.slice(1);

            const date = document.createElement("small");
            date.textContent = formatDate(request.created_at);

            const top = document.createElement("div");
            top.className = "request-item-top";
            top.append(title, status);

            item.append(top, date);

            if (request.admin_note) {
                const note = document.createElement("p");
                note.className = "request-admin-note";
                note.textContent =
                    `Admin note: ${request.admin_note}`;

                item.appendChild(note);
            }

            history.appendChild(item);
        });
    }

    /* =====================================================
       EXISTING MEMBER BUTTON
    ===================================================== */

    if (addMemberBtn && membersList) {
        addMemberBtn.addEventListener("click", () => {
            const members =
                membersList.querySelectorAll(".member-item");

            if (members.length >= 3) {
                alert("You can add a maximum of 3 members.");
                return;
            }

            alert(
                "Member registration is not connected yet. Please contact the administrator."
            );
        });
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */

    try {
        const loaded = await loadProfile();

        if (loaded === false) return;

        // Both forms are separate and serve different purposes.
        setupPersonalEdit();
        setupDirectPersonalDetailsEdit();
        setupGuardianEdit();

        createRequestHistorySection();

        await loadRequestHistory();

        console.log(
            "Student profile and editing options initialized successfully."
        );
    } catch (error) {
        console.error("Profile initialization failed:", error);

        alert(
            error.message ||
            "Could not load your profile. Open F12 > Console for details."
        );
    }
});