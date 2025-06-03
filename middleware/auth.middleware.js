import jwt from "jsonwebtoken";
import { Auth } from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (!token) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized: No token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESSTOKEN_JWT_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid or expired token",
      });
    }

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
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode : 500,
      message: `Invalid token : ${error}`,
    });
  }
};

export default authMiddleware;
