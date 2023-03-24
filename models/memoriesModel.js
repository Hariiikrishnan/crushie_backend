import mongoose from 'mongoose';


const memoriesSchema = new mongoose.Schema({
    u_mid:Number,
    x:String,
    content:String,
    name:String
  });
  const Memory = new mongoose.model("Memory",memoriesSchema);

  export default Memory