import mongoose from 'mongoose';
const schema = new mongoose.Schema({ type:{type:String,enum:['lost','found'],required:true}, title:{type:String,required:true}, category:{type:String,required:true}, description:String, color:String, brand:String, location:{type:String,required:true}, date:{type:Date,required:true}, image:String, status:{type:String,enum:['pending','active','claimed','returned','rejected'],default:'pending'}, reportedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true} },{timestamps:true});
export default mongoose.model('Item',schema);
