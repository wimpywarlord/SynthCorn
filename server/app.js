import express from "express";
import bodyParser from "body-parser";
import modelsRouter from "./routes/models.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

import { createClient } from "@supabase/supabase-js";

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a single supabase client for interacting with your database
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware to attach supabaseClient to req
app.use((req, res, next) => {
  req.supabaseClient = supabaseClient;
  next();
});

// TEST ROUTE
app.get("/test", (req, res) => {
  res.send("test");
});

app.use("/models", modelsRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
