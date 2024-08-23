import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"



const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,//remove white spacing
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
        
    },
    avatar:{
        type:String, //cloudinary url
        required:true
    },
    coveImage:{
        type:String //clodinary
    },
    watchHistory:[
        {
        type:Schema.Types.ObjectId,
        ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is Required"]
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    next()
})//prehook we cant use arrow function(we cant use this.) in here because yaha pe  context nahi pata hota par isme toh hume userSchema ke hisab se karna


// making method to check if the password is correct
userSchema.methods.isPassswordCorrect= async function(password){
  return await bcrypt.compare(password,this.password)
}

//jwt is a bearer token meaning jiske pass ye token ho vaha hum data de dete
//in .env

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {//payload
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign( //ye refrsh hota rehta toh data kam hota
        {//payload
            _id:this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User =mongoose.model("User",userSchema)