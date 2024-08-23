import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>
    {//get user details from frontend
        // validation  - not empty
        // check if user already exist : username,email
        // check for images,check for avatar
        // upload them to cloudinary,avatar
        // create user object-create entry in db
        //remove password and refresh token field from response
        //check for user creation
        //return res is user is created

       const{fullname,email,username,password}= req.body            //agar form ya json se data aa raha hai vo isase milta
       console.log("email:",email);
    
    //now validation
   if ([fullname,email,username,password].some((field)=>field?.trim()==""))
    {
        throw new ApiError(400,"All fields are required")
   }
   //now add validation for email formating-hw
   //user already exist?
  const existedUser= User.findOne({
    $or:[{ username }, { email }]

   })//find user whose username matched with the input one
   
   if (existedUser) {
    throw new ApiError(409,"User with email or Username already exist")
   }

   //now check images and avatar
   //since we already has acces of file through req.body nut we have already created a multer so it will give us more functionality using req.files
   const avatarLocalPath=req.files?.avatar[0]?.path //we access first property optionaly using [0]
   console.log("path is",avatarLocalPath)

   const coverImageLocalPath =req.file?.coverImage[0]?.path;

   //check if avatar aaya ki nahi
   if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required")
   }

   //upload them to cloudinary
   const avatar=await uploadOnCloudinary(avatarLocalPath)
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)

   //recheck avatar
   if(!avatar){
    throw new ApiError(400,"Avatar file is required")
   }
   //create object and database me entry mar do
  const user =await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "" ,//avatar toh hoga hi hoga but coverImage ho sakti bhi hai ya nahi bhi toh is liye humne optional technic use ki
    email,
    password,
    username:username.toLowercase()
   })
  const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
  ) //yaha pe vo likhte jo jo cheej nahi chahiye

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  return res.status(201).json(new ApiResponse(200,createdUser,"User registered Successfully"))
})



export {registerUser}