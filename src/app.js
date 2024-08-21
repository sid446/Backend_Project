import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
// app.use is mostly used for middlewares and coniguration
app.use(cors({
    origin:process.env.CORS_ORIGIN ,//MEANING ki kaha kaha se backend se comunication allowed hai 
    credentials:true
}))

app.use(express.json({limit: "16kb"}))//jab form bhara toh iska matlb ki mai json ko accept kar raha hu
app.use(express.urlencoded({extended:true,limit:"16kb"}))//url se jo data ayega aur extended ka matlb hota ki hum object ke andar object de sakte
app.use(express.static("public")) // matlb jo bhi public asset ho vo public me jaye taki sabko accesable ho
app.use(cookieParser())//taki hum browser ki cookies ke sath interact kar sake


//routes import

import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users",userRouter) // yaha pe humne route likha /users fhir usase userRoute active ho jayega


  

export {app}