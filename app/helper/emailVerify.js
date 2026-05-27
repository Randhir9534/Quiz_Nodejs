const transporter = require("../config/emailConfig");
const otpVerifyModel=require('../models/otpModel');


const sendEmailVerificationOtp=async(req,user)=>{
    // Generate random 4 digit otp
    const otp=Math.floor(1000+Math.random()*9000);

    // save otp in database by model
    const OtpDb= await new otpVerifyModel({userId:user._id,otp:otp}).save();
    // console.log("otpdata",OtpDb);

    await transporter.sendMail({
        from:process.env.EMAIL_FROM,
        to:user.email,
        subject: "OTP - Verify You Account",
        html:`<p>Dear ${user.name},</p><p>Thank you for signing up with our website. To complete you registration, please verify you email address by entering the following One time -password (OTP)</p>
        <h2>OTP:- ${otp}</h2>
        <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`
        
    })
    return otp
} 

    
    
    
    
    
module.exports=sendEmailVerificationOtp