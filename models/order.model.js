import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required : true
        },

        quantity: {
          type: Number,
          required: true,
        },
        priceAtPurchase : {
            type : Number,
            required : true,
        }
      },
    ],
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required : true
    },
    totalPrice: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "out for delivery", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
