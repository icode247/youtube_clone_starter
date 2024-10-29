// backend/src/controllers/channelController.js
import { db, storage } from "../config/firebase.js";
export async function getChannel(req, res) {
  try {
    const { id } = req.params;
    const channelDoc = await db.collection("channels").doc(id).get();

    if (!channelDoc.exists) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const channel = { id: channelDoc.id, ...channelDoc.data() };

    res.json(channel);
  } catch (error) {
    console.error("Error getting channel:", error);
    res.status(500).json({ error: "Failed to get channel" });
  }
}

export async function updateChannel(req, res) {
  try {
    const { id } = req.params;
    const { name, description, customization } = req.body;
    let avatarFile;
    let bannerFile;

    // Check if files exist in req.files
    if (req.files?.avatarFile?.[0]) {
      avatarFile = req.files.avatarFile[0];
    }
    if (req.files?.bannerFile?.[0]) {
      bannerFile = req.files.bannerFile[0];
    }

    const channelRef = db.collection("channels").doc(id);
    const channelDoc = await channelRef.get();

    if (!channelDoc.exists) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Check ownership
    if (id !== req.user.uid) {
      return res.status(403).json({ error: "Not channel owner" });
    }

    // Create updates object only with defined values
    const updates = {};

    // Only add fields if they are defined
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (avatarFile) {
      const avatarFileName = `channels/${req.user.uid}/avatar_${Date.now()}_${
        avatarFile.originalname
      }`;
      const avatarRef = storage.bucket().file(avatarFileName);
      await avatarRef.save(avatarFile.buffer, {
        metadata: {
          contentType: avatarFile.mimetype,
        },
      });
      const [avatarUrl] = await avatarRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      updates.avatarUrl = avatarUrl;

      // Delete old avatar if exists
      if (channelDoc.data().avatarUrl) {
        try {
          const oldAvatarPath = new URL(channelDoc.data().avatarUrl).pathname
            .split("/")
            .pop();
          const oldAvatarRef = storage
            .bucket()
            .file(`channels/${req.user.uid}/${oldAvatarPath}`);
          await oldAvatarRef.delete();
        } catch (error) {
          console.error("Error deleting old avatar:", error);
        }
      }
    }

    if (bannerFile) {
      const bannerFileName = `channels/${req.user.uid}/banner_${Date.now()}_${
        bannerFile.originalname
      }`;
      const bannerRef = storage.bucket().file(bannerFileName);
      await bannerRef.save(bannerFile.buffer, {
        metadata: {
          contentType: bannerFile.mimetype,
        },
      });
      const [bannerUrl] = await bannerRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      updates.bannerUrl = bannerUrl;

      // Delete old banner if exists
      if (channelDoc.data().bannerUrl) {
        try {
          const oldBannerPath = new URL(channelDoc.data().bannerUrl).pathname
            .split("/")
            .pop();
          const oldBannerRef = storage
            .bucket()
            .file(`channels/${req.user.uid}/${oldBannerPath}`);
          await oldBannerRef.delete();
        } catch (error) {
          console.error("Error deleting old banner:", error);
        }
      }
    }

    if (customization) {
      updates.customization = {
        ...channelDoc.data().customization,
        ...customization,
      };
    }

    // Only perform update if there are changes
    if (Object.keys(updates).length > 0) {
      await channelRef.update(updates);
    }

    // Get updated channel data
    const updatedDoc = await channelRef.get();
    res.json({
      id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ error: "Failed to update channel" });
  }
}
export async function createChannel(req, res) {
  try {
    const { name, description } = req.body;
    const avatarFile = req.files?.avatarFile?.[0];
    const bannerFile = req.files?.bannerFile?.[0];

    let avatarUrl = null;
    if (avatarFile) {
      const avatarFileName = `channels/${req.user.uid}/avatar_${Date.now()}_${
        avatarFile.originalname
      }`;
      const avatarRef = storage.bucket().file(avatarFileName);
      await avatarRef.save(avatarFile.buffer, {
        metadata: {
          contentType: avatarFile.mimetype,
        },
      });
      const [avatarSignedUrl] = await avatarRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      avatarUrl = avatarSignedUrl;
    }

    let bannerUrl = null;
    if (bannerFile) {
      const bannerFileName = `channels/${req.user.uid}/banner_${Date.now()}_${
        bannerFile.originalname
      }`;
      const bannerRef = storage.bucket().file(bannerFileName);
      await bannerRef.save(bannerFile.buffer, {
        metadata: {
          contentType: bannerFile.mimetype,
        },
      });
      const [bannerSignedUrl] = await bannerRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      bannerUrl = bannerSignedUrl;
    }

    await db
      .collection("channels")
      .doc(req.user.uid)
      .set({
        name,
        description,
        avatarUrl,
        bannerUrl,
        userName: name,
        createdAt: new Date().toISOString(),
        subscribers: 0,
        totalViews: 0,
        customization: {
          theme: "default",
          layout: "grid",
        },
      });

    const channelRef = db.collection("channels").doc(req.user.uid);
    const channelDoc = await channelRef.get();

    res.status(201).json({
      id: channelRef.id,
      ...channelDoc.data(),
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Failed to create channel" });
  }
}

export async function deleteChannel(req, res) {
  try {
    const { id } = req.params;

    const channelRef = db.collection("channels").doc(id);
    const channelDoc = await channelRef.get();

    if (!channelDoc.exists) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Check ownership
    if (channelDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Not channel owner" });
    }

    // Delete channel's videos
    const videosSnapshot = await db
      .collection("videos")
      .where("channelId", "==", id)
      .get();

    const deletePromises = videosSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    // Delete channel document
    await channelRef.delete();

    res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).json({ error: "Failed to delete channel" });
  }
}

export async function getChannelVideos(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const videosQuery = db
      .collection("videos")
      .where("channelId", "==", id)
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .offset(offset);

    const snapshot = await videosQuery.get();
    const videos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(videos);
  } catch (error) {
    console.error("Error getting channel videos:", error);
    res.status(500).json({ error: "Failed to get channel videos" });
  }
}

