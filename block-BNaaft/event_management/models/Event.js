let mongoose = require("mongoose")
let Schema = mongoose.Schema


const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String },
    host: { type: String, required: true },
    cover_image:{type:String, require: true},
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    categories: [{ type: String, enum: ['programming', 'sports', 'trekking', 'music' , "education"] }],
    location: { type: String, required: true },
    likes:{type:Number,default:0},
    dislikes:{type:Number,default:0},
    remarks:[{type: Schema.Types.ObjectId, ref:"Remark"}] // One-to-Many association (embedded)
  },
  { timestamps: true } // createdAt & updatedAt
);

let Event = mongoose.model("Event", eventSchema);

module.exports=Event