import mongoose from "mongoose";

const landingPageSchema = new mongoose.Schema({
  landingImages: [
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
});

const LandingImage = mongoose.model("LandingImage", landingPageSchema);

export default LandingImage;
