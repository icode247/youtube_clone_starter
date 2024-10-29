// backend/src/controllers/videoController.js
import { db, storage } from "../config/firebase.js";
export async function listVideos(req, res) {
  try {
    const { filter, limit = 20 } = req.query;
    let videosQuery = db.collection("videos");

    if (filter === "trending") {
      videosQuery = videosQuery.orderBy("views", "desc").limit(parseInt(limit));
    } else {
      videosQuery = videosQuery
        .orderBy("createdAt", "desc")
        .limit(parseInt(limit));
    }

    const snapshot = await videosQuery.get();
    const videos = [];

    for (const doc of snapshot.docs) {
      const video = { id: doc.id, ...doc.data() };

      videos.push(video);
    }

    res.json(videos);
  } catch (error) {
    console.error("Error listing videos:", error);
    res.status(500).json({ error: "Failed to list videos" });
  }
}

export async function getVideo(req, res) {
  try {
    const { id } = req.params;
    const videoDoc = await db.collection("videos").doc(id).get();

    if (!videoDoc.exists) {
      return res.status(404).json({ error: "Video not found" });
    }

    const video = { id: videoDoc.id, ...videoDoc.data() };

    // Increment view count
    await videoDoc.ref.update({
      views: (video.views || 0) + 1,
    });

    res.json(video);
  } catch (error) {
    console.error("Error getting video:", error);
    res.status(500).json({ error: "Failed to get video" });
  }
}

export async function createVideo(req, res) {
  try {
    const { title, description, visibility = "public" } = req.body;
    // Check if files exist
    if (!req.files?.videoFile?.[0]) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const videoFile = req.files.videoFile[0];
    const thumbnailFile = req.files.thumbnailFile?.[0];

    // Upload video to Firebase Storage
    const videoFileName = `videos/${req.user.uid}/${Date.now()}_${
      videoFile.originalname
    }`;
    const videoRef1 = storage.bucket().file(videoFileName);

    await videoRef1.save(videoFile.buffer, {
      metadata: {
        contentType: videoFile.mimetype,
      },
    });

    const [videoUrl] = await videoRef1.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailFile) {
      const thumbnailFileName = `thumbnails/${req.user.uid}/${Date.now()}_${
        thumbnailFile.originalname
      }`;
      const thumbnailRef = storage.bucket().file(thumbnailFileName);

      await thumbnailRef.save(thumbnailFile.buffer, {
        metadata: {
          contentType: thumbnailFile.mimetype,
        },
      });

      [thumbnailUrl] = await thumbnailRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
    }

    // Create video document
    const videoRef = await db.collection("videos").add({
      title,
      description,
      visibility,
      videoUrl,
      thumbnailUrl,
      channelId: req.user.uid,
      userName: "req.user.name",
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    });

    // Get the created document
    const videoDoc = await videoRef.get();

    res.status(201).json({
      id: videoRef.id,
      ...videoDoc.data(),
    });
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ error: "Failed to create video" });
  }
}

export async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const likeDoc = db
      .collection("likes")
      .where("videoId", "==", id)
      .where("userId", "==", userId);

    const snapshot = await likeDoc.get();

    if (snapshot.empty) {
      // Add like
      await db.collection("likes").add({
        videoId: id,
        userId,
        createdAt: new Date().toISOString(),
      });

      await db
        .collection("videos")
        .doc(id)
        .update({
          likes: admin.firestore.FieldValue.increment(1),
        });

      res.json({ liked: true });
    } else {
      // Remove like
      await snapshot.docs[0].ref.delete();

      await db
        .collection("videos")
        .doc(id)
        .update({
          likes: admin.firestore.FieldValue.increment(-1),
        });

      res.json({ liked: false });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
}

