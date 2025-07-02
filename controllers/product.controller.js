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
      section,
    } = req.body;

    if (
      !name ||
      !price ||
      !description ||
      !rating ||
      !brand ||
      !category ||
      !stock ||
      !color ||
      !section
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
      section,
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
      section,
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
        section: section || product?.section,
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
      user.cartItems?.push({
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

const updateCart = async (req, res) => {
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

    existingItem.quantity = quantity;

    user.cartItems = user.cartItems.map((item) =>
      item?.productId.toString() === productId ? existingItem : item
    );

    await user.save();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Cart Updated",
      data: user.cartItems,
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

    if (cartItems?.length === 0) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Cart is empty",
      });
    }

    const cartTotal = cartItems?.reduce(
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

const getAllProducts = async (req, res) => {
  try {
    const { name, brand, category, section } = req.query;
    const userid = req.user?._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const query = {};

    if (section) {
      query.section = { $regex: section, $options: "i" };
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    let allProducts = await Product.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    allProducts = allProducts.map((product) => {
      if (product.comments && Array.isArray(product.comments)) {
        product.comments = product.comments.map((item) => {
          return {
            ...item,
            isDelete: item.user.toString() === userid.toString(),
          };
        });
      }
      return product;
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "All product retrived successfully",
      data: allProducts,
      currentPage: page,
      totalProducts,
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

const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userid = req.user?._id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Invalid Product ID : ${productId}`,
      });
    }

    const product = await Product.findById(productId).populate(
      "comments.user",
      "username email image"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Product not found.",
      });
    }
    const productObj = product.toObject();
    productObj.comments.sort((a, b) => new Date(b.date) - new Date(a.date));

    productObj.comments = productObj.comments.map((item) => ({
      ...item,
      isDelete: item.user.toString() === userid?.toString(),
    }));
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `${productId} is retrived`,
      data: productObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const addComments = async (req, res) => {
  try {
    const { productId } = req.params;
    const { comment } = req.body;
    const userId = req.user?._id;

    if (!userId || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "All fields are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid productId or userId",
      });
    }

    const existingUser = await Auth.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "user not found",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "product not found",
      });
    }

    product.comments.push({
      user: userId,
      comment,
    });

    await product.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Comment added successfully",
      comments: product.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { productId, commentId } = req.params;

    const userid = req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(userid)
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Product id or user id is invalid",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Product is not found",
      });
    }

    const beforeCountLength = product.comments.length;

    product.comments = product.comments.filter(
      (item) => item._id.toString() !== commentId?.toString()
    );

    if (beforeCountLength === product.comments.length) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Comment not found or already deleted",
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Comment remove successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getCategoriesAndCount = async (req, res) => {
  try {
    const { section } = req.query;

    const allProductsCategories = await Product.aggregate([
      {
        $match: {
          section: section,
        },
      },
      {
        $group: {
          _id: "$category",
          totalProducts: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          category: "$_id",
          totalProducts: 1,
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "All categories retrieved.",
      data: allProductsCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getProductsByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Group id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: `Invalid group id : ${groupId}`,
      });
    }

    const productsByGroupId = await Product.find({ groupId });

    if (productsByGroupId?.length === 0) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No items found with groupid.",
        data: productsByGroupId,
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Producst retrived successfully.",
      data: productsByGroupId,
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
  getAllProducts,
  getSingleProduct,
  editProduct,
  deleteProduct,
  addToCart,
  updateCart,
  getCartDetails,
  deleteCartItem,
  addComments,
  deleteComment,
  getCategoriesAndCount,
  getProductsByGroupId,
};
