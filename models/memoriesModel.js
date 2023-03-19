import mongoose from 'mongoose';


const memoriesSchema = new mongoose.Schema({
    p_id:String,
    content:String,
    name:String
  });
  const Memory = new mongoose.model("Memory",memoriesSchema);

  export default Memory