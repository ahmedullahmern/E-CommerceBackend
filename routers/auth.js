import 'dotenv/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import sendResponse from '../helpers/sendResponse.js';
import User from '../models/auth.js';
import express from 'express';
import nodemailer from 'nodemailer';
import { loginSchema, signupSchema } from '../validation/authValidation.js';
import { authenticationUser } from '../midelewear/authentication.js';
import multer from 'multer';
import avatarUpload from '../helpers/avtarUpload.js';
import cloudinary from '../helpers/cloudinary.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

router.get("/profile", authenticationUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return sendResponse(res, 404, null, true, "User not found");
        sendResponse(res, 200, user, false, "User profile fetched");
    } catch (err) {
        sendResponse(res, 500, null, true, err.message);
    }
});

router.delete("/profileimgdelete", authenticationUser, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { avatar: "" } },
            { new: true }
        );

        sendResponse(res, 200, updatedUser, false, "Avatar deleted successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});


// router.put('/profile/update', authenticationUser, upload.single('avatar'), async (req, res) => {

//     console.log("req.body:", req.body);
//     console.log("req.file:", req.file);

//     try {
//         const updateData = {
//             name: req.body.name,
//             email: req.body.email,
//         };

//         if (req.file) {
//             const imageUrl = await avatarUpload(req.file.buffer);
//             updateData.avatar = imageUrl;
//         }

//         const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
//         sendResponse(res, 200, updatedUser, false, "User profile Updated");
//     } catch (err) {
//         console.log(err);
//         sendResponse(res, 500, null, true, err + "Somethig Went Worng");
//     }
// });

router.put('/profile/update', authenticationUser, upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) return sendResponse(res, 404, null, true, "User not found");

        // Step 1: Email already kisi aur user ka to nahi?
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return sendResponse(res, 400, null, true, "Email already in use");
            }
        }

        const updateData = {
            name: req.body.name || user.name,
            email: req.body.email || user.email,
        };

        // Step 2: Agar image upload hui hai
        if (req.file) {
            console.log("Deleting image with public_id:", user.avatarPublicId);
            // Purani image delete karo Cloudinary se
            if (req.file && user.avatarPublicId) {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            }

            // Nayi image upload karo
            // const uploadResult = await cloudinary.uploader.upload_stream(
            //     { resource_type: "image", folder: "avatars" },
            //     (error, result) => {
            //         if (error) throw new Error("Upload failed");
            //         updateData.avatar = result.secure_url;
            //         updateData.avatarPublicId = result.public_id;
            //     }
            // );

            // Yeh zaroori hai await karne ke liye
            await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (error) return reject(error);
                    console.log("Image uploaded to Cloudinary:");
                    console.log("Secure URL:", result.secure_url);
                    console.log("Public ID:", result.public_id);
                    updateData.avatar = result.secure_url;
                    updateData.avatarPublicId = result.public_id;
                    resolve(result);
                });
                stream.end(req.file.buffer);
            });
        }

        // Step 3: User update karo
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

        sendResponse(res, 200, updatedUser, false, "User profile updated successfully");
    } catch (err) {
        console.error(err);
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