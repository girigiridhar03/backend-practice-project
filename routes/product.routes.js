import express from "express";
import { upload } from "../middleware/multer.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import { addProduct } from "../controllers/product.controller.js";

const productroute = express.Router();

productroute.post(
  "/addproduct",
  upload.array("productImages", 5),
  authMiddleware,
  isAdmin,
  addProduct
);

export default productroute;
