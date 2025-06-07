import express from "express";
import {
  agentAssignedOrders,
  assignOrderToAgent,
  getAllOrders,
  getUserOrders,
  postOrderDetails,
  statusUpdate,
} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import isAgentMiddleware from "../middleware/isAgent.middleware.js";

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
  isAgentMiddleware,
  agentAssignedOrders
);
orderRoute.get("/getuserorderDetails", authMiddleware, getUserOrders);
export default orderRoute;
