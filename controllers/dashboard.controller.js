import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

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

export {
  productBrandsOnStock,
  averagePricePerCategory,
  totalInStock,
  orderStatus,
  getOrderCountsByLocations,
  gettopSellingProducts,
};
