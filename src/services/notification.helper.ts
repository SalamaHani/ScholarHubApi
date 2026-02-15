import { UserRole } from "@prisma/client";
import prisma from "../lib/prisma.js";
import {
  sendPushNotificationToUsers,
  sendPushNotificationToInterest,
} from "./pusher.service.js";

export interface NotificationData {
  title: string;
  message: string;
  type: string;
  link?: string;
}

/**
 * Create a complete notification (DB + Push + optional Email)
 * @param userIds - Array of user IDs to notify
 * @param notification - Notification data
 * @param sendEmail - Optional email function to call for each user
 */
export const createNotification = async (
  userIds: string[],
  notification: NotificationData,
  sendEmail?: (userId: string) => Promise<void>
): Promise<void> => {
  try {
    // 1. Create DB notifications
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
      })),
    });

    // 2. Send push notifications
    await sendPushNotificationToUsers(userIds, {
      title: notification.title,
      body: notification.message,
      url: notification.link,
      data: { type: notification.type },
    });

    // 3. Send emails if function provided
    if (sendEmail) {
      for (const userId of userIds) {
        try {
          await sendEmail(userId);
        } catch (error) {
          console.error(`Failed to send email to user ${userId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Failed to create notification:", error);
    // Don't throw - notification failures shouldn't break main operations
  }
};

/**
 * Notify all admins
 * @param notification - Notification data
 */
export const notifyAdmins = async (
  notification: NotificationData
): Promise<void> => {
  try {
    // Get all admin user IDs
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN, isActive: true },
      select: { id: true },
    });

    const adminIds = admins.map((a) => a.id);

    if (adminIds.length > 0) {
      await createNotification(adminIds, notification);
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
};

/**
 * Notify all students via broadcast
 * @param notification - Notification data
 */
export const notifyAllStudents = async (
  notification: NotificationData
): Promise<void> => {
  try {
    // 1. Get all student user IDs for DB notifications
    const students = await prisma.user.findMany({
      where: { role: UserRole.STUDENT, isActive: true },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);

    // 2. Create DB notifications
    if (studentIds.length > 0) {
      await prisma.notification.createMany({
        data: studentIds.map((userId) => ({
          userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          link: notification.link,
        })),
      });
    }

    // 3. Send push via Pusher interest (efficient for broadcasts)
    await sendPushNotificationToInterest("all-students", {
      title: notification.title,
      body: notification.message,
      url: notification.link,
      data: { type: notification.type },
    });
  } catch (error) {
    console.error("Failed to notify all students:", error);
  }
};

/**
 * Detect and notify profile milestone achievements
 * @param userId - User ID
 * @param previousCompleteness - Previous completeness percentage
 * @param newCompleteness - New completeness percentage
 * @param role - User role
 * @param sendMilestoneEmail - Function to send milestone email
 */
export const notifyProfileMilestones = async (
  userId: string,
  previousCompleteness: number,
  newCompleteness: number,
  role: string,
  sendMilestoneEmail: (
    userId: string,
    milestone: number
  ) => Promise<void>
): Promise<void> => {
  const milestones = [25, 50, 75, 100];
  const crossedMilestones = milestones.filter(
    (milestone) =>
      previousCompleteness < milestone && newCompleteness >= milestone
  );

  for (const milestone of crossedMilestones) {
    try {
      let message = "";
      let title = "";

      if (milestone === 100) {
        title = "Profile Complete!";
        message =
          "Congratulations! Your profile is now 100% complete. You can now apply for scholarships.";
      } else {
        title = `Profile ${milestone}% Complete`;
        message = `Great progress! Your profile is now ${milestone}% complete. Keep going!`;
      }

      await createNotification(
        [userId],
        {
          title,
          message,
          type: `profile_milestone_${milestone}`,
          link: "/profile",
        },
        async () => {
          await sendMilestoneEmail(userId, milestone);
        }
      );
    } catch (error) {
      console.error(
        `Failed to send milestone ${milestone} notification:`,
        error
      );
    }
  }
};

export default {
  createNotification,
  notifyAdmins,
  notifyAllStudents,
  notifyProfileMilestones,
};
