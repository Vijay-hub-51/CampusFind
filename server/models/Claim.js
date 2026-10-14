import mongoose from 'mongoose';
const schema = new mongoose.Schema({ item:{type:mongoose.Schema.Types.ObjectId,ref:'Item',required:true}, claimant:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, answer:String, status:{type:String,enum:['pending','approved','rejected'],default:'pending'} },{timestamps:true});
export default mongoose.model('Claim',schema);
