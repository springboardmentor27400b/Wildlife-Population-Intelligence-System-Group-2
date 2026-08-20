// ============================================================
// WPIS - ROLE BASED LOGIN
// ============================================================

const API_BASE =
    localStorage.getItem("wpis_api_base") ||
    "http://127.0.0.1:8000";


// ============================================================
// SHOW LOGIN ERROR
// ============================================================

const show = (message) => {

    const notice =
        document.querySelector("#loginNotice");

    if (!notice) return;

    notice.className =
        "notice error";

    notice.textContent =
        message;

};


// ============================================================
// REDIRECT USER BASED ON ROLE
// ============================================================

function redirectByRole(user) {

    if (!user || !user.role) {

        window.location.href =
            "./researcher-dashboard.html";

        return;

    }


    const role =
        String(
            user.role
        ).toLowerCase();


    const dashboardMap = {

        wildlife_researcher:
            "./researcher-dashboard.html",

        conservation_officer:
            "./conservation-officer-dashboard.html",

        forest_department_officer:
            "./forest-dashboard.html",

        administrator:
            "./admin-dashboard.html"

    };


    const dashboard =
        dashboardMap[role];


    if (dashboard) {

        window.location.href =
            dashboard;

        return;

    }


    // Unknown role fallback

    window.location.href =
        "./researcher-dashboard.html";

}


// ============================================================
// PASSWORD VISIBILITY
// ============================================================

const togglePassword =
    document.querySelector(
        "#togglePassword"
    );


if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const password =
                document.querySelector(
                    "#password"
                );


            if (!password) return;


            password.type =
                password.type === "password"
                    ? "text"
                    : "password";

        }
    );

}


// ============================================================
// LOGIN
// ============================================================

const loginForm =
    document.querySelector(
        "#loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .querySelector("#email")
                    .value
                    .trim();


            const password =
                document
                    .querySelector("#password")
                    .value;


            const button =
                event.submitter;


            if (button) {

                button.disabled =
                    true;

            }


            try {

                // ------------------------------------------------
                // Build login URL
                // ------------------------------------------------

                const url =
                    new URL(
                        `${API_BASE}/auth/login`
                    );


                url.searchParams.set(
                    "email",
                    email
                );


                url.searchParams.set(
                    "password",
                    password
                );


                // ------------------------------------------------
                // Request
                // ------------------------------------------------

                const response =
                    await fetch(
                        url,
                        {
                            method: "POST",

                            headers: {
                                accept:
                                    "application/json"
                            }
                        }
                    );


                // ------------------------------------------------
                // Parse response
                // ------------------------------------------------

                const data =
                    await response.json();


                // ------------------------------------------------
                // Login failed
                // ------------------------------------------------

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Invalid email or password."
                    );

                }


                // ------------------------------------------------
                // Save authentication data
                // ------------------------------------------------

                localStorage.setItem(
                    "wpis_token",
                    data.access_token
                );


                localStorage.setItem(
                    "wpis_user",
                    JSON.stringify(
                        data.user
                    )
                );


                console.log(
                    "WPIS login successful"
                );


                console.log(
                    "Logged-in user:",
                    data.user
                );


                console.log(
                    "User role:",
                    data.user?.role
                );


                // ------------------------------------------------
                // ROLE BASED REDIRECT
                // ------------------------------------------------

                redirectByRole(
                    data.user
                );

            }


            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                show(
                    error.message
                );


                if (button) {

                    button.disabled =
                        false;

                }

            }

        }
    );

}