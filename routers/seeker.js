import 'dotenv/config'
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import sendResponse from '../helpers/sendResponse.js';
import express from 'express';
import { seekerRegisterSchema } from '../validation/seekerSchema.js';
import { authenticationAdmin, authenticationDepartment, authenticationReceptionist, authenticationUser } from '../midelewear/authentication.js';
import Seeker from '../models/register.js';
import cloudinary from "../helpers/cloudinary.js";

const router = express.Router()



router.post("/seekerRegister", authenticationReceptionist, async (req, res) => {
    const { error, value } = seekerRegisterSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    try {
        const existingUser = await Seeker.findOne({ cnic: value.cnic });
        if (existingUser) {
            return sendResponse(res, 409, null, true, "CNIC already registered. Please use a unique CNIC.");
        }
        const existingEmail = await Seeker.findOne({ email: value.email });
        if (existingEmail) {
            return sendResponse(res, 409, null, true, "Email already registered. Please use a unique Email.");
        }

        const seekerCount = await Seeker.countDocuments();
        const tokenNumber = `TKN-${seekerCount + 1}`;

        let newUser = new Seeker({ ...value, tokenNumber: tokenNumber, purpose: value.purpose.toLowerCase(), });
        newUser = await newUser.save();

        const qrData = `https://beneficary-backend.vercel.app/seeker/${newUser._id}`;
        const qrCodeImage = await QRCode.toDataURL(qrData);

        const uploaded = await cloudinary.uploader.upload(qrCodeImage, {
            folder: "qr-codes",
            quality: "auto",
            fetch_format: "auto",
        });


        newUser.qrCodeUrl = uploaded.secure_url;
        await newUser.save();


        return sendResponse(res, 201, {
            newUser, qrImageUrl: uploaded.secure_url, tokenNumber,
        }, false, "User registered successfully");

    } catch (err) {
        return sendResponse(res, 500, null, true, "Server error while registering user" + err);
    }
});


router.get("/seekerDownload/:id", authenticationReceptionist, async (req, res) => {
    const seeker = await Seeker.findById(req.params.id);
    console.log("seekerMbandhkiya==>", seeker)
    if (!seeker) return sendResponse(res, 404, null, true, "Seeker not found");
    return sendResponse(res, 200, seeker, false, "Seeker found");
});

// GET /department/:dept/seekers
router.get("/:dept/seekers", authenticationDepartment, async (req, res) => {
    const { dept } = req.params;
    const seekers = await Seeker.find({ purpose: dept });
    console.log("seekerBackend==>", seekers)
    res.status(200).json({ data: seekers });
});


router.get("/seeker/:id", authenticationDepartment, async (req, res) => {
    const seeker = await Seeker.findById(req.params.id);
    if (!seeker) return sendResponse(res, 404, null, true, "Seeker not found");
    return sendResponse(res, 200, seeker, false, "Seeker found");
});

router.put("/seeker/:id/status", authenticationDepartment, async (req, res) => {
    try {
        const { status } = req.body;
        const seeker = await Seeker.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        return sendResponse(res, 200, seeker, false, "Status updated successfully");
    } catch (error) {
        return sendResponse(res, 400, null, true, error.message);
    }
});


router.get("/admin/reports", authenticationAdmin, async (req, res) => {
    const totalSeekers = await Seeker.countDocuments();
    const completed = await Seeker.countDocuments({ status: "completed" });
    const pending = await Seeker.countDocuments({ status: "pending" });
    const inprocess = await Seeker.countDocuments({ status: "inprocess" });
    return sendResponse(res, 200, { totalSeekers, inprocess, completed, pending }, false, "Report generated");
});


router.get("/seeker/status/:cnic", authenticationUser, async (req, res) => {
    try {
        const cnic = req.params.cnic;

        if (!cnic) {
            return sendResponse(res, 400, null, true, "CNIC required");
        }

        const seeker = await Seeker.findOne({ cnic });

        if (!seeker) {
            return sendResponse(res, 404, null, true, "Seeker not found");
        }

        return sendResponse(res, 200, {
            name: seeker.name,
            cnic: seeker.cnic,
            status: seeker.status,
            tokenNumber: seeker.tokenNumber,
            department: seeker.department,
        }, false, "Seeker data fetched");

    } catch (err) {
        return sendResponse(res, 500, null, true, "Server error" + err);
    }
}
)
router.get("/seeker/status/:cnic", authenticationUser, async (req, res) => {
    try {
        const cnic = req.params.cnic;

        if (!cnic) {
            return sendResponse(res, 400, null, true, "CNIC required");
        }

        const seeker = await Seeker.findOne({ cnic });
        console.log("Backend MSeeker Seekre==>", seeker)
        if (!seeker) {
            return sendResponse(res, 404, null, true, "Seeker not found");
        }

        return sendResponse(res, 200, seeker, false, "Seeker data fetched");

    } catch (err) {
        return sendResponse(res, 500, null, true, "Server error" + err);
    }
}
)

export default router