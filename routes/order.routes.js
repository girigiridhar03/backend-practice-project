import express from "express";
import {
  agentAssignedOrders,
  assignOrderToAgent,
  getAllOrders,
  getSingleOrder,
  getUserOrders,
  postOrderDetails,
  statusUpdate,
} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import isAgentAndAdminMiddleware from "../middleware/isAgent.middleware.js";

const orderRoute = express.Router();

orderRoute.post("/orderDetails", authMiddleware, postOrderDetails);
orderRoute.get("/allOrderDetails", authMiddleware, isAdmin, getAllOrders);
orderRoute.put("/updateStatus/:orderId", authMiddleware, statusUpdate);
orderRoute.post(
  "/assignordertoagent/:orderId",
  authMiddleware,
  isAdmin,
  assignOrderToAgent
);
orderRoute.get(
  "/agentorders",
  authMiddleware,
  isAgentAndAdminMiddleware,
  agentAssignedOrders
);
orderRoute.get("/getuserorderDetails", authMiddleware, getUserOrders);
orderRoute.get("/getsingleorder/:id", authMiddleware, isAdmin, getSingleOrder);
export default orderRoute;
