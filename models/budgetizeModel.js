import mongoose from 'mongoose';


const budegtschema = new mongoose.Schema({
    x:String,
    expenses:Array,
    totalPerday:Number,
    ledgerDate:String
  });
  const Budget = new mongoose.model("Budget",budegtschema);

  export default Budget