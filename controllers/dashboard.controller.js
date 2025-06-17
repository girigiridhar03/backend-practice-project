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

    const stockData  = await Product.aggregate([
         {
            $group : {
                _id : {
                   $cond : [
                    {
                        $eq : ["$stock",0]
                    },
                    "Out of Stock",
                    "In Stock"
                   ]
                },

                count : {$sum : 1}
            }
         },

         {
            $project : {
                 _id : 0,
                 stockStatus : "$_id",
                 count : 1
            }
         }
    ]);

    res.status(200).json({
        success : true,
        statusCode : 200,
        message : "Stock fetched successfully",
        data : stockData
    })


  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export { productBrandsOnStock, averagePricePerCategory, totalInStock };
