import express from "express";
import { upload } from "../middleware/multer.js";
import {
  adminLogin,
  createAuthUser,
  deleteAccount,
  deleteProfileImage,
  generateNewAccessToken,
  getallUsersAndAgents,
  getSingleUser,
  login,
  logout,
  registration,
  updateProfileDetails,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";

const userroute = express.Router();

userroute.post("/signup", upload.single("image"), registration);
userroute.post("/login", login);
userroute.post("/admin-login", adminLogin);
userroute.post("/logout", authMiddleware, logout);
userroute.post(
  "/admin/createRole",
  upload.single("image"),
  authMiddleware,
    isAdmin,
    createAuthUser
);
userroute.post("/deleteprofileimage", authMiddleware, deleteProfileImage);
userroute.put(
  "/updateprofiledetails",
  upload.single("image"),
  authMiddleware,
  updateProfileDetails
);
userroute.post("/deleteaccount", authMiddleware, deleteAccount);
userroute.get(
  "/getallusersandagents",
  authMiddleware,
  isAdmin,
  getallUsersAndAgents
);
userroute.get("/getsingleuser/:userid", authMiddleware, isAdmin, getSingleUser);
userroute.get("/refreshToken", authMiddleware, generateNewAccessToken);

export default userroute;
