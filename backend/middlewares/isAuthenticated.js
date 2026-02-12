import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.id = decoded.userId;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
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
