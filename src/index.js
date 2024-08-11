//require('dotenv').config({path:'./env'})
//better way kyun ki upar require and neche import thoda inconssitant ho raah hai
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: './.env'
})



connectDB() 
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at Port:${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongodb CONNECTION FAILED!!",err)
})





















/* another method creating a iffi
const app =express()


(async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERRR:",error);
            throw error
        })//database toh connect ho gaya hai par express ki app kam nahi kar rahi
        app.listen(process.env.PORT,()=>{
            console.log(`App is litening on prt ${process.env.PORT}`);

        })
    } catch (error) {
        console.error("ERROR",error)
        throw err
        
    }
})()//ifis  matlb function turant chalado
*/



