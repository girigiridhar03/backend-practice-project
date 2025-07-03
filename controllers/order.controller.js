import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { Auth } from "../models/user.model.js";
import Product from "../models/product.model.js";
import Counter from "../models/Counter.model.js";

const generateOrderId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(4, "0");
  return `ORD${paddedSeq}`;
};

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

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: `Product with ID ${item.productId} not found.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: `Not enough stock for product: ${product.name}`,
        });
      }

      product.stock -= item.quantity;
      product.productSold = (product.productSold || 0) + item.quantity;

      await product.save();
    }

    const user = await Auth.findById(userid);

    user.cartItems = user.cartItems.filter(
      (item) => !productsIDorders.includes(item.productId.toString())
    );

    await user.save();

    const newOrder = await Order.create({
      orderId: await generateOrderId(),
      products,
      userid,
      totalPrice,
      address,
      pinCode,
      location,
      paymentMethod,
    });

    const filteredOrder = await Order.findById(newOrder._id).select(
      "-deliveryAgent -isAssign"
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Order placed successfully",
      data: filteredOrder,
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
      .populate("userid", "username email")
      .populate("deliveryAgent", "username email image");

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
const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Order id is required.",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Order id is invaild.",
      });
    }

    const singleOrder = await Order.findById(id)
      .populate(
        "products.productId",
        "name price rating brand category variant color productImages"
      )
      .populate("userid", "username email image")
      .populate("deliveryAgent", "username email image");

    if (!singleOrder) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Single Order fetched",
      data: singleOrder,
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

const assignOrderToAgent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { agentId } = req.body;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "orderid is missing or invalid id",
      });
    }

    if (!agentId || !mongoose.isValidObjectId(agentId)) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "agenetid is missing or invaild id",
      });
    }

    const orderDetails = await Order.findById(orderId);
    const agent = await Auth.findById(agentId);

    if (agent.role !== "agent") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Selected user is not a delivery agent",
      });
    }

    if (!orderDetails) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Order not found",
      });
    }

    orderDetails.deliveryAgent = agent._id;
    orderDetails.isAssign = true;

    await orderDetails.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Order is assigned to ${agent.username}`,
      data: orderDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const agentAssignedOrders = async (req, res) => {
  try {
    const agentid = req.query.agentid || req.user?._id;

      if (!mongoose.Types.ObjectId.isValid(agentid)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid agent ID.",
      });
    }

    const agentdeliveryOrders = await Order.find({ deliveryAgent: agentid }).populate("deliveryAgent","username email image role");

    if (agentdeliveryOrders.length === 0) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No order's to delivery",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Orders retrieved.",
      data: agentdeliveryOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userOrders = await Order.find({ userid: req.user?._id })
      .select("-isAssign")
      .populate(
        "products.productId",
        "name productImages price color variant description rating _id"
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User orders retrieved.",
      data: userOrders,
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
  postOrderDetails,
  getAllOrders,
  statusUpdate,
  assignOrderToAgent,
  agentAssignedOrders,
  getUserOrders,
  getSingleOrder,
};