export async function getChannelStats(req, res) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const channelRef = db.collection("channels").doc(id);
    const channelDoc = await channelRef.get();

    if (!channelDoc.exists) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Get video stats
    const videosQuery = db.collection("videos").where("channelId", "==", id);

    if (startDate && endDate) {
      videosQuery
        .where("createdAt", ">=", startDate)
        .where("createdAt", "<=", endDate);
    }

    const videosSnapshot = await videosQuery.get();

    const stats = {
      totalVideos: videosSnapshot.size,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      subscriberCount: channelDoc.data().subscribers || 0,
    };

    videosSnapshot.forEach((doc) => {
      const video = doc.data();
      stats.totalViews += video.views || 0;
      stats.totalLikes += video.likes || 0;
      stats.totalComments += video.comments || 0;
    });

    res.json(stats);
  } catch (error) {
    console.error("Error getting channel stats:", error);
    res.status(500).json({ error: "Failed to get channel stats" });
  }
}

export async function checkSubscription(req, res) {
  try {
    const { id: channelId } = req.params;
    const userId = req.user.uid;

    // Check if subscription exists in subscriptions collection
    const subscriptionQuery = await db
      .collection("subscriptions")
      .where("channelId", "==", channelId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    res.json({
      isSubscribed: !subscriptionQuery.empty,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ error: "Failed to check subscription" });
  }
}

// Add subscription methods
export async function subscribe(req, res) {
  try {
    const { id: channelId } = req.params;
    const userId = req.user.uid;

    // Check if channel exists
    const channelRef = db.collection("channels").doc(channelId);
    const channelDoc = await channelRef.get();

    if (!channelDoc.exists) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Prevent self-subscription
    if (channelId === userId) {
      return res
        .status(400)
        .json({ error: "Cannot subscribe to your own channel" });
    }

    // Check if already subscribed
    const subscriptionQuery = await db
      .collection("subscriptions")
      .where("channelId", "==", channelId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (!subscriptionQuery.empty) {
      return res.status(400).json({ error: "Already subscribed" });
    }

    // Create subscription document
    await db.collection("subscriptions").add({
      channelId,
      userId,
      createdAt: new Date().toISOString(),
    });

    // Increment channel subscribers count
    await channelRef.update({
      subscribers: channelDoc.data().subscribers + 1,
    });

    res.json({
      message: "Subscribed successfully",
      isSubscribed: true,
    });
  } catch (error) {
    console.error("Error subscribing to channel:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
}

export async function unsubscribe(req, res) {
  try {
    const { id: channelId } = req.params;
    const userId = req.user.uid;

    // Check if channel exists
    const channelRef = db.collection("channels").doc(channelId);
    const channelDoc = await channelRef.get();

    if (!channelDoc.exists) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Find and delete subscription
    const subscriptionQuery = await db
      .collection("subscriptions")
      .where("channelId", "==", channelId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (subscriptionQuery.empty) {
      return res.status(400).json({ error: "Not subscribed" });
    }

    // Delete subscription document
    await subscriptionQuery.docs[0].ref.delete();

    // Decrement channel subscribers count
    await channelRef.update({
      subscribers: Math.max(0, channelDoc.data().subscribers - 1), // Prevent negative count
    });

    res.json({
      message: "Unsubscribed successfully",
      isSubscribed: false,
    });
  } catch (error) {
    console.error("Error unsubscribing from channel:", error);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
}

// Add method to get subscriber count
export async function getSubscriberCount(req, res) {
  try {
    const { id: channelId } = req.params;

    const channelRef = db.collection("channels").doc(channelId);
    const channelDoc = await channelRef.get();

    if (!channelDoc.exists) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json({
      subscribers: channelDoc.data().subscribers || 0,
    });
  } catch (error) {
    console.error("Error getting subscriber count:", error);
    res.status(500).json({ error: "Failed to get subscriber count" });
  }
}
