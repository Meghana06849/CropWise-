import mongoose from "mongoose";
import CommunityPost from "../models/CommunityPost.js";
import CommunityComment from "../models/CommunityComment.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

const isOwnerOrAdmin = (resourceOwnerId, user) => {
  if (user?.role === "admin") return true;
  if (!resourceOwnerId) return false;
  return String(resourceOwnerId) === String(user?._id);
};

export const createPost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.create({
    ...req.body,
    author_name: req.user?.name || req.body.author_name,
    createdBy: req.user?._id || null
  });

  req.app.get("io")?.emit("community:postCreated", post);

  res.status(201).json({
    success: true,
    data: post
  });
});

export const getPosts = asyncHandler(async (req, res) => {
  const { category, state, district, crop_name, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (state) filter.state = state;
  if (district) filter.district = district;
  if (crop_name) filter.crop_name = crop_name;

  if (search) {
    filter.$text = { $search: search };
  }

  const posts = await CommunityPost.find(filter).sort({ createdAt: -1 }).lean();

  const postIds = posts.map((post) => post._id);
  const comments = await CommunityComment.find({ post_id: { $in: postIds } })
    .sort({ createdAt: 1 })
    .lean();

  const commentsByPost = comments.reduce((acc, comment) => {
    const key = String(comment.post_id);
    if (!acc[key]) acc[key] = [];
    acc[key].push(comment);
    return acc;
  }, {});

  const mergedPosts = posts.map((post) => ({
    ...post,
    comments: commentsByPost[String(post._id)] || []
  }));

  res.json({
    success: true,
    count: mergedPosts.length,
    data: mergedPosts
  });
});

export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post id", 400);
  }

  const postExists = await CommunityPost.exists({ _id: id });
  if (!postExists) {
    throw new AppError("Post not found", 404);
  }

  const comment = await CommunityComment.create({
    post_id: id,
    content,
    author_name: req.user?.name,
    createdBy: req.user?._id || null
  });

  req.app.get("io")?.emit("community:commentCreated", {
    postId: id,
    comment
  });

  res.status(201).json({
    success: true,
    data: comment
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post id", 400);
  }

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (!isOwnerOrAdmin(post.createdBy, req.user)) {
    throw new AppError("You are not allowed to update this post", 403);
  }

  const allowedFields = [
    "title",
    "content",
    "category",
    "photo_url",
    "crop_name",
    "state",
    "district"
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      post[field] = req.body[field];
    }
  }

  await post.save();
  req.app.get("io")?.emit("community:postUpdated", post);

  res.json({
    success: true,
    data: post
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post id", 400);
  }

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (!isOwnerOrAdmin(post.createdBy, req.user)) {
    throw new AppError("You are not allowed to delete this post", 403);
  }

  await CommunityComment.deleteMany({ post_id: id });
  await CommunityPost.findByIdAndDelete(id);

  req.app.get("io")?.emit("community:postDeleted", { postId: id });

  res.json({
    success: true,
    message: "Post deleted successfully"
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
    throw new AppError("Invalid post/comment id", 400);
  }

  const comment = await CommunityComment.findOne({ _id: commentId, post_id: postId });
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (!isOwnerOrAdmin(comment.createdBy, req.user)) {
    throw new AppError("You are not allowed to delete this comment", 403);
  }

  await CommunityComment.findByIdAndDelete(commentId);

  req.app.get("io")?.emit("community:commentDeleted", { postId, commentId });

  res.json({
    success: true,
    message: "Comment deleted successfully"
  });
});

export const toggleLikePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid post id", 400);
  }

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const identity = String(req.user._id).trim();
  const alreadyLiked = post.liked_by.includes(identity);

  if (alreadyLiked) {
    post.liked_by = post.liked_by.filter((entry) => entry !== identity);
  } else {
    post.liked_by.push(identity);
  }

  post.likes = post.liked_by.length;
  await post.save();

  req.app.get("io")?.emit("community:postLiked", {
    postId: String(post._id),
    likes: post.likes,
    liked: !alreadyLiked
  });

  res.json({
    success: true,
    liked: !alreadyLiked,
    likes: post.likes,
    data: post
  });
});
