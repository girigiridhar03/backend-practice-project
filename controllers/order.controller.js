import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { Auth } from "../models/user.model.js";

const postOrderDetails = async (req, res) => {
  try {
    const { products, totalPrice, address, pinCode, location, paymentMethod } =
      req.body;

    const userid = req.user?._id;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "products is missing or products need to be in array format.",
      });
    }

    if (!totalPrice || !address || !pinCode || !location || !paymentMethod) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "All fields are required.",
      });
    }

    const productsIDorders = products.map((item) => item.productId.toString());

    const user = await Auth.findById(userid);

    user.cartItems = user.cartItems.filter(
      (item) => !productsIDorders.includes(item.productId.toString())
    );

    await user.save();

    const newOrder = await Order.create({
      products,
      user,
      totalPrice,
      address,
      pinCode,
      location,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);
    const skip = (page - 1) * limit;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (location) {
      query.location = location;
    }

    const allOrders = await Order.find(query)
      .skip(skip)
      .limit(limit)
      .populate(
        "products.productId",
        "name price rating brand category variant color productImages"
      )
      .populate("userid", "username email");

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "All orders retrived.",
      data: allOrders,
      currentPage: page,
      totalOrders,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const statusUpdate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const statusArray = [
      "pending",
      "processing",
      "out for delivery",
      "delivered",
      "cancelled",
    ];

    if (!orderId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Orderid is required",
      });
    }

    if (!status || !statusArray.includes(status)) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "Invalid Status",
      });
    }

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "Invalid order id.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Order not found",
      });
    }

    if (order.status === status) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Order status is already '${status}'`,
      });
    }

    order.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Order is updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export { postOrderDetails, getAllOrders, statusUpdate };
