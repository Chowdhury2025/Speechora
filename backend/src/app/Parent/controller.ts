import { Request, Response } from 'express';

// Dummy data for parent dashboard
const dummyData = {
    stats: {
        totalCompletedLessons: 24,
        testScoreAverage: 85,
        achievementsCount: 4,
        learningHours: 12.5,
        monthlyProgress: 15
    },
    schoolFees: {
        currentTerm: {
            term: "Term 2",
            year: "2025",
            amount: 500000,
            dueDate: "2025-07-15T00:00:00.000Z",
            status: "unpaid",
            breakdown: [
                { item: "Tuition Fee", amount: 300000 },
                { item: "Technology Fee", amount: 100000 },
                { item: "Learning Materials", amount: 100000 }
            ]
        },
        paymentHistory: [
            {
                id: 1,
                term: "Term 1",
                year: "2025",
                amount: 500000,
                datePaid: "2025-01-10T00:00:00.000Z",
                status: "paid",
                receiptNo: "REC-2025-001"
            },
            {
                id: 2,
                term: "Term 3",
                year: "2024",
                amount: 450000,
                datePaid: "2024-09-05T00:00:00.000Z",
                status: "paid",
                receiptNo: "REC-2024-003"
            }
        ]
    },
 
    completedLessons: {
        count: 24,
        recentLessons: [
            {
                id: 1,
                title: "Basic Addition",
                subject: "Mathematics",
                completedAt: "2025-06-21T15:30:00.000Z"
            },
            {
                id: 2,
                title: "Verbs and Tenses",
                subject: "English",
                completedAt: "2025-06-20T11:45:00.000Z"
            }
        ]
    },
    childProgress: [
        {
            subject: "Mathematics",
            progress: 75,
            totalLessons: 40,
            completedLessons: 30
        },
        {
            subject: "English",
            progress: 85,
            totalLessons: 35,
            completedLessons: 28
        },
        {
            subject: "Science",
            progress: 60,
            totalLessons: 30,
            completedLessons: 18
        }
    ],
    achievements: [
        {
            id: 1,
            title: "Math Master",
            description: "Completed 10 math lessons with perfect scores",
            date: "2025-06-15T00:00:00.000Z"
        },
        {
            id: 2,
            title: "Reading Champion",
            description: "Read 20 stories",
            date: "2025-06-10T00:00:00.000Z"
        },
        {
            id: 3,
            title: "Science Explorer",
            description: "Completed all basic science modules",
            date: "2025-06-05T00:00:00.000Z"
        },
        {
            id: 4,
            title: "Consistent Learner",
            description: "Logged in for 7 consecutive days",
            date: "2025-06-01T00:00:00.000Z"
        }
    ]
};

export const getDashboardData = async (_req: Request, res: Response) => {
    try {
        res.status(200).json(dummyData);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
