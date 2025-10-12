import { Request, Response } from 'express';

// Enhanced dummy data for parent dashboard with new child progress structure
const dummyData = {
    stats: {
        totalCompletedLessons: 24,
        testScoreAverage: 85,
        achievementsCount: 4,
        learningHours: 12.5,
        monthlyProgress: 15
    },
    // Enhanced child progress data structure
    childProgress: {
        myChildProgress: {
            overallScore: 85,
            completedLessons: 24,
            timeSpent: 12.5,
            lastActivity: "2025-10-11T10:30:00.000Z",
            subjectProgress: [
                { subject: "Mathematics", progress: 75, lessonsCompleted: 8, totalLessons: 12 },
                { subject: "Science", progress: 90, lessonsCompleted: 9, totalLessons: 10 },
                { subject: "English", progress: 68, lessonsCompleted: 7, totalLessons: 15 }
            ]
        },
        weeklyLearningTrends: [
            { week: "Week 1", hoursStudied: 8.5, lessonsCompleted: 6, averageScore: 78 },
            { week: "Week 2", hoursStudied: 10.2, lessonsCompleted: 8, averageScore: 82 },
            { week: "Week 3", hoursStudied: 12.1, lessonsCompleted: 10, averageScore: 85 },
            { week: "Week 4", hoursStudied: 9.8, lessonsCompleted: 7, averageScore: 88 }
        ],
        milestonesAchievements: [
            {
                id: 1,
                title: "Math Master",
                description: "Completed 10 consecutive math lessons",
                dateAchieved: "2025-10-10T00:00:00.000Z",
                category: "Academic",
                points: 100
            },
            {
                id: 2,
                title: "Science Explorer",
                description: "Scored 90% or higher in 5 science tests",
                dateAchieved: "2025-10-08T00:00:00.000Z",
                category: "Academic",
                points: 150
            },
            {
                id: 3,
                title: "Consistent Learner",
                description: "Logged in for 7 consecutive days",
                dateAchieved: "2025-10-01T00:00:00.000Z",
                category: "Engagement",
                points: 75
            }
        ]
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

// Get child progress data for a specific user
export const getChildProgress = async (_req: Request, res: Response) => {
    try {
        
        // TODO: Replace with actual database call to get user's childProgress
        // const user = await prisma.user.findUnique({
        //     where: { id: parseInt(userId) },
        //     select: { childProgress: true }
        // });
        
        // For now, return dummy data
        res.status(200).json(dummyData.childProgress);
    } catch (error) {
        console.error("Error fetching child progress:", error);
        res.status(500).json({ error: 'Failed to fetch child progress data' });
    }
};

// Update child progress data for a specific user
export const updateChildProgress = async (req: Request, res: Response) => {
    try {
        const { progressData } = req.body;
        
        // TODO: Replace with actual database call to update user's childProgress
        // const updatedUser = await prisma.user.update({
        //     where: { id: parseInt(userId) },
        //     data: { childProgress: progressData }
        // });
        
        res.status(200).json({ 
            message: 'Child progress updated successfully',
            data: progressData 
        });
    } catch (error) {
        console.error("Error updating child progress:", error);
        res.status(500).json({ error: 'Failed to update child progress data' });
    }
};

// Generate progress report data for download
export const generateProgressReport = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { format = 'json' } = req.query;
        
        // Generate comprehensive progress report
        const progressReport = {
            reportDate: new Date().toISOString(),
            studentInfo: {
                userId: userId,
                reportPeriod: "October 2025"
            },
            summary: dummyData.childProgress.myChildProgress,
            weeklyTrends: dummyData.childProgress.weeklyLearningTrends,
            achievements: dummyData.childProgress.milestonesAchievements,
            recommendations: [
                "Focus more on English language skills",
                "Continue excellent progress in Science",
                "Maintain consistent daily learning schedule"
            ]
        };
        
        if (format === 'pdf') {
            // TODO: Generate PDF report
            res.status(200).json({ 
                message: 'PDF generation not implemented yet',
                downloadUrl: '/api/parent/progress-report/download/' + userId 
            });
        } else {
            res.status(200).json(progressReport);
        }
    } catch (error) {
        console.error("Error generating progress report:", error);
        res.status(500).json({ error: 'Failed to generate progress report' });
    }
};
