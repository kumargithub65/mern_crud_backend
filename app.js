import express from "express";
import dotenv from "dotenv";
import { connectdb } from "./db/index.js";
import router from "./Routes/router.js";
import axios from "axios";
import cors from "cors";
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
// app.use("/",)
app.use(router);
app.use("/uploads", express.static("./uploads"));
app.use("/files", express.static("./public/files"));


const startserver = () => {
  try {
    connectdb(process.env.MONGOURL);
   
    app.listen(process.env.PORT || 6000, () => {
      console.log("port listening on " + process.env.PORT || 6000);
    });
  } catch (err) {
    console.log(err);
  }
};

startserver();
