import { Auth } from "../models/user.model.js";

const isAgentAndAdminMiddleware = async (req, res, next) => {
  try {
    const user = await Auth.findById(req.user?._id);

    if (!user || (user.role !== "agent" && user.role !== "admin")) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Access denied. Only agents or admins allowed.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: `Server error: ${error.message}`,
    });
  }
};

export default isAgentAndAdminMiddleware;
