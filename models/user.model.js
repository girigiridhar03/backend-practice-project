import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const authSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    cartItems: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            required: true,
            default: 1,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      default: undefined,
    },
    image: {
      url: String,
      publicId: String,
    },
    role: {
      type: String,
      enum: ["admin", "user", "agent"],
      default: "user",
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

authSchema.methods.isPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

authSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESSTOKEN_JWT_KEY,
    {
      expiresIn: process.env.ACCESSTOKEN_EXPIRE_TIME,
    }
  );
};

authSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESHTOKEN_JWT_KEY,
    {
      expiresIn: process.env.REFRESHTOKEN_EXPIRE_TIME,
    }
  );
};

export const Auth = mongoose.model("Auth", authSchema);
