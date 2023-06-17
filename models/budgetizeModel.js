import mongoose from 'mongoose';


const budegtschema = new mongoose.Schema({
    x:String,
    u_id:String,
    expenses:Array,
    totalPerday:Number,
    ledgerDate:String
  });


  budegtschema.index(
    {ledgerDate:1},{unique:true}
  );
  const Budget = new mongoose.model("Budget",budegtschema);
   Budget.createIndexes();
  export default Budget