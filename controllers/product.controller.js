import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Auth } from "../models/user.model.js";

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

    const existingProduct = await Product.findOne({
      name,
      brand,
      category,
    });

    const finalGroupId =
      existingProduct?.groupId || new mongoose.Types.ObjectId();

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

const editProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: `${productId} not found`,
      });
    }

    const {
      name,
      price,
      description,
      rating,
      brand,
      category,
      stock,
      variant,
      color,
    } = req.body;

    const files = req.files;

    let productImages = product.productImages;

    if (files && files.length > 0) {
      const imageUploadResult = await Promise.all(
        files.map((image) => uploadToCloudinary(image?.path))
      );

      productImages = imageUploadResult.map((img) => ({
        url: img.url,
        publicId: img.public_id,
      }));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: name || product?.name,
        price: price || product?.price,
        description: description || product?.description,
        rating: rating || product?.rating,
        brand: brand || product?.brand,
        category: category || product?.category,
        stock: stock || product?.stock,
        variant: variant || product?.variant,
        color: color || product?.color,
        productImages,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: `${productId} not found`,
      });
    }

    const deleteProduct = await Product.findByIdAndDelete(product?._id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product Deleted successfully",
      data: deleteProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userid = req.user?._id;

    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Product ID and valid quantity are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Product not found",
      });
    }

    const user = await Auth.findById(userid);

    const existingItem = user?.cartItems?.find(
      (item) => item?.productId?.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cartItems.push({
        productId,
        quantity,
        price: product?.price,
        name: product?.name,
        rating: product?.rating,
        productImages: product?.productImages,
        description: product?.description,
        color: product?.color,
        variant: product?.variant,
      });
    }

    await user.save();

    const cartTotal = user.cartItems?.reduce(
      (acc, curr) => acc + curr.price * curr.quantity,
      0
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product added to cart",
      data: user.cartItems,
      cartTotal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getCartDetails = async (req, res) => {
  try {
    const userid = req.user?._id;

    const exisingUser = await Auth.findById(userid);

    const cartItems = exisingUser.cartItems;

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Cart is empty",
      });
    }

    const cartTotal = cartItems.reduce(
      (acc, curr) => acc + curr.price * curr.quantity,
      0
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Cart items Retrived successfully.",
      data: cartItems,
      cartTotal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const user = await Auth.findById(req.user?._id);
    const { productId } = req.params;

    if (!productId) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: "cart id not found",
      });
    }

    const exisitingId = user.cartItems.find(
      (item) => item.productId.toString() === productId
    );

    if (!exisitingId) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: `${productId} not found`,
      });
    }

    user.cartItems = user.cartItems.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Item removed from cart",
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
  addProduct,
  editProduct,
  deleteProduct,
  addToCart,
  getCartDetails,
  deleteCartItem,
};
