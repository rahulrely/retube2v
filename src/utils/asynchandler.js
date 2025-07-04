// const name= (fn) => {async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 501).json({
//             success:false,
//             message :err.message
//         })
//     }
// }}


const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next (err))
    }
};


export {asyncHandler};