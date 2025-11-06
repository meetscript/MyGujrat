import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // 🧩 1. Extract JWT token from cookies
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // 🔐 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 3. Attach user ID to request object
    req.id = decoded.userId;

    // 🚀 4. Continue to next middleware/controller
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    // 🔁 Handle expired or invalid token
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid token. Authentication failed.",
    });
  }
};

export default isAuthenticated;
