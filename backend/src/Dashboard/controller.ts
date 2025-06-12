import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get active users (users who logged in today)
   

    // Get premium users (if you have a premium field in your user model)
    const premiumUsers = await prisma.user.count({
      where: {
        // isPremium: true
      }
    });

    // Get total tests
    // const totalTests = await prisma.tests.count();

    // Get total revenue (you'll need to implement this based on your payment model)
    // This is just a placeholder calculation
    const totalRevenue = 0; // Implement based on your payment tracking

    // Get recent activities (last 5 activities)
    // This is a placeholder - you'll need to implement based on your activity tracking
    const recentActivities = [
      {
        icon: "📝",
        title: "New Test Created",
        description: "A new test was created in Mathematics category",
        timestamp: "2 hours ago"
      },
      {
        icon: "👤",
        title: "New User Registered",
        description: "A new user joined the platform",
        timestamp: "3 hours ago"
      }
    ];

    return res.status(StatusCodes.OK).json({
      totalUsers,
    //   activeUsers,
    //   totalTests,
      premiumUsers,
      totalRevenue,
      recentActivities
    });
  } catch (error: any) {
    console.error("Error in getDashboardStats:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch dashboard stats",
      error: error?.stack || error?.message || error
    });
  }
};
