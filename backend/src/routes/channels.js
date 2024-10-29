// backend/src/routes/channels.js
import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import * as channelController from "../controllers/channelController.js";
import { uploadChannel } from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get channel
router.get("/:id", channelController.getChannel);

// Create channel
router.post(
  "/",
  uploadChannel,
  channelController.createChannel
);

// Update channel
router.put(
  "/:id",
  uploadChannel,
  channelController.updateChannel
);

// Delete channel
router.delete(
  "/:id",
  channelController.deleteChannel
);

// Get channel videos
router.get("/:id/videos", channelController.getChannelVideos);

// Get channel statistics
router.get("/:id/stats", channelController.getChannelStats);

export default router;

router.get('/:id/subscription', channelController.checkSubscription);
router.post('/:id/subscription', channelController.subscribe);
router.delete('/:id/subscription', channelController.unsubscribe);
router.get('/:id/subscribers', channelController.getSubscriberCount);