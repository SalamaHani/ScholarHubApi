import PushNotifications from "@pusher/push-notifications-server";

/**
 * Pusher Beams Configuration
 */
const beamsClient = new PushNotifications({
  instanceId: process.env.PUSHER_INSTANCE_ID!,
  secretKey: process.env.PUSHER_SECRET_KEY!,
});

export interface PushNotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

/**
 * Send push notification to specific users
 * @param userIds - Array of user IDs to send notification to
 * @param notification - Notification data
 */
export const sendPushNotificationToUsers = async (
  userIds: string[],
  notification: PushNotificationData,
): Promise<void> => {
  try {
    // Convert user IDs to Pusher interests (user-{userId})
    const interests = userIds.map((id) => `user-${id}`);

    const publishResponse = await beamsClient.publishToInterests(interests, {
      web: {
        notification: {
          title: notification.title,
          body: notification.body,
          deep_link: notification.url,
          icon: notification.icon || "/logo.png",
        },
        data: notification.data,
      },
    });

    console.log("Push notification sent:", publishResponse.publishId);
  } catch (error) {
    console.error("Error sending push notification:", error);
    // Don't throw error - push notifications are not critical
  }
};

/**
 * Send push notification to a single user
 * @param userId - User ID to send notification to
 * @param notification - Notification data
 */
export const sendPushNotification = async (
  userId: string,
  notification: PushNotificationData,
): Promise<void> => {
  return sendPushNotificationToUsers([userId], notification);
};

/**
 * Send push notification to a group/interest
 * @param interest - Interest name (e.g., "all-students", "all-professors")
 * @param notification - Notification data
 */
export const sendPushNotificationToInterest = async (
  interest: string,
  notification: PushNotificationData,
): Promise<void> => {
  try {
    const publishResponse = await beamsClient.publishToInterests([interest], {
      web: {
        notification: {
          title: notification.title,
          body: notification.body,
          deep_link: notification.url,
          icon: notification.icon || "/logo.png",
        },
        data: notification.data,
      },
    });

    console.log("Push notification sent to interest:", publishResponse.publishId);
  } catch (error) {
    console.error("Error sending push notification to interest:", error);
  }
};

/**
 * Generate Beams token for a user (for client-side authentication)
 * @param userId - User ID
 * @returns Beams token
 */
export const generateBeamsToken = (userId: string): any => {
  try {
    const beamsToken = beamsClient.generateToken(userId);
    return beamsToken;
  } catch (error) {
    console.error("Error generating Beams token:", error);
    throw error;
  }
};

export default {
  sendPushNotification,
  sendPushNotificationToUsers,
  sendPushNotificationToInterest,
  generateBeamsToken,
  beamsClient,
};
