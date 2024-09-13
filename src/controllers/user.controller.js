import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
//creating method for refresh token and other
const generateAccessAndRefreshTokens = async(userId)=>{

  try {
    const user= await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken= user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false}) //jab bhi save ho password hona hi chahiye
    
    return{accessToken,refreshToken}


  } catch (error) {
    throw new ApiError(500,"something went wrong  while generating refresh and access token")
    
  }
}

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

       const{fullname,email,username,password}= req.body//agar form ya json se data aa raha hai vo isase milta
       console.log("email:",email);
    
    //now validation
   if ([fullname,email,username,password].some((field)=>field?.trim()==""))
    {
        throw new ApiError(400,"All fields are required")
   }
   //now add validation for email formating-hw
   //user already exist?
  const existedUser= await User.findOne({
    $or:[{ username }, { email }]

   })//find user whose username matched with the input one
   
   if (existedUser) {
    throw new ApiError(409,"User with email or Username already exist")
   }

   //now check images and avatar
   //since we already has acces of file through req.body nut we have already created a multer so it will give us more functionality using req.files
   const avatarLocalPath=req.files?.avatar[0]?.path //we access first property optionaly using [0]
   

   let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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
    username:username.toLowerCase()
   })
  const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
  ) //yaha pe vo likhte jo jo cheej nahi chahiye

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  return res.status(201).json(new ApiResponse(200,createdUser,"User registered Successfully"))
})

const loginUser=asyncHandler(async(req,res)=>
{

  //req body se data le aao
const {email,username,password}=req.body
 //username or email
if (!username && !email) {
  throw new ApiError(400,"username or email required")
  
}

  //find the user

 const user=await User.findOne({
    $or:[{email},{username}]
  })

  if(!user){
    throw new ApiError(404,"user does not exist")
  }
  //check password
 const isPasswordValid=await user.isPasswordCorrect(password)
 if(!isPasswordValid){
  throw new ApiError(401,"Invalid user credential")
}
  //access and referesh token generate kar ke user ko de dunga
  const {accessToken,refreshToken}=await  generateAccessAndRefreshTokens(user._id)
  //send cookies
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


  const options={
    httpOnly:true,//so that cokkies can only be edited by the server
    secure:true
  }


  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user:loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
//yaha pe hum vo vala case kar rahe jaha user khud se access aur refresh token save karna chata
  
  





})

const logoutUser=asyncHandler(async(req,res)=>{
  //jab hum logout karenge toh cookies delete karni padegi
  //refresh token ko bhi hatana padega
  // User.findById if hum ye sedha karenge toh humar pass user ki detail nahi hai ki uska email  kya hai username kya hai toh yaha kaise logout karenge
 //BY ADDING MIDDLE WARE AUTH NOW WE HAVE ACCESS TO THE USER
 await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      refreshToken:undefined
    }
  },
   {
    new:true //return me jo apko response milega usme new value milegi
   }
 )
 const options={
  httpOnly:true,//so that cokkies can only be edited by the server
  secure:true
}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User Logged Out"))

})


const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }

  try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user =await User.findById(decodedToken?._id)
  
     if(!user){
      throw new ApiError(401,"invalid refresh token")
    }
     //verifying if incoming token is equal to saved token
    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
    }
  
    //abb naya generate kar sake 
    const options={
      httpOnly:true,
      secure:true
    }
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
  
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",newRefreshToken,option)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken:newRefreshToken},
        "Access token refreshed"
      )
    )
  } catch (error) {

    throw new ApiError(401,err?.message || "Invalid refresh token")
    
  }


})


export {registerUser,loginUser,logoutUser,refreshAccessToken}