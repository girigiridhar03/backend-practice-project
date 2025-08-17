import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addLandingPageImages,
  landingPageImages,
  latestProduct,
  topFourProducts,
} from "../controllers/home.controller.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import { upload } from "../middleware/multer.js";

const homeroute = express.Router();

homeroute.get("/lateshproducts", authMiddleware, latestProduct);
homeroute.post(
  "/addlandingimages",
  upload.array("landingImages", 5),
  authMiddleware,
  isAdmin,
  addLandingPageImages
);
homeroute.get("/getlandingimages", authMiddleware, landingPageImages);
homeroute.get("/topFourProducts", authMiddleware, topFourProducts);

export default homeroute;
