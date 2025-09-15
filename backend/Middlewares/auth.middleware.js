import { verifyToken } from "../Utils/jwt.js";
import { User } from "../Models/user.model.js";

export const authMiddleware = async(req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message: "No token provided"});
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const user = await.findById(decoded.id).select("-password");
        if(!user) return res.status(401).json({message: "Invalid token"});

        req.user = user;
        next();
    } catch(err) {
        return res.status(401).json({message: "Unauthorized"});
    }
};

// Role based middleware
export const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.user_type)){
            return res.status(403).json({message: "Access denied"});
        }
        next();
    };
};