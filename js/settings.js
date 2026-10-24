
/* =========================================
   PJT CLASSES
   SETTINGS JAVASCRIPT
   Supabase-connected version
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const client = window.supabaseClient;

    /* ELEMENTS */
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const logoutBtn = document.getElementById("logoutBtn");
    const pageLogoutBtn = document.getElementById("pageLogoutBtn");
    const notificationBtn = document.getElementById("notificationBtn");
    const passwordForm = document.getElementById("passwordForm");
    const passwordMessage = document.getElementById("passwordMessage");
    const settingsSearch = document.getElementById("settingsSearch");
    const feeNotifications = document.getElementById("feeNotifications");
    const announcementNotifications =
        document.getElementById("announcementNotifications");

    let studentId = null;
    let notificationChannel = null;
    let seenNotificationIds = new Set();

    const byId = id => document.getElementById(id);

    /* MESSAGE */
    function showPasswordMessage(message, type = "success") {
        if (!passwordMessage) return;

        passwordMessage.textContent = message;
        passwordMessage.className = `password-message ${type}`;
    }

    /* =========================================
       MOBILE SIDEBAR
    ========================================= */

    if (menuBtn && sidebar && sidebarOverlay) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            sidebarOverlay.classList.toggle("show");
        });

        sidebarOverlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.remove("show");
        });
    }

    /* =========================================
       OPEN NOTIFICATIONS
    ========================================= */

    if (notificationBtn) {
        notificationBtn.addEventListener("click", () => {
            window.location.href = "notifications.html";
        });
    }

    /* =========================================
       LOAD REAL STUDENT PROFILE
    ========================================= */

    async function loadStudentProfile() {
        if (!client) {
            throw new Error(
                "Supabase client not found. Check js/supabase.js."
            );
        }

        const { data: sessionData, error: sessionError } =
            await client.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session) {
            window.location.href = "login.html";
            return null;
        }

        studentId = session.user.id;

        const { data: profile, error } = await client
            .from("profiles")
            .select(
                "id, full_name, email, student_id, student_class, role"
            )
            .eq("id", studentId)
            .maybeSingle();

        if (error) throw error;

        if (!profile) {
            throw new Error(
                "Your profile was not found in the profiles table."
            );
        }

        if (
            String(profile.role || "").trim().toLowerCase() !== "student"
        ) {
            throw new Error(
                "This account is not registered as a student."
            );
        }

        const name = String(
            profile.full_name || session.user.email || "Student"
        ).trim();

        const email = profile.email || session.user.email || "";
        const studentCode = profile.student_id || "Not assigned";

        const rawClass = profile.student_class;
        const classText = rawClass
            ? (
                String(rawClass).toLowerCase().startsWith("class")
                    ? String(rawClass)
                    : `Class ${rawClass}`
            )
            : "Class not assigned";

        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("");

        /* SIDEBAR: exact selectors from settings.html */
        document.querySelectorAll(".mini-info strong").forEach(element => {
            element.textContent = name;
        });

        document.querySelectorAll(".mini-info span").forEach(element => {
            element.textContent = studentCode;
        });

        document.querySelectorAll(".mini-avatar").forEach(element => {
            element.textContent = initials;
        });

        /* TOP-RIGHT PROFILE */
        document.querySelectorAll(".top-user-info strong").forEach(element => {
            element.textContent = name;
        });

        document.querySelectorAll(".top-user-info span").forEach(element => {
            element.textContent = classText;
        });

        document.querySelectorAll(".top-avatar").forEach(element => {
            element.textContent = initials;
        });

        /* Support profile fields if added to this page later */
        const profileFields = {
            studentName: name,
            welcomeStudentName: name,
            studentEmail: email,
            accountEmail: email,
            studentId: studentCode,
            welcomeStudentId: studentCode,
            studentClass: classText,
            welcomeStudentClass: classText
        };

        Object.entries(profileFields).forEach(([id, value]) => {
            const element = byId(id);
            if (element) element.textContent = value;
        });

        console.log("Student profile loaded successfully.");

        return profile;
    }

    /* =========================================
       UPDATE BOTH NOTIFICATION BADGES
    ========================================= */

    function updateNotificationBadges(count) {
        const sidebarBadge = byId("notificationBadge");
        const topBadge = byId("topNotificationBadge");

        [sidebarBadge, topBadge].forEach(badge => {
            if (!badge) return;

            badge.textContent = String(count);
            badge.style.display = count > 0 ? "" : "none";
        });
    }

    /* =========================================
       LOAD ACTUAL UNREAD NOTIFICATION COUNT
    ========================================= */

    async function refreshUnreadCount() {
        if (!client || !studentId) return;

        const { data: rows, error: notificationsError } = await client
            .from("notifications")
            .select("id, student_id, target_student_id")
            .or(
                `student_id.is.null,student_id.eq.${studentId},target_student_id.is.null,target_student_id.eq.${studentId}`
            );

        if (notificationsError) {
            console.error(
                "Could not load notifications:",
                notificationsError.message
            );
            return;
        }

        const notifications = rows || [];

        if (notifications.length === 0) {
            updateNotificationBadges(0);
            return;
        }

        const { data: readRows, error: readsError } = await client
            .from("notification_reads")
            .select("notification_id")
            .eq("student_id", studentId);

        if (readsError) {
            console.error(
                "Could not load notification read status:",
                readsError.message
            );
            return;
        }

        const readIds = new Set(
            (readRows || []).map(row => String(row.notification_id))
        );

        const unreadCount = notifications.filter(
            notification => !readIds.has(String(notification.id))
        ).length;

        updateNotificationBadges(unreadCount);
    }

    /* =========================================
       NEW NOTIFICATION POPUP
    ========================================= */

    function showNotificationPopup(notification) {
        let popup = byId("adminNotificationPopup");

        if (!popup) {
            popup = document.createElement("div");
            popup.id = "adminNotificationPopup";

            Object.assign(popup.style, {
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: "99999",
                width: "min(360px, calc(100vw - 40px))",
                padding: "18px",
                background: "#ffffff",
                color: "#172033",
                border: "1px solid #dbe4f0",
                borderRadius: "14px",
                boxShadow: "0 12px 35px rgba(0,0,0,0.16)",
                fontFamily: "inherit"
            });

            document.body.appendChild(popup);
        }

        const heading = document.createElement("strong");
        heading.textContent =
            "🔔 " + String(notification.title || "New notification");
        heading.style.display = "block";
        heading.style.marginBottom = "8px";

        const message = document.createElement("p");
        message.textContent = String(notification.body || "");
        message.style.margin = "0 0 12px";
        message.style.whiteSpace = "pre-wrap";

        const close = document.createElement("button");
        close.type = "button";
        close.textContent = "Dismiss";
        close.style.cssText =
            "padding:8px 14px;border:0;border-radius:8px;" +
            "background:#164eaa;color:white;cursor:pointer;";

        close.addEventListener("click", () => popup.remove());

        popup.replaceChildren(heading, message, close);
    }

    /* =========================================
       REALTIME ADMIN NOTIFICATIONS
    ========================================= */

    async function startNotificationListener() {
        if (!client || !studentId) return;

        /*
         * Remember existing notifications so opening this page
         * does not trigger popups for old messages.
         */
        const { data: existing, error } = await client
            .from("notifications")
            .select("id");

        if (error) {
            console.error(
                "Could not initialize notification listener:",
                error.message
            );
            return;
        }

        (existing || []).forEach(row => {
            seenNotificationIds.add(String(row.id));
        });

        notificationChannel = client
            .channel(`settings-notifications-${studentId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications"
                },
                async payload => {
                    const row = payload.new;

                    if (!row || row.id == null) return;

                    const id = String(row.id);

                    if (seenNotificationIds.has(id)) return;
                    seenNotificationIds.add(id);

                    const target =
                        row.target_student_id || row.student_id || null;

                    const forEveryone = !target;
                    const forThisStudent =
                        String(target) === String(studentId);

                    if (forEveryone || forThisStudent) {
                        showNotificationPopup(row);
                        await refreshUnreadCount();
                    }
                }
            )
            .subscribe(status => {
                if (
                    status === "CHANNEL_ERROR" ||
                    status === "TIMED_OUT"
                ) {
                    console.error(
                        "Realtime notification connection:",
                        status
                    );
                }
            });
    }

    /* =========================================
       LOGOUT
    ========================================= */

    async function logoutStudent() {
        if (!client) {
            alert("Supabase is not initialized.");
            return;
        }

        if (!confirm("Are you sure you want to logout?")) return;

        try {
            const { error } = await client.auth.signOut({
                scope: "local"
            });

            if (error) throw error;

            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Could not log out. Please try again.");
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutStudent);
    }

    if (pageLogoutBtn) {
        pageLogoutBtn.addEventListener("click", logoutStudent);
    }

    /* =========================================
       CHANGE PASSWORD
    ========================================= */

    if (passwordForm) {
        passwordForm.addEventListener("submit", async event => {
            event.preventDefault();

            const currentPassword =
                byId("currentPassword")?.value || "";
            const newPassword = byId("newPassword")?.value || "";
            const confirmPassword =
                byId("confirmPassword")?.value || "";

            if (!currentPassword || !newPassword || !confirmPassword) {
                showPasswordMessage(
                    "Please fill in all password fields.",
                    "error"
                );
                return;
            }

            if (newPassword.length < 6) {
                showPasswordMessage(
                    "New password must contain at least 6 characters.",
                    "error"
                );
                return;
            }

            if (newPassword !== confirmPassword) {
                showPasswordMessage(
                    "New password and confirmation do not match.",
                    "error"
                );
                return;
            }

            if (!client) {
                showPasswordMessage(
                    "Supabase is not initialized.",
                    "error"
                );
                return;
            }

            const submitButton = passwordForm.querySelector(
                'button[type="submit"], input[type="submit"]'
            );

            if (submitButton) submitButton.disabled = true;

            try {
                const { data: sessionData, error: sessionError } =
                    await client.auth.getSession();

                if (sessionError) throw sessionError;

                const session = sessionData.session;

                if (!session || !session.user.email) {
                    throw new Error(
                        "Your session expired. Please log in again."
                    );
                }

                const { error: verifyError } =
                    await client.auth.signInWithPassword({
                        email: session.user.email,
                        password: currentPassword
                    });

                if (verifyError) {
                    throw new Error("Your current password is incorrect.");
                }

                const { error: updateError } =
                    await client.auth.updateUser({
                        password: newPassword
                    });

                if (updateError) throw updateError;

                showPasswordMessage(
                    "Your password has been updated.",
                    "success"
                );

                passwordForm.reset();
            } catch (error) {
                console.error("Password update error:", error);
                showPasswordMessage(
                    error.message || "Password update failed.",
                    "error"
                );
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    /* =========================================
       NOTIFICATION PREFERENCES
       Uses student_settings if configured.
    ========================================= */

    async function loadNotificationPreferences() {
        if (!client || !studentId) return;

        const { data, error } = await client
            .from("student_settings")
            .select("fee_notifications, announcement_notifications")
            .eq("student_id", studentId)
            .maybeSingle();

        if (error) {
            console.warn(
                "Notification preferences table is not configured:",
                error.message
            );
            return;
        }

        if (!data) return;

        if (
            feeNotifications &&
            data.fee_notifications != null
        ) {
            feeNotifications.checked = data.fee_notifications;
        }

        if (
            announcementNotifications &&
            data.announcement_notifications != null
        ) {
            announcementNotifications.checked =
                data.announcement_notifications;
        }
    }

    async function saveNotificationPreferences() {
        if (!client || !studentId) return;

        const settings = {
            student_id: studentId,
            fee_notifications: feeNotifications
                ? feeNotifications.checked
                : true,
            announcement_notifications: announcementNotifications
                ? announcementNotifications.checked
                : true
        };

        const { error } = await client
            .from("student_settings")
            .upsert(settings, {
                onConflict: "student_id"
            });

        if (error) {
            console.error("Could not save preferences:", error.message);
            alert(
                "Preferences could not be saved. Check the student_settings table and its permissions in Supabase."
            );
        }
    }

    if (feeNotifications) {
        feeNotifications.addEventListener(
            "change",
            saveNotificationPreferences
        );
    }

    if (announcementNotifications) {
        announcementNotifications.addEventListener(
            "change",
            saveNotificationPreferences
        );
    }

    /* =========================================
       SETTINGS SEARCH
    ========================================= */

    if (settingsSearch) {
        settingsSearch.addEventListener("input", () => {
            const query = settingsSearch.value.trim().toLowerCase();

            document.querySelectorAll(".settings-card").forEach(card => {
                card.classList.toggle(
                    "search-hidden",
                    Boolean(query) &&
                    !card.textContent.toLowerCase().includes(query)
                );
            });
        });
    }

    /* =========================================
       INITIALIZE PAGE
    ========================================= */

    try {
        const profile = await loadStudentProfile();

        if (profile) {
            await refreshUnreadCount();
            await loadNotificationPreferences();
            await startNotificationListener();
        }
    } catch (error) {
        console.error("Settings initialization error:", error);

        showPasswordMessage(
            error.message || "Could not load your account information.",
            "error"
        );
    }

    /* Refresh badges when returning to the page */
    window.addEventListener("focus", refreshUnreadCount);

    window.addEventListener("pagehide", () => {
        if (notificationChannel && client) {
            client.removeChannel(notificationChannel);
        }
    });
});
