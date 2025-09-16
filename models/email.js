const mongoose=require("mongoose");


const emailSchema=new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true   
    },
    subject:{
        type:String,
        require:true
    },
    cc:{
        type:String
    },
    content:{
        type:String,
        required:true
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    isArchive:{
      type:Boolean,
      default:false
    }
},{timestamps:true});

module.exports=mongoose.model("Email",emailSchema);