export async function getLikes(req, res) {
  try {
    const { id } = req.params;

    const videoDoc = await db.collection("videos").doc(id).get();
    if (!videoDoc.exists) {
      return res.status(404).json({ error: "Video not found" });
    }

    const likes = videoDoc.data().likes || 0;
    res.json({ likes });
  } catch (error) {
    console.error("Error getting likes:", error);
    res.status(500).json({ error: "Failed to get likes" });
  }
}
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const commentDoc = await db.collection("comments").add({
      videoId: id,
      userId: req.user.uid,
      userName: req.user.name,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
    });

    // Increment comment count
    await db
      .collection("videos")
      .doc(id)
      .update({
        comments: admin.firestore.FieldValue.increment(1),
      });

    res.status(201).json({
      id: commentDoc.id,
      ...commentDoc.data(),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
}

export async function getComments(req, res) {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const commentsQuery = db
      .collection("comments")
      .where("videoId", "==", id)
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const snapshot = await commentsQuery.get();
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(comments);
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Failed to get comments" });
  }
}

export async function updateVideo(req, res) {
  try {
    const { id } = req.params;
    const { title, description, visibility } = req.body;
    const { thumbnailFile } = req.files || {};

    // Get video document
    const videoRef = db.collection("videos").doc(id);
    const videoDoc = await videoRef.get();

    if (!videoDoc.exists) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if user is the owner
    if (videoDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Not video owner" });
    }

    // Prepare update data
    const updateData = {
      title,
      description,
      visibility,
      updatedAt: new Date().toISOString(),
    };

    // Upload new thumbnail if provided
    if (thumbnailFile) {
      const thumbnailFileName = `thumbnails/${req.user.uid}/${Date.now()}_${
        thumbnailFile.name
      }`;
      const thumbnailRef = storage.bucket().file(thumbnailFileName);
      await thumbnailRef.save(thumbnailFile.buffer);

      const [thumbnailUrl] = await thumbnailRef.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });

      updateData.thumbnailUrl = thumbnailUrl;

      // Delete old thumbnail if exists
      if (videoDoc.data().thumbnailUrl) {
        try {
          const oldThumbnailPath = new URL(
            videoDoc.data().thumbnailUrl
          ).pathname
            .split("/")
            .pop();
          await storage
            .bucket()
            .file(`thumbnails/${req.user.uid}/${oldThumbnailPath}`)
            .delete();
        } catch (error) {
          console.error("Error deleting old thumbnail:", error);
        }
      }
    }

    // Update video document
    await videoRef.update(updateData);

    // Get updated video
    const updatedVideo = await videoRef.get();
    res.json({
      id: updatedVideo.id,
      ...updatedVideo.data(),
    });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
}

export async function deleteVideo(req, res) {
  try {
    const { id } = req.params;

    // Get video document
    const videoRef = db.collection("videos").doc(id);
    const videoDoc = await videoRef.get();

    if (!videoDoc.exists) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if user is the owner
    if (videoDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Not video owner" });
    }

    const videoData = videoDoc.data();

    // Delete video file from storage
    if (videoData.videoUrl) {
      try {
        const videoPath = new URL(videoData.videoUrl).pathname.split("/").pop();
        await storage
          .bucket()
          .file(`videos/${req.user.uid}/${videoPath}`)
          .delete();
      } catch (error) {
        console.error("Error deleting video file:", error);
      }
    }

    // Delete thumbnail from storage
    if (videoData.thumbnailUrl) {
      try {
        const thumbnailPath = new URL(videoData.thumbnailUrl).pathname
          .split("/")
          .pop();
        await storage
          .bucket()
          .file(`thumbnails/${req.user.uid}/${thumbnailPath}`)
          .delete();
      } catch (error) {
        console.error("Error deleting thumbnail:", error);
      }
    }

    // Delete all comments for this video
    const commentsSnapshot = await db
      .collection("comments")
      .where("videoId", "==", id)
      .get();

    const commentDeletePromises = commentsSnapshot.docs.map((doc) =>
      doc.ref.delete()
    );
    await Promise.all(commentDeletePromises);

    // Delete all likes for this video
    const likesSnapshot = await db
      .collection("likes")
      .where("videoId", "==", id)
      .get();

    const likeDeletePromises = likesSnapshot.docs.map((doc) =>
      doc.ref.delete()
    );
    await Promise.all(likeDeletePromises);

    // Delete video document
    await videoRef.delete();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
}
