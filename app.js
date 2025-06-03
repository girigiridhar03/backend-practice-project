import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

import userroute from "./routes/user.routes.js";
import productroute from "./routes/product.routes.js";

app.use("/auth",userroute);
app.use("/store",productroute)

export default app;
