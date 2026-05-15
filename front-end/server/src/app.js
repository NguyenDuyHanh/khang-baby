import express from "express";
import cors from "cors";

import { errorHandler, notFound } from "./middleware/errors.js";
import authRouter from "./routes/auth.js";
import staffRouter from "./routes/staff.js";
import productsRouter from "./routes/products.js";
import stockRouter from "./routes/stock.js";
import receiptsRouter from "./routes/receipts.js";
import invoicesRouter from "./routes/invoices.js";
import ordersRouter from "./routes/orders.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5174";
app.use(
  cors({
    origin: corsOrigin.split(",").map((s) => s.trim()),
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/staff", staffRouter);
app.use("/api/products", productsRouter);
app.use("/api/stock", stockRouter);
app.use("/api/receipts", receiptsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
