import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

//created aat the time of logout code
export const verifyJWT= asyncHandler(async(req,res,next)=>{
  try {
      //req ke pass cookies ka acces hai abb aaya kaise?? humne hi toh diya tha
     const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
     // if token nahi hai toh
     if(!token){
      throw new ApiError(401,"Unauthorized request")
     }
  
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
     const user =await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
      //next
      throw new ApiError(401,"Invalid Access Token")
     }
  
     req.user=user//u cane use anything in playe of req.user
  
     next()
  
  } catch (error) {
    throw new ApiError(401,error?.message ||"Invalid Access token" )
    
  }
})