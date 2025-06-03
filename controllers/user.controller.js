import { Auth } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (id) => {
  try {
    const user = await Auth.findById(id);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save();

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

    console.log(newUser);
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
      sameSite: "strict",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        statusCode: 200,
        message: "User logged in successfully",
        data: loggedInUser,
        accessToken,
        refreshToken,
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

export { registration, login, logout, createAuthUser };
