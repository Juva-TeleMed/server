import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DBConfig = mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(
      `MongoDB connected successfully to ${mongoose.connection.host}`
    );
  })
  .catch((err) => {
    console.log(`MongoDB failed to connect`);
  });

export default DBConfig;
