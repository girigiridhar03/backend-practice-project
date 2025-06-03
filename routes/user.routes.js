import express from "express";
import { upload } from "../middleware/multer.js";
import { createAuthUser, deleteAccount, deleteProfileImage, login, logout, registration, updateProfileDetails } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";

const userroute = express.Router();

userroute.post("/signup", upload.single("image"), registration);
userroute.post("/login", login);
userroute.post("/logout", authMiddleware, logout);
userroute.post("/admin/createRole",upload.single("image"),authMiddleware,isAdmin, createAuthUser);
userroute.post("/deleteprofileimage",authMiddleware,deleteProfileImage);
userroute.put("/updateprofiledetails",upload.single("image"),authMiddleware,updateProfileDetails);
userroute.post("/deleteaccount",authMiddleware,deleteAccount)

export default userroute;
