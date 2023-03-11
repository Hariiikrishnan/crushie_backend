import mongoose from "mongoose";

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.DBURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true
      })
  
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
    //   console.error(`Error: ${error.message}`.red.underline.bold)
    console.log(`Error With Connecting DB : ${error.message}`)
      process.exit(1)
    }
  }
  
  export default connectDB