// import { Request, Response, NextFunction } from 'express';

// export const requireApproval = (req:Request, res:Response, next:NextFunction) => {
//     if (req.user.role === "agent" && !req.user.isApproved) {
//         res.status(403).json({
//             status: false,
//             message: "Your account is pending approval. Please wait for admin approval."
//         });
//         return;
//     }
//     next();
// };
