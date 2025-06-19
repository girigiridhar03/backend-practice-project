import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import {
  averagePricePerCategory,
  getDeliveryAgentOrdersCount,
  getOrderCountsByLocations,
  gettopSellingProducts,
  orderStatus,
  productBrandsOnStock,
  totalInStock,
  totalOrdersPerUsers,
} from "../controllers/dashboard.controller.js";

const dashboardRoute = express.Router();

dashboardRoute.get(
  "/brandTotalCounts",
  authMiddleware,
  isAdmin,
  productBrandsOnStock
);
dashboardRoute.get(
  "/CategoryAvgPrice",
  authMiddleware,
  isAdmin,
  averagePricePerCategory
);
dashboardRoute.get("/stockData", authMiddleware, isAdmin, totalInStock);
dashboardRoute.get("/orderStatus", authMiddleware, isAdmin, orderStatus);
dashboardRoute.get(
  "/locationcounts",
  authMiddleware,
  isAdmin,
  getOrderCountsByLocations
);
dashboardRoute.get(
  "/topsellingproducts",
  authMiddleware,
  isAdmin,
  gettopSellingProducts
);
dashboardRoute.get(
  "/totalordersperuser",
  authMiddleware,
  isAdmin,
  totalOrdersPerUsers
);
dashboardRoute.get(
  "/deliveryagentorderscount",
  authMiddleware,
  isAdmin,
  getDeliveryAgentOrdersCount
);

export default dashboardRoute;
