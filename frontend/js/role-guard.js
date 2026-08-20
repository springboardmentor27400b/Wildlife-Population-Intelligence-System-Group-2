// ============================================================
// WPIS - ROLE GUARD
// ============================================================

(function () {

    const allowedRoles =
        Array.isArray(window.WPIS_ALLOWED_ROLES)
            ? window.WPIS_ALLOWED_ROLES
            : [];

    let user = null;

    try {
        user = JSON.parse(
            localStorage.getItem("wpis_user")
        );
    } catch {
        user = null;
    }

    const token =
        localStorage.getItem("wpis_token");

    // No authenticated session
    if (!token || !user) {
        window.location.replace("login.html");
        return;
    }

    const currentRole =
        String(user.role || "")
            .trim()
            .toLowerCase();

    // Invalid/unknown role
    if (!currentRole) {
        localStorage.removeItem("wpis_token");
        localStorage.removeItem("wpis_user");
        window.location.replace("login.html");
        return;
    }

    // Role not permitted for this page
    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(currentRole)
    ) {

        const dashboards = {

            wildlife_researcher:
                "researcher-dashboard.html",

            conservation_officer:
                "conservation-officer-dashboard.html",

            forest_department_officer:
                "forest-dashboard.html",

            administrator:
                "admin-dashboard.html"

        };

        window.location.replace(
            dashboards[currentRole] ||
            "login.html"
        );

    }

})();