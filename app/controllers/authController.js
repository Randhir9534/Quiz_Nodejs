const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const sendEmailVerificationOtp = require('../helper/emailVerify');
const EmailVerificationModel = require('../models/otpModel');

class AuthController {
  // User signup with optional profile picture upload
  async signup(req, res) {
    try {
      const { name, email, password } = req.body;
      if(!name||!email||!password){
        return res.status(400).json({message:"All fields are required"})
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const hash = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hash });

      if (req.file) {
        newUser.profilePic = req.file.path;
      }

      const user = await newUser.save();
      sendEmailVerificationOtp(req, user);
      return res
        .status(201)
        .json({
          message: "User Created Successfully and otp send to your email please verify your email ",
          user
        });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ==========otp Verify============
  async verify(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }

      // Check if email doesn't exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(400).json({
          status: "failed",
          message: "email doesn't exists",
        });
      }

      // Check if email is already verified
      if (existingUser.isVerified) {
        return res.status(400).json({
          status: false,
          message: "Email is allready verified",
        });
      }

      // Check if there is a matching email verification OTP
      const emailVerification = await EmailVerificationModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.isVerified) {
          await sendEmailVerificationOtp(req, existingUser);
          return res.status(400).json({
            status: false,
            message: "Invalid OTP, New OTP sent to your email check it",
          });
        }
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }

      // Check if OTP is expired
      const currentTime = new Date();
      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await sendEmailVerificationOtp(req, existingUser);
        return res.status(400).json({
          status: false,
          message: "OTP expired , New OTP  sent to your email",
        });
      }
      // OTP is valid and not expired, mark email as verified
      existingUser.isVerified = true;
      await existingUser.save();

      // Delete email verification document
      await EmailVerificationModel.deleteMany({ userId: existingUser._id });
      return res
        .status(200)
        .json({ status: true, message: "Email Verified Successfully" });
    } catch (e) {
      return res.status(500).json({
        status: false,
        message: "Unable to verify email, Please try again later",
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '7d'
      });
      return res.json({ message:"log in successfully", data:user,token });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Get the Profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

   // Edit the Profile
  async editProfile(req, res) {
    try {
      const id=req.params.id
      let{name,email,password,profilePic}=req.body

      if (req.file) {
        const existing = await User.findById(id);
        if (existing && existing.profilePic) {
          const oldPath = path.resolve(existing.profilePic);
          fs.unlink(oldPath, (err) => {
            // ignore errors deleting old file
          });
        }
        profilePic = req.file.path;
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,{name,email,password,profilePic}
      );

      return res.json({message:"profile updated successsfully"});
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();
