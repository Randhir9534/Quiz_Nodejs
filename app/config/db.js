const mongoose=require('mongoose');

const connectDb= async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDb connected");
        
    }catch(e){
        console.log("error",e);      
    }
}
module.exports=connectDb;