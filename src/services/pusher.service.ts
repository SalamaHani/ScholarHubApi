import PushNotifications from "@pusher/push-notifications-server";
import Pusher from "pusher";
import config from "../config/index.js";

// ─── Pusher Beams (browser push notifications) ────────────────────────────────

let _beamsClient: PushNotifications | null = null;

const getBeamsClient = (): PushNotifications | null => {
  const instanceId = process.env.PUSHER_INSTANCE_ID;
  const secretKey = process.env.PUSHER_SECRET_KEY;
  if (!instanceId || !secretKey) return null;
  if (!_beamsClient) {
    _beamsClient = new PushNotifications({ instanceId, secretKey });
  }
  return _beamsClient;
};

// ─── Pusher Channels (real-time WebSocket) ────────────────────────────────────

let _channels: Pusher | null = null;

const getChannels = (): Pusher | null => {
  if (!config.pusher.appId || !config.pusher.key || !config.pusher.secret) {
    return null;
  }
  if (!_channels) {
    _channels = new Pusher({
      appId: config.pusher.appId,
      key: config.pusher.key,
      secret: config.pusher.secret,
      cluster: config.pusher.cluster,
      useTLS: true,
    });
  }
  return _channels;
};

// ─── Channel name helpers ─────────────────────────────────────────────────────

/** Private channel name for a single user: `private-user-{userId}` */
export const userChannel = (userId: string) => `private-user-${userId}`;

// ─── Trigger helpers ──────────────────────────────────────────────────────────

/**
 * Trigger a real-time event on one user's private channel (WebSocket).
 *
 * Events used:
 *   new-notification      — new notification created
 *   notification-read     — single notification marked as read
 *   all-notifications-read — all notifications marked as read
 *   notification-deleted  — notification deleted
 */
export const triggerUserEvent = async (
  userId: string,
  event: string,
  data: Record<string, any>,
): Promise<void> => {
  const channels = getChannels();
  if (!channels) {
    console.warn("[Pusher Channels] Not configured — skipping real-time event");
    return;
  }
  try {
    await channels.trigger(userChannel(userId), event, data);
  } catch (error) {
    console.error("[Pusher Channels] triggerUserEvent error:", error);
  }
};

/**
 * Trigger the same event on multiple users' private channels.
 * Pusher supports up to 100 channels per trigger call — chunked automatically.
 */
export const triggerUsersEvent = async (
  userIds: string[],
  event: string,
  data: Record<string, any>,
): Promise<void> => {
  const channels = getChannels();
  if (!channels) {
    console.warn("[Pusher Channels] Not configured — skipping real-time event");
    return;
  }
  try {
    const chunkSize = 100;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize).map(userChannel);
      await channels.trigger(chunk, event, data);
    }
  } catch (error) {
    console.error("[Pusher Channels] triggerUsersEvent error:", error);
  }
};

/**
 * Authenticate a Pusher private channel subscription.
 * The frontend Pusher client calls POST /api/notifications/pusher/auth
 * with { socket_id, channel_name } — this function signs the auth token.
 */
export const authenticatePusherChannel = (
  socketId: string,
  channelName: string,
): { auth: string } => {
  const channels = getChannels();
  if (!channels) throw new Error("Pusher Channels not configured");
  return channels.authorizeChannel(socketId, channelName);
};

// ─── Pusher Beams helpers ─────────────────────────────────────────────────────

export interface PushNotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

export const sendPushNotificationToUsers = async (
  userIds: string[],
  notification: PushNotificationData,
): Promise<void> => {
  const beams = getBeamsClient();
  if (!beams) {
    console.warn("[Pusher Beams] Not configured — skipping push notification");
    return;
  }
  try {
    const interests = userIds.map((id) => `user-${id}`);
    const publishResponse = await beams.publishToInterests(interests, {
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
  }
};

export const sendPushNotification = async (
  userId: string,
  notification: PushNotificationData,
): Promise<void> => {
  return sendPushNotificationToUsers([userId], notification);
};

export const sendPushNotificationToInterest = async (
  interest: string,
  notification: PushNotificationData,
): Promise<void> => {
  const beams = getBeamsClient();
  if (!beams) {
    console.warn("[Pusher Beams] Not configured — skipping push notification");
    return;
  }
  try {
    const publishResponse = await beams.publishToInterests([interest], {
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

export const generateBeamsToken = (userId: string): any => {
  const beams = getBeamsClient();
  if (!beams) throw new Error("Pusher Beams not configured");
  try {
    return beams.generateToken(userId);
  } catch (error) {
    console.error("Error generating Beams token:", error);
    throw error;
  }
};

export default {
  // Channels (WebSocket — real-time, no polling)
  userChannel,
  triggerUserEvent,
  triggerUsersEvent,
  authenticatePusherChannel,
  // Beams (browser push)
  sendPushNotification,
  sendPushNotificationToUsers,
  sendPushNotificationToInterest,
  generateBeamsToken,
};
