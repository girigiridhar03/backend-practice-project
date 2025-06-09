import express from "express";
import { upload } from "../middleware/multer.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import {
  addComments,
  addProduct,
  addToCart,
  deleteCartItem,
  deleteComment,
  deleteProduct,
  editProduct,
  getAllProducts,
  getCartDetails,
  getCategoriesAndCount,
  getSingleProduct,
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
productroute.get("/getallproducts", authMiddleware, getAllProducts);
productroute.get(
  "/getSingleProduct/:productId",
  authMiddleware,
  getSingleProduct
);
productroute.post("/addtocart", authMiddleware, addToCart);
productroute.get("/getcartdetails", authMiddleware, getCartDetails);
productroute.delete(
  "/deletecartitem/:productId",
  authMiddleware,
  deleteCartItem
);
productroute.post("/addcomments/:productId", authMiddleware, addComments);
productroute.delete("/deletecomment/:productId", authMiddleware, deleteComment);
productroute.get("/getcategories", authMiddleware, getCategoriesAndCount);

export default productroute;
