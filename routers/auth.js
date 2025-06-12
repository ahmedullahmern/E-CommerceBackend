import 'dotenv/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import sendResponse from '../helpers/sendResponse.js';
import User from '../models/auth.js';
import express from 'express';
import nodemailer from 'nodemailer';
import { loginSchema, signupSchema } from '../validation/authValidation.js';
import { authenticationUser } from '../midelewear/authentication.js';

const router = express.Router()

router.post("/register", async (req, res) => {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message)
    const user = await User.findOne({ email: value.email })
    if (user) return sendResponse(res, 403, null, true, "User With This Email already Exist")
    const hashedPassword = await bcrypt.hash(value.password, 12)
    value.password = hashedPassword;
    let newUser = new User({ ...value });
    newUser = await newUser.save()
    sendResponse(res, 201, newUser, false, "User Register successfully")
})


router.post("/login", async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message)
    const user = await User.findOne({ email: value.email }).lean()
    if (!user) return sendResponse(res, 403, null, true, "User not Registered.")
    const isPasswordValid = await bcrypt.compare(value.password, user.password)
    if (!isPasswordValid) return sendResponse(res, 403, null, true, "Invalid  Credentails")
    var token = jwt.sign(user, process.env.AUTH_SECRET);
    sendResponse(res, 200, { user, token }, false, "User Login successfully")
})

router.put("/profile/update", authenticationUser, async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
        sendResponse(res, 200, updated, false, "Profile updated successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});


router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return sendResponse(res, 400, null, true, "Email is required");

    const user = await User.findOne({ email });
    if (!user) return sendResponse(res, 404, null, true, "User not found");

    const token = jwt.sign({ id: user._id }, process.env.AUTH_SECRET, { expiresIn: "15m" });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // setup email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    };

    await transporter.sendMail(mailOptions);

    sendResponse(res, 200, null, false, "Reset link sent to email");
});



router.post("/reset-password/:token", async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) return sendResponse(res, 400, null, true, "Password required");

    try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return sendResponse(res, 404, null, true, "User not found");

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        await user.save();

        sendResponse(res, 200, null, false, "Password reset successful");
    } catch (err) {
        sendResponse(res, 400, null, true, "Invalid or expired token");
    }
});


export default router