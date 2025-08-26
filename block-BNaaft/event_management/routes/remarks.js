let express = require("express");
let router = express.Router()
let Remark = require("../models/Remark")
let Event = require("../models/Event")


// find the remark for editing
router.get("/:id/edit", async(req,res,next)=>{
    try{
      let id = req.params.id
      let remark = await Remark.findById(id)
      res.render("updateRemark", {remark})
    }catch(err){
        next(err)
    }
})

// update the remaark
router.post("/:id", async(req,res,next)=>{
    try{
      let id = req.params.id;
      let remark = await Remark.findByIdAndUpdate(id,req.body)
      res.redirect("/events/"+remark.eventId)
    }catch(err){
      next(err)
    }
})


// detete the remark
router.get("/:id/delete", async(req,res,next)=>{
  try{
    let id = req.params.id;
    let remark = await Remark.findByIdAndDelete(id)
    let event = await Event.findByIdAndUpdate(remark.eventId,{$pull:{remarks:remark.id}})
    res.redirect("/events/"+remark.eventId)
  }catch(err){
    next(err)
  }
})


// like 
router.get("/:id/like", async(req,res,next)=>{
  try{
    let id = req.params.id;
    let remark = await Remark.findByIdAndUpdate(id, {$inc:{likes:+1}})
    res.redirect("/events/"+remark.eventId)
  }catch(err){
    next(err)
  }
})

// dislike
router.get("/:id/dislike", async(req,res,next)=>{
  try{
    let id = req.params.id;
    let remark = await Remark.findByIdAndUpdate(id, {$inc:{dislikes:+1}})
    res.redirect("/events/"+remark.eventId)
  }catch(err){
    next(err)
  }
})

module.exports=router