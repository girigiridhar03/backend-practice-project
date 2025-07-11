import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { Auth } from "../models/user.model.js";

const productBrandsOnStock = async (req, res) => {
  try {
    const productBrandCount = await Product.aggregate([
      {
        $group: {
          _id: "$brand",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
        },
      },
      {
        $project: {
          _id: 0,
          brandName: "$_id",
          totalProducts: 1,
          totalStock: 1,
        },
      },
      {
        $sort: {
          totalProducts: -1,
          totalStock: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "retrived successfully",
      data: productBrandCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const averagePricePerCategory = async (req, res) => {
  try {
    const averagePrice = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          avgPrice: {
            $avg: "$price",
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          avgPrice: 1,
        },
      },
      {
        $sort: {
          avgPrice: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Average Price fetched based on categories",
      data: averagePrice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const totalInStock = async (req, res) => {
  try {
    const stockData = await Product.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              {
                $eq: ["$stock", 0],
              },
              "Out of Stock",
              "In Stock",
            ],
          },

          count: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          stockStatus: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Stock fetched successfully",
      data: stockData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const orderStatus = async (req, res) => {
  try {
    const filteredOrders = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          totalOrder: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          orderStatus: "$_id",
          totalOrder: 1,
        },
      },
      {
        $sort: {
          totalOrder: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Order Fetched based on status",
      data: filteredOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getOrderCountsByLocations = async (req, res) => {
  try {
    const locationCounts = await Order.aggregate([
      {
        $group: {
          _id: "$location",
          totalOrders: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          location: "$_id",
          totalOrders: 1,
        },
      },
      {
        $sort: {
          totalOrder: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Location counts fetched successfully",
      data: locationCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const gettopSellingProducts = async (req, res) => {
  try {
    const topSellingProducts = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: "$products.productId",
          totalSold: {
            $sum: "$products.quantity",
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productDetails.name",
          totalSold: 1,
        },
      },
      {
        $sort: {
          totalSold: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Top selling products fetched successfully",
      data: topSellingProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const totalOrdersPerUsers = async (req, res) => {
  try {
    const totalOrderPerUser = await Order.aggregate([
      {
        $group: {
          _id: "$userid",
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "auths",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userDetails.username",
          email: "$userDetails.email",
          totalOrders: 1,
        },
      },
      {
        $sort: {
          totalOrders: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "TotalOrderPerUser fetched successfully.",
      data: totalOrderPerUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getDeliveryAgentOrdersCount = async (req, res) => {
  try {
    const deliveryAgentOrdersCount = await Order.aggregate([
      { $match: { deliveryAgent: { $ne: null } } },
      {
        $group: {
          _id: "$deliveryAgent",
          totalAssignedOrders: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "auths",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          agentId: "$_id",
          agentName: "$userDetails.username",
          agentEmail: "$userDetails.email",
          totalAssignedOrders: 1,
        },
      },
      {
        $sort: {
          totalAssignedOrders: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Total Agent Orders Count Fetched Successfully.",
      data: deliveryAgentOrdersCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const userRolePercentage = async (req, res) => {
  try {
    const users = await Auth.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          roles: { $push: { role: "$_id", count: "$count" } },
        },
      },
      {
        $unwind: "$roles",
      },
      {
        $project: {
          _id: 0,
          role: "$roles.role",
          count: "$roles.count",
          percentage: {
            $round: [
              {
                $multiply: [{ $divide: ["$roles.count", "$total"] }, 100],
              },
              2,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User role percentage fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const totalOrdersAndPercentage = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: "$_id",
          totalOrders: {
            $sum: 1,
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          deliveredOrders : 1,
          totalOrdersPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$deliveredOrders", "$totalOrders"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Delivered order percentage fetched successfully",
      data: result[0] || {
        totalOrders: 0,
        deliveredOrders: 0,
        deliveredPercentage: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export {
  productBrandsOnStock,
  averagePricePerCategory,
  totalInStock,
  orderStatus,
  getOrderCountsByLocations,
  gettopSellingProducts,
  totalOrdersPerUsers,
  getDeliveryAgentOrdersCount,
  userRolePercentage,
  totalOrdersAndPercentage
};
