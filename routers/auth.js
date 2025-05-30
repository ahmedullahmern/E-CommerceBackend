import 'dotenv/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import sendResponse from '../helpers/sendResponse.js';
import User from '../models/auth.js';
import express from 'express';
import { authenticationAdmin } from '../midelewear/authentication.js';
import { CreateStaffSchema, loginSchema, signupSchema } from '../validation/authValidation.js';

const router = express.Router()

router.post("/register/admin", authenticationAdmin, async (req, res) => {
    const { error, value } = CreateStaffSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message)
    const user = await User.findOne({ email: value.email })
    if (user) return sendResponse(res, 403, null, true, "User With This Email already Exist")
    const hashedPassword = await bcrypt.hash(value.password, 12)
    value.password = hashedPassword;
    let newUser = new User({ ...value });
    newUser = await newUser.save()
    sendResponse(res, 201, newUser, false, "User Register successfully")
})

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

export default router