import mongoose from 'mongoose';
import dotenv from 'dotenv';


// Load environment variables from .env file
dotenv.config();

const DBConfig = mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(
      `MongoDB connected successfully to ${mongoose.connection.host}`
    );
  })
  .catch((err) => {
    console.log(err)
    // console.log("Mongoose failed to connect")
    
  });

export default DBConfig;
