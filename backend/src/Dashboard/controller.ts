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

/**
 * Returns aggregated expense totals grouped by type/category for the requested range.
 * Query: ?range=week|month|year (default: month)
 */
export const getExpensesSummary = async (req: Request, res: Response) => {
  try {
    const range = String(req.query.range || 'month');
    const now = new Date();
    let startDate: Date;

    if (range === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); // last 7 days
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // start of month 11 months ago
    } else {
      // month
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // last 30 days
    }

    try {
      // Use Prisma groupBy to aggregate totals per type
      const groups = await (prisma as any).expense.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _sum: { amount: true }
      });

      const summary = groups.map((g: any) => ({ type: g.type, total: g._sum?.amount ?? 0 }));
      return res.status(StatusCodes.OK).json({ summary, range });
    } catch (dbErr: any) {
      console.warn('Failed to aggregate expenses via Prisma:', dbErr?.message || dbErr);
      // If DB aggregation fails (e.g., migrations not applied), return helpful message
      return res.status(StatusCodes.OK).json({ summary: [], range, warning: 'Expense aggregation not available. Ensure Prisma migrations have been applied.' });
    }
  } catch (error: any) {
    console.error('Error in getExpensesSummary:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to compute expense summary' });
  }
};
