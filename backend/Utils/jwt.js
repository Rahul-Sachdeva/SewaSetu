import jwt from "jsonwebtoken";
const JWT_EXPIRES_IN = "7d";

export const generateToken = (user) => {
    const JWT_VAL = process.env.JWT_SECRET;
    return jwt.sign(
        {
            id: user._id,
            role: user.user_type,
        },
        JWT_VAL,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, JWT_VAL);
}
