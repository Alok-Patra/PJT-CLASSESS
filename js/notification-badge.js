
/* PJT CLASSES — SHARED STUDENT NOTIFICATION BADGE */
(async function () {
    const client = window.supabaseClient;
    if (!client) return;

    try {
        const { data: sessionData, error: sessionError } =
            await client.auth.getSession();

        if (sessionError || !sessionData.session) return;

        const studentId = sessionData.session.user.id;

        const { data: profile, error: profileError } = await client
            .from("profiles")
            .select("id, role")
            .eq("id", studentId)
            .maybeSingle();

       if (profileError || !profile || profile.role !== "student") {
    console.error("Badge profile check failed:", profileError, profile);
    return;
}

        const { data: notifications, error } = await client
            .from("notifications")
            .select("id, student_id, target_student_id")
            .or(
                `student_id.is.null,student_id.eq.${studentId},target_student_id.is.null,target_student_id.eq.${studentId}`
            );

        if (error) throw error;

console.log("Badge notifications loaded:", notifications);

        const { data: reads, error: readsError } = await client
            .from("notification_reads")
            .select("notification_id")
            .eq("student_id", studentId);

        if (readsError) throw readsError;

console.log("Badge read records loaded:", reads);if (readsError) throw readsError;



        const readIds = new Set(
            (reads || []).map(row => String(row.notification_id))
        );

        const unread = (notifications || []).filter(
            item => !readIds.has(String(item.id))
        ).length;

        console.log("Actual unread notification count:", unread);

        // Update all matching badges on this page.
        document.querySelectorAll(
            ".nav-badge, .notification-top-btn span, " +
            ".notification-button span, [data-unread-count]"
        ).forEach(badge => {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? "" : "none";
        });

        // Update the notification page's unread summary if present.
        const summary = document.getElementById("unreadCount");
        if (summary) summary.textContent = unread;

    } catch (error) {
        console.error("Could not update notification badge:", error);
    }
})();
