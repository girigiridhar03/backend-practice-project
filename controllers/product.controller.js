import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      rating,
      brand,
      category,
      stock,
      variant,
      groupId,
      color,
    } = req.body;

    if (
      !name ||
      !price ||
      !description ||
      !rating ||
      !brand ||
      !category ||
      !stock ||
      !color
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "All fields are required",
      });
    }

    const files = req.files;

    if (!files || files?.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Images are required",
      });
    }

    const imageUploadResult = await Promise.all(
      files.map((image) => uploadToCloudinary(image?.path))
    );

    const finalGroupId = groupId
      ? new mongoose.Types.ObjectId(groupId)
      : new mongoose.Types.ObjectId();

    const newProduct = await Product.create({
      name,
      price,
      description,
      rating,
      brand,
      category,
      stock,
      variant,
      color,
      productImages: imageUploadResult?.map((img) => ({
        url: img.url,
        publicId: img.public_id,
      })),
      groupId: finalGroupId,
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "product added successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export { addProduct };
