import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default system settings
  await prisma.systemSettings.create({
    data: {
      companyName: "Book8 Learning Platform",
      adminEmail: "admin@book8.com",
      premiumPricing: "50",
      notificationEmail: "notifications@book8.com",
    },
  });

  // Create some dummy videos
  await prisma.videos.createMany({
    data: [
      {
        title: "Introduction to Colors",
        linkyoutube_link: "https://www.youtube.com/watch?v=ybt2jhCQ3lA",
        category: "school",
        position: 1,
        description: "Learn basic colors with fun animations",
        ageGroup: "3-5 years",
        name: "Teacher Sarah"
      },
      {
        title: "Basic Numbers 1-10",
        linkyoutube_link: "https://www.youtube.com/watch?v=DR-cfDsHCGA",
        category: "school",
        position: 2,
        description: "Count from 1 to 10 with fun exercises",
        ageGroup: "3-5 years",
        name: "Teacher Mike"
      },
      {
        title: "Daily Routines",
        video_url: "https://cdn.example.com/videos/daily-routines.mp4",
        category: "my_world_daily_life",
        position: 1,
        description: "Learn about daily routines and activities",
        ageGroup: "6-8 years",
        name: "Teacher Emma"
      },
      {
        title: "Family Members",
        video_url: "https://cdn.example.com/videos/family.mp4",
        category: "family_friends",
        position: 1,
        description: "Learn about family members and relationships",
        ageGroup: "3-5 years",
        name: "Teacher Lisa"
      }
    ]
  });

  // Create some test users
  await prisma.user.create({
    data: {
      email: "teacher@book8.com",
      password: "$2a$10$dqWjF8mJwFZj0dyWzjQH8eRgHM2qMDj8KX8LKJ", // hash of "password123"
      username: "Teacher Demo",
      role: "TEACHER",
      isEmailVerified: true
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
