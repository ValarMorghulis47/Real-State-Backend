import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            const error = new ApiError(401, "Unauthorized request")
            return res.status(error.statusCode).json(error.toResponse());
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        // const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        const user = await User.findById(decodedToken?._id).select("-password")
    
        if (!user) {
            
            const error = new ApiError(401, "Invalid Access Token")
            return res.status(error.statusCode).json(error.toResponse());
        }
    
        req.user = user;
        next()
    } catch (error) {
        const user = new ApiError(401, error?.message || "Invalid access token")
        return res.status(error.statusCode).json(error.toResponse());
    }
})

export const isAdmin = asyncHandler(async(req, res, next) => {
    try {
        // Assuming the user object has an 'isAdmin' property that is true if the user is an admin
        if (req.user.role !== "admin") {
            const error = new ApiError(403, "Forbidden: Admin access required")
            return res.status(error.statusCode).json(error.toResponse());
        }
        next()
    } catch (error) {
        const user = new ApiError(401, error?.message || "Invalid Role")
        return res.status(error.statusCode).json(error.toResponse());
    }
})