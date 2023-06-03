import mongoose from "mongoose";


export function connectdb (url){
    mongoose.connect(url).then(()=>console.log("database connected")).catch((err)=>console.log(err))
}
