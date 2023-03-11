import mongoose from 'mongoose';


const momentschema = new mongoose.Schema({
    createdTime:String,
    u_id:String,
    date: String ,
    time : String,
    place:String,
    color:String,
    saw:String,
    response:String, 
  });
  const Moment = new mongoose.model("Moment",momentschema);

  export default Moment