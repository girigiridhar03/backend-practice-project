import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.108:5173"],
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
