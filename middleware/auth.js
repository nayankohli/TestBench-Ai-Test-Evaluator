/**
 * Redirects to dashboard if user is already logged in
 */
function redirectIfAuthenticated(req, res, next) {
    if (req.session.logedin) {
        req.session.detail.role === "teacher"
            ? res.redirect("/teacher/dashboard")
            : res.redirect("/student/dashboard");
    } else {
        next();
    }
}

/**
 * Ensures user is authenticated before accessing protected routes
 */
function requireAuthentication(req, res, next) {
    if (req.session.logedin) {
        next();
    } else {
        res.redirect("/login");
    }
}

/**
 * Ensures user is a teacher before accessing teacher-only routes
 */
function requireTeacherRole(req, res, next) {
    if (req.session.logedin && req.session.detail.role === "teacher") {
        next();
    } else {
        res.status(403).send("Access denied: Teachers only");
    }
}

/**
 * Ensures user is a student before accessing student-only routes
 */
function requireStudentRole(req, res, next) {
    if (req.session.logedin && req.session.detail.role === "student") {
        next();
    } else {
        res.status(403).send("Access denied: Students only");
    }
}

module.exports = {
    redirectIfAuthenticated,
    requireAuthentication,
    requireTeacherRole,
    requireStudentRole
};