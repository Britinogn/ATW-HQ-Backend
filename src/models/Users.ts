import mongoose, {Schema , Model} from "mongoose";
import { IUser  } from "../types";
import { UserRole } from "../types/enums";

// Define the schema with sample fields matching IUser
const UserSchema: Schema<IUser> = new Schema<IUser>({
    name:{type: String , required:[true, 'Name is required'], trim: true, 
        maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email:{type: String ,  required:[true, 'Email is required'], unique:true, lowercase:true,  
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {type: String , required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"], select: false, // Exclude from queries by default
    },

    profile: {
        type: String,  // e.g., URL or bio text
        trim: true,
        maxlength: [500, 'Profile cannot exceed 500 characters'],
    },

    role: {
        type: String,
        enum: {
            values: Object.values(UserRole), // Use the enum values
            message: `Role must be one of: ${Object.values(UserRole).join(", ")}`,
        },
        required: [true, 'Role is required'],
        default: UserRole.USER,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },
    
    isApproved: { type: Boolean, default: false } ,

    verificationToken: {
        type: String,
        select: false,  // Exclude from queries
    },
    resetPasswordToken: {
        type: String,
        select: false,  // Exclude from queries
    },
    resetPasswordExpires: {
        type: Date,
        select: false,  // Exclude from queries
    },

    

} , { timestamps: true });

// Indexes for performance
//UserSchema.index({ email: 1 });
UserSchema.index({ email: 1, role: 1 });  // Compound index for role-based queries 

// Compile the model (optional: export for use elsewhere)
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default { UserSchema, User };