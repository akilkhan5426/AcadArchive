const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user details to request

        // Check if the user is an admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied. Only admins can perform this action." });
        }

        next(); // Move to the next middleware
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};
