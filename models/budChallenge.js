import mongoose from 'mongoose';


const budChallengeSchema = new mongoose.Schema({
    challenge_id :String,
    start_date:String,
    user1:String,
    user2:String,
    user1Name:String,
    user2Name:String,
    user1_pt:Number,
    user2_pt:Number,
    winner:String,
  });


//   budegtschema.index(
//     {ledgerDate:1},{unique:true}
//   );
  const BudChallenge = new mongoose.model("BudChallenge",budChallengeSchema);
//    Budget.createIndexes();
  export default BudChallenge