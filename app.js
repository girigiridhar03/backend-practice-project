import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-livid-nine-66.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

import userroute from "./routes/user.routes.js";
import productroute from "./routes/product.routes.js";
import orderRoute from "./routes/order.routes.js";

app.use("/auth", userroute);
app.use("/store", productroute);
app.use("/order", orderRoute);

export default app;
