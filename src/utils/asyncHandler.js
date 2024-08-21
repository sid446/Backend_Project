//creating a wraper function


const asyncHandler =(requestHandler)=>{

   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }

}



export {asyncHandler}
/* try catch method


//parameter me hi function include karliya higher order function
const asyncHandler = (fn) => async (req,res,next) =>{


}    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
           success:false, // this for front end dev to make thier job easy ki succes hua ki nahi
           message:err.message 
        })
        
    }// en function uthaya =(fn)=> usko ek aur function me pass kar diya =(fn)=>()"dusara function" =>{}*/