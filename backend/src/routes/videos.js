// backend/src/routes/videos.js
import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import * as videoController from "../controllers/videoController.js";
import { uploadVideo } from "../middleware/upload.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/", videoController.listVideos);

router.get("/:id", videoController.getVideo);

router.post("/", uploadVideo, videoController.createVideo);

router.put("/:id", videoController.updateVideo);

router.delete("/:id", videoController.deleteVideo);

router.post("/:id/like", videoController.toggleLike);

router.get("/:id/like", videoController.getLikes);
router.post("/:id/comments", videoController.addComment);

router.get("/:id/comments", videoController.getComments);

export default router;
