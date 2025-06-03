import { Auth } from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
  try {

    const user = await Auth.findById(req.user?._id);

    if(!user || user.role !== "admin"){
        return res.status(400).json({
            success : false,
            statusCode : 400,
            message : "Access denied. Admin only"
        })
    }

    next()

  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
     message: `Server error: ${error.message}`,
    });
  }
};


export default isAdmin