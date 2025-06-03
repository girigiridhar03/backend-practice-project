import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectToDB = async()=>{
      try {
        
        await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
        console.log("Database connected successfully...")

      } catch (error) {
        console.log("Connection failed while connecting to DB", error)
        process.exit(1)
      }
}

export default connectToDB;