import { Request, Response } from "express";
import { Property } from '../models/Property';
import { Car } from '../models/Cars';
import UserModel from '../models/Users';
const { User } = UserModel;
import { IUser, IProperty, ICar } from "../types";

// Response interfaces for type safety
export interface IAuthResponse {
    status: boolean;
    message: string;
    data?: { token?: string; user?: Partial<IUser> };
    requiresAgentApplication?: boolean
}

export interface IErrorResponse {
    status: boolean;
    message: string;
}

// Utility type for recent activity response
export interface RecentActivity {
    recentProperties: IProperty[];
    recentCars: ICar[];
}

// Utility type for dashboard stats (shared across roles)
export interface DashboardStats {
    totalProperties: number;
    totalCars: number;
}

// User/Agent-specific stats extension
export interface UserAgentStats extends DashboardStats {
    clientCount?: number;
    totalClients?: IUser[]; // Basic client list with populated agent
}

// Admin-specific stats
export interface AdminStats extends DashboardStats {
    totalUsers: number;
    totalAgents: number;
    pendingApprovals: number;
}

// Custom Request type extended for auth middleware (populates req.user)
export interface RequestWithUser extends Request {
    user: IUser;
}

// Dashboard response interface (unified for all roles)
export interface IDashboardResponse {
    status: boolean;
    message: string;
    data: {
        stats: DashboardStats | UserAgentStats | AdminStats;
        recentProperties?: IProperty[];
        recentCars?: ICar[];
        clients?: IUser[];
        users?: {
            data: Partial<IUser>[];
            pagination: {
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    };
}

// Utility: Get recent activity for a specific user (pure function, used by user/agent handlers)
export const getRecentActivity = async (userId: string): Promise<RecentActivity> => {
    const recentProperties = await Property.find({ postedBy: userId })
        .populate<{ postedBy: Partial<IUser> }>('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec() as unknown as IProperty[];

    const recentCars = await Car.find({ postedBy: userId })
        .populate<{ postedBy: Partial<IUser> }>('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec() as unknown as ICar[];

    return { recentProperties, recentCars };
};

// User Dashboard: Personal listings and stats only
export const getUserDashboard = async (
    req: RequestWithUser,
    res: Response<IDashboardResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { user } = req;
        const userId = user._id ? user._id.toString() : user.id?.toString() || '';

        if (!userId) {
            res.status(400).json({ status: false, message: "User ID missing" });
            return;
        }

        const { recentProperties, recentCars } = await getRecentActivity(userId);
        const stats: DashboardStats = {
            totalProperties: await Property.countDocuments({ postedBy: userId }),
            totalCars: await Car.countDocuments({ postedBy: userId }),
        };

        res.status(200).json({
            status: true,
            message: "User dashboard fetched successfully",
            data: { stats, recentProperties, recentCars }
        });
    } catch (error: any) {
        console.error("Get user dashboard error:", error);
        res.status(500).json({ status: false, message: error.message || "Failed to fetch user dashboard" });
    }
};

// Agent Dashboard: Own listings, plus client metrics
export const getAgentDashboard = async (
    req: RequestWithUser,
    res: Response<IDashboardResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { user } = req;
        const userId = user._id ? user._id.toString() : user.id?.toString() || '';

        if (!userId) {
            res.status(400).json({ status: false, message: "User ID missing" });
            return;
        }

        const { recentProperties, recentCars } = await getRecentActivity(userId);
        const stats: UserAgentStats = {
            totalProperties: await Property.countDocuments({ postedBy: userId }),
            totalCars: await Car.countDocuments({ postedBy: userId }),
            clientCount: await User.countDocuments({ agent: userId }), // Assumes 'agent' field links clients to this agent
        };
        const totalClients = await User.find({ agent: userId })
            .populate<{ agent: Partial<IUser> }>('agent', 'name')
            .select('name email')
            .limit(10)
            .exec() as unknown as IUser[];

        res.status(200).json({
            status: true,
            message: "Agent dashboard fetched successfully",
            data: {
                stats: { ...stats, totalClients },
                recentProperties,
                recentCars,
                clients: totalClients
            }
        });
    } catch (error: any) {
        console.error("Get agent dashboard error:", error);
        res.status(500).json({ status: false, message: error.message || "Failed to fetch agent dashboard" });
    }
};

// Admin Dashboard: Full system access, including all registered accounts
export const getAdminDashboard = async (
    req: RequestWithUser,
    res: Response<IDashboardResponse | IErrorResponse>
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Global stats
        const stats: AdminStats = {
            totalProperties: await Property.countDocuments(),
            totalCars: await Car.countDocuments(),
            totalUsers: await User.countDocuments({ role: { $ne: 'admin' } }), // Exclude admins for focus on registered users/agents
            totalAgents: await User.countDocuments({ role: 'agent' }),
            pendingApprovals: await Property.countDocuments({ status: 'pending' }), // Assumes 'status' field in Property
        };

        // All registered accounts (users and agents) with pagination
        const allUsers = await User.find({ role: { $ne: 'admin' } })
            .select('name email role agent createdAt') // Exclude sensitive fields like password
            .populate<{ agent: Partial<IUser> }>('agent', 'name') // If agents have sub-agents or linkages
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec() as unknown as Partial<IUser>[];

        const totalUserPages = Math.ceil(stats.totalUsers / limit);

        // Global recent activity (for all users)
        const recentProperties = await Property.find()
            .populate<{ postedBy: Partial<IUser> }>('postedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(10)
            .exec() as unknown as IProperty[];

        const recentCars = await Car.find()
            .populate<{ postedBy: Partial<IUser> }>('postedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(10)
            .exec() as unknown as ICar[];

        res.status(200).json({
            status: true,
            message: "Admin dashboard fetched successfully",
            data: {
                stats,
                users: {
                    data: allUsers,
                    pagination: { page, limit, totalPages: totalUserPages }
                },
                recentProperties,
                recentCars
            }
        });
    } catch (error: any) {
        console.error("Get admin dashboard error:", error);
        res.status(500).json({ status: false, message: error.message || "Failed to fetch admin dashboard" });
    }
};


export default {
    getUserDashboard,
    getAgentDashboard,
    getAdminDashboard
}