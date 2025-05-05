
function redirectIfAuthenticated(req, res, next) {
    if (req.session.logedin) {
        req.session.detail.role === "teacher"
            ? res.redirect("/teacher/dashboard")
            : res.redirect("/student/dashboard");
    } else {
        next();
    }
}


function requireAuthentication(req, res, next) {
    if (req.session.logedin) {
        next();
    } else {
        res.redirect("/login");
    }
}

function requireTeacherRole(req, res, next) {
    if (req.session.logedin && req.session.detail.role === "teacher") {
        next();
    } else {
        res.status(403).send("Access denied: Teachers only");
    }
}


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