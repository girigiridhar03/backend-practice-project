import jwt from "jsonwebtoken";
import { Auth } from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Unauthorized: No token provided",
    });
  }
  try {
    let decoded = jwt.verify(token, process.env.ACCESSTOKEN_JWT_KEY);

    const user = await Auth.findById(decoded?._id);

    if (!user || !user?.refreshToken) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Invalid user",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    let errorMessage = "Invalid or expired token";

    if (err.name === "TokenExpiredError") {
      errorMessage = "jwt expired";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "invalid token";
    } else if (err.name === "NotBeforeError") {
      errorMessage = "jwt not active";
    }

    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: errorMessage,
    });
  }
};

export default authMiddleware;
