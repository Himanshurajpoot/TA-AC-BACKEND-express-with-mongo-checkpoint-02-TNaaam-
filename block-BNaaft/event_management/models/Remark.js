let mongoose = require("mongoose");
let Schema = mongoose.Schema


let remarkSchema =new Schema({
    title:{type:String, require:true},
    author:{type:String, require:true},
    likes:{type:Number, default:0},
    dislikes:{type:Number,default:0},
    eventId:{type:Schema.Types.ObjectId, ref:"Event", require:true}
},{timestamps:true})


let Remark = mongoose.model("Remark", remarkSchema)
module.exports=Remark