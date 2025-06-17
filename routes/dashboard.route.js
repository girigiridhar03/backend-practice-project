import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import {
  averagePricePerCategory,
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

export default dashboardRoute;
