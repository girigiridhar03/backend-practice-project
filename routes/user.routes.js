import express from "express";
import { upload } from "../middleware/multer.js";
import { createAuthUser, login, logout, registration } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";

const userroute = express.Router();

userroute.post("/signup", upload.single("image"), registration);
userroute.post("/login", login);
userroute.post("/logout", authMiddleware, logout);
userroute.post("/admin/createRole",upload.single("image"),authMiddleware,isAdmin, createAuthUser);

export default userroute;
