import express from 'express';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import sendResponse from '../helpers/sendResponse.js';
import { anyAuthMiddleware, authenticationUser } from '../midelewear/authentication.js';
import User from '../models/auth.js';
const router = express.Router()

router.get("/myInfo", anyAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user._id
        })
        return sendResponse(res, 200, user, false, "User Updated Successfully")
    } catch (error) {
        return sendResponse(res, 500, null, true, error.message)
    }
})

export default router