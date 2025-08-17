import LandingImage from "../models/landingPage.modal.js";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const latestProduct = async (req, res) => {
  try {
    const lateshProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(4);

    if (lateshProducts?.length === 0) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No data.",
        data: lateshProducts,
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "latesh product feteched.",
      data: lateshProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const landingPageImages = async (req, res) => {
  try {
    const landingImages = await LandingImage.find();

    if (landingImages?.lenght === 0) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No landing images.",
        data: landingImages,
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Landing images feteched.",
      data: landingImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const addLandingPageImages = async (req, res) => {
  try {
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

    const newImages = await LandingImage.create({
      landingImages: imageUploadResult.map((image) => ({
        url: image.url,
        publicId: image.public_id,
      })),
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Upload images successfully",
      data: newImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const topFourProducts = async (req, res) => {
  try {
    const { section } = req.query;

    if (!section) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Category is required.",
      });
    }

    const topFive = await Product.find({ section: section })
      .sort({ createdAt: -1, price: 1 })
      .limit(4);

    if (!topFive || topFive?.length !== 0) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No products.",
        data: topFive,
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `top 5 ${section} products feteched.`,
      data: topFive,
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
  latestProduct,
  addLandingPageImages,
  landingPageImages,
  topFourProducts,
};
