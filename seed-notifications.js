/**
 * Seed Test Notifications
 * Run: node seed-notifications.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotifications() {
  try {
    console.log('🌱 Seeding test notifications...\n');

    // Get first user (or create one if needed)
    let user = await prisma.user.findFirst();

    if (!user) {
      console.log('⚠️  No users found in database!');
      console.log('Please create a user first or login to the app.');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   User ID: ${user.id}\n`);

    // Delete existing notifications for this user
    const deleted = await prisma.notification.deleteMany({
      where: { userId: user.id }
    });
    console.log(`🗑️  Deleted ${deleted.count} existing notifications\n`);

    // Create test notifications
    const testNotifications = [
      {
        userId: user.id,
        title: "🎓 Welcome to ScholarHub!",
        message: "Start exploring scholarships and opportunities tailored for you. We've curated the best matches based on your profile.",
        type: "info",
        link: "/scholarships",
        isRead: false
      },
      {
        userId: user.id,
        title: "📝 Complete Your Profile",
        message: "Your profile is 80% complete! Add your academic achievements and interests to get better scholarship recommendations.",
        type: "warning",
        link: "/profile",
        isRead: false
      },
      {
        userId: user.id,
        title: "✅ Application Submitted Successfully",
        message: "Your application for Computer Science Excellence Scholarship has been submitted. You'll receive updates on your application status.",
        type: "success",
        link: "/applications",
        isRead: false
      },
      {
        userId: user.id,
        title: "🔔 New Scholarship Opportunity",
        message: "Engineering Excellence Scholarship is now available! Deadline: March 30, 2026. Full tuition coverage for undergraduate students.",
        type: "scholarship",
        link: "/scholarships/eng-2026",
        isRead: false
      },
      {
        userId: user.id,
        title: "⏰ Deadline Reminder",
        message: "Medical Research Scholarship application deadline is in 3 days! Don't miss this opportunity.",
        type: "deadline_reminder",
        link: "/scholarships/med-research",
        isRead: false
      },
      {
        userId: user.id,
        title: "📚 Study Resources Available",
        message: "New study materials and resources have been uploaded for scholarship exam preparation.",
        type: "info",
        link: "/documents",
        isRead: true
      },
      {
        userId: user.id,
        title: "🎯 Profile Matched!",
        message: "We found 5 new scholarships that match your profile perfectly. Check them out now!",
        type: "success",
        link: "/scholarships?matched=true",
        isRead: true
      },
      {
        userId: user.id,
        title: "⚠️ Action Required",
        message: "Your scholarship application is incomplete. Please upload the required documents to proceed.",
        type: "warning",
        link: "/applications/pending",
        isRead: false
      }
    ];

    // Create all notifications
    const created = await prisma.notification.createMany({
      data: testNotifications
    });

    console.log(`✅ Created ${created.count} test notifications!\n`);

    // Show created notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📋 Notifications created:\n');
    notifications.forEach((notif, i) => {
      const readStatus = notif.isRead ? '✓' : '○';
      console.log(`${i + 1}. [${readStatus}] ${notif.title}`);
      console.log(`   ${notif.message.substring(0, 60)}...`);
      console.log(`   Type: ${notif.type} | Link: ${notif.link || 'none'}\n`);
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    console.log(`\n🔔 Total: ${notifications.length} notifications (${unreadCount} unread)`);
    console.log('\n✨ Done! Check http://localhost:3003/notifications');

  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
