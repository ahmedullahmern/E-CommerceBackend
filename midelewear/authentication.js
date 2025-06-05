import 'dotenv/config';
import jwt from 'jsonwebtoken';
import sendResponse from '../helpers/sendResponse.js';
import User from '../models/auth.js';


export async function anyAuthMiddleware(req, res, next) {
    try {
        const bearerToken = req?.headers?.authorization
        const token = bearerToken?.split(" ")[1]
        if (!token) return sendResponse(res, 403, null, true, "Token not Provide")
        const decoded = jwt.verify(token, process.env.AUTH_SECRET)
        if (decoded) {
            const user = await User.findById(decoded._id)
            if (!user) {
                return sendResponse(res, 403, null, true, "User Not Found")
            }
            req.user = decoded
            next()
        } else {
            return sendResponse(res, 500, null, true, "SomeThing Went Worng")
        }
    } catch (error) {
        return sendResponse(res, 500, null, true, "SomeThing Went Worng")
    }
}


export async function authenticationUser(req, res, next) {
    try {
        const bearerToken = req?.headers?.authorization
        const token = bearerToken?.split(" ")[1]
        if (!token) return sendResponse(res, 403, null, true, "Token not Provide")
        const decoded = jwt.verify(token, process.env.AUTH_SECRET)
        if (decoded) {
            const user = await User.findById(decoded._id)
            if (!user) {
                return sendResponse(res, 403, null, true, "User Not Found")
            }
            req.user = decoded
            if (decoded.role == "user") {
                next()
            } else {
                return sendResponse(res, 403, null, true, "beneficiary Only allewd to access")
            }
        } else {
            return sendResponse(res, 500, null, true, "SomeThing Went Worng")
        }
    } catch (error) {
        return sendResponse(res, 500, null, true, error.message + "error.message in middleweare AuthenticationUser")
    }
}


export async function authenticationAdmin(req, res, next) {
    try {
        const bearerToken = req?.headers?.authorization
        console.log("TOKEN MISSONG==>", req?.headers?.authorization)
        if (!bearerToken) return sendResponse(res, 403, null, true, "Token not Provide")

        const token = bearerToken?.split(" ")[1]
        const decoded = jwt.verify(token, process.env.AUTH_SECRET)
        req.user = decoded
        console.log("decodde==>", decoded)
        if (decoded.role == "admin") {
            next()
        } else {
            return sendResponse(res, 403, null, true, "Admin Only allewd to access")
        }
    } catch (error) {
        return sendResponse(res, 500, null, true, "SomeThing Went Worng")
    }
}


