import { Auth } from "../models/user.model.js";

const isAgentMiddleware = async (req, res, next) => {
  try {
    const user = await Auth.findById(req.user?._id);

    if (!user || user.role !== "agent") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Access denied. Agent only",
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

export default isAgentMiddleware;
