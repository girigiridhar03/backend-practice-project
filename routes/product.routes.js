import express from "express";
import { upload } from "../middleware/multer.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import {
  addProduct,
  addToCart,
  deleteCartItem,
  deleteProduct,
  editProduct,
  getCartDetails,
} from "../controllers/product.controller.js";

const productroute = express.Router();

productroute.post(
  "/addproduct",
  upload.array("productImages", 5),
  authMiddleware,
  isAdmin,
  addProduct
);
productroute.put(
  "/editproduct/:productId",
  upload.array("productImages", 5),
  authMiddleware,
  isAdmin,
  editProduct
);
productroute.delete(
  "/deleteproduct/:productId",
  authMiddleware,
  isAdmin,
  deleteProduct
);
productroute.post("/addtocart", authMiddleware, addToCart);
productroute.get("/getcartdetails", authMiddleware, getCartDetails);
productroute.delete("/deletecartitem/:productId", authMiddleware, deleteCartItem);

export default productroute;
