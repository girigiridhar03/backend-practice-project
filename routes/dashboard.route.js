import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import {
  averagePricePerCategory,
  getOrderCountsByLocations,
  gettopSellingProducts,
  orderStatus,
  productBrandsOnStock,
  totalInStock,
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

export default dashboardRoute;
