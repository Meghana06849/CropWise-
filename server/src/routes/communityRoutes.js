import { Router } from "express";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getPosts,
  toggleLikePost,
  updatePost
} from "../controllers/communityController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  addCommentValidation,
  createPostValidation,
  deleteCommentValidation,
  deletePostValidation,
  getPostsValidation,
  likePostValidation,
  updatePostValidation
} from "../validators/communityValidators.js";
import { validateRequest } from "../utils/validate.js";

const router = Router();

router.post("/posts", requireAuth, createPostValidation, validateRequest, createPost);
router.get("/posts", getPostsValidation, validateRequest, getPosts);
router.patch("/posts/:id", requireAuth, updatePostValidation, validateRequest, updatePost);
router.delete("/posts/:id", requireAuth, deletePostValidation, validateRequest, deletePost);
router.post("/posts/:id/comment", requireAuth, addCommentValidation, validateRequest, addComment);
router.delete(
  "/posts/:postId/comment/:commentId",
  requireAuth,
  deleteCommentValidation,
  validateRequest,
  deleteComment
);
router.post("/posts/:id/like", requireAuth, likePostValidation, validateRequest, toggleLikePost);

export default router;
