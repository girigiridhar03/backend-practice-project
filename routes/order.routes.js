import express from "express";
import {
  getAllOrders,
  postOrderDetails,
  statusUpdate,
} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";

const orderRoute = express.Router();

orderRoute.post("/orderDetails", authMiddleware, postOrderDetails);
orderRoute.get("/allOrderDetails", authMiddleware, isAdmin, getAllOrders);
orderRoute.put("/updateStatus/:orderId", authMiddleware, isAdmin, statusUpdate);
export default orderRoute;
