import Product from "../models/product.model.js";
import { Auth } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
  deleteFileInCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (id) => {
  try {
    const user = await Auth.findById(id);

    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save();
    const accessToken = user.generateAccessToken();

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("failed to generate access Token ", error);
    throw error;
  }
};

const registration = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const roles = ["admin", "user", "agent"];
    const authRole = roles.includes(role) ? role : "user";

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "All fields are required",
      });
    }

    const user = await Auth.findOne({ $or: [{ username }, { email }] });

    if (user) {
      return res.status(409).json({
        success: false,
        statusCode: 400,
        message: "User already exist",
      });
    }

    const localFilePath = req?.file?.path;
    let imageResponse;

    if (localFilePath) {
      imageResponse = await uploadToCloudinary(localFilePath);
    }
    console.log(imageResponse);
    const newUser = await Auth.create({
      username,
      email,
      password,
      role: authRole,
      image: {
        url: imageResponse?.secure_url,
        publicId: imageResponse?.public_id,
      },
      ...(authRole === "user" && { cartItems: [] }),
    });

    const filtered = await Auth.findById(newUser?._id).select(
      "-password -refreshToken"
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "User Registred Successfully",
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Required all fields",
      });
    }

    const user = await Auth.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    const passwordCheck = await user.isPassword(password);

    if (!passwordCheck) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: "Invalid Credentials",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user?._id
    );

    const loggedInUser = await Auth.findById(user?._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        statusCode: 200,
        message: `${loggedInUser.role} logged in successfully`,
        data: loggedInUser,
        accessToken,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({
        success: false,
        statusCode: 400,
        message: "All fields are required",
      });
    }

    const user = await Auth.findOne({ email });

    const passwordCheck = await user.isPassword(password);

    if (!passwordCheck) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: "Invalid Credentials",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found.",
      });
    }

    if (user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Access denied. Admin only",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user?._id
    );

    const loggedInAdmin = await Auth.findById(user?._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        statusCode: 200,
        message: `${loggedInAdmin.role} logged in successfully`,
        data: loggedInAdmin,
        accessToken,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = await Auth.findById(req.user?._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User already logged out or session expired",
      });
    }

    user.refreshToken = null;

    await user.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        statusCode: 200,
        message: "User logout successfully",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const createAuthUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const roles = ["admin", "user", "agent"];

    const authRole = roles.includes(role) ? role : "user";

    if (!username || !email || !password) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "all fields required",
      });
    }

    const user = await Auth.findOne({ $or: [{ username }, { email }] });

    if (user) {
      return res.status(409).json({
        success: false,
        statusCode: 400,
        message: "User already exist",
      });
    }

    const localFilePath = req.file?.path;

    let imageResponse;

    if (localFilePath) {
      imageResponse = await uploadToCloudinary(localFilePath);
    }

    const newUser = await Auth.create({
      username,
      email,
      password,
      role: authRole,
      image: {
        url: imageResponse?.secure_url,
        publicId: imageResponse?.public_id,
      },
      ...(authRole === "user" && { cartItems: [] }),
    });

    const filtered = await Auth.findById(newUser?._id).select(
      "-password -refreshToken"
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: `${authRole} role created successfully`,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "public id is missing",
      });
    }

    const deleteImage = await deleteFileInCloudinary(publicId);
    const result = deleteImage?.result?.toLowerCase?.();

    if (result === "not found") {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Not found",
      });
    }

    res.status(209).json({
      success: true,
      statusCode: 200,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const updateProfileDetails = async (req, res) => {
  try {
    const { username } = req.body;

    const existingUser = await Auth.findById(req.user?._id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    const localFilePath = req?.file?.path;

    let imageResponse;

    if (localFilePath) {
      imageResponse = await uploadToCloudinary(localFilePath);
    }

    if (username) {
      existingUser.username = username;
    }

    if (imageResponse?.secure_url && imageResponse?.public_id) {
      existingUser.image = {
        url: imageResponse.secure_url,
        publicId: imageResponse.public_id,
      };
    }
    await existingUser.save();

    const updatedUser = await Auth.findById(existingUser?._id).select(
      "-password -refreshToken"
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const existingUser = await Auth.findById(req.user?._id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    if (existingUser?.image?.publicId) {
      await deleteFileInCloudinary(existingUser.image.publicId);
    }

    existingUser.refreshToken = null;
    await existingUser.save();

    const deletedUser = await Auth.findByIdAndDelete(existingUser?._id);

    await Product.updateMany({}, { $pull: { comments: { user: user?.id } } });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "user account deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getallUsersAndAgents = async (req, res) => {
  try {
    const { filterAuth } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const query = {};

    if (filterAuth) {
      query.role = filterAuth;
    }
    const totalAuthUsers = await Auth.countDocuments(query);
    const totalPages = Math.ceil(totalAuthUsers / limit);

    const allAuthUsers = await Auth.find(query)
      .populate("cartItems.productId")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: false,
      statusCode: 200,
      message: "All Auth users are retrived.",
      data: allAuthUsers,
      currentPage: page,
      totalAuthUsers,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const generateNewAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    let decode;

    try {
      decode = jwt.verify(refreshToken, process.env.REFRESHTOKEN_JWT_KEY);
    } catch (error) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid or expired token",
      });
    }

    const user = await Auth.findById(decode?._id);

    const newAccessToken = user.generateAccessToken();
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.status(200).cookie("accessToken", newAccessToken, options).json({
      success: true,
      statusCode: 200,
      message: "new access token generated",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export {
  registration,
  login,
  adminLogin,
  logout,
  createAuthUser,
  deleteProfileImage,
  updateProfileDetails,
  deleteAccount,
  getallUsersAndAgents,
  generateNewAccessToken,
};
