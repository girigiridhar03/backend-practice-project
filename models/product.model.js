import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
    },
    color: {
      type: String,
      required: true,
    },
    productImages: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Auth",
        },
        name: {
          type: String,
        },
        comment: {
          type: String,
        },
        userimage : {
          type : String
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    productSold: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